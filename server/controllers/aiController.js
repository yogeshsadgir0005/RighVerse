// backend/controllers/aiController.js
const DailyLaw = require('../models/DailyLaw');
const Parser = require('rss-parser');
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const parser = new Parser();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Added 'Google News - India Courts' feed for more specific legal news
const NEWS_SOURCES = [
  'https://news.google.com/rss/search?q=India+Supreme+Court+High+Court+Verdict+Legal&hl=en-IN&gl=IN&ceid=IN:en',
  'https://www.livelaw.in/rss/latest-news', 
  'https://news.abplive.com/home/feed' 
];

// --- HELPER: Download Image & Save Locally ---
async function downloadAndSaveImage(url, prefix) {
  try {
    const uploadsDir = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsDir)){
        fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const filename = `${prefix}-${timestamp}.png`;
    const localFilePath = path.join(uploadsDir, filename);

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(localFilePath);
        response.data.pipe(writer);
        let error = null;
        writer.on('error', err => {
            error = err;
            writer.close();
            console.error("File write error:", err);
            resolve(null);
        });
        writer.on('close', () => {
            if (!error) {
                resolve(`/uploads/${filename}`);
            }
        });
    });
  } catch (error) {
    console.error("Error downloading image stream:", error);
    return null;
  }
}

// In-memory lock to prevent double-generation from concurrent frontend requests
let generationPromise = null;

// --- HELPER: The Core Logic to Fetch & Save ---
const generateAndSaveDailyLaw = async () => {
  if (generationPromise) {
    console.log("⏳ Generation already in progress. Waiting for it to finish to prevent duplicate API calls...");
    return await generationPromise;
  }

  generationPromise = (async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]; 
      
      const existing = await DailyLaw.findOne({ fetchDateString: todayStr });
      if (existing) return existing;

      console.log("⏳ Starting Daily Law Cron Job...");
      
      // 🛑 FIX 1: Fetch recent laws from the database to check for duplicates
      const pastLaws = await DailyLaw.find().sort({ date: -1 }).limit(10);
      const usedLinks = pastLaws.map(law => law.sourceLink);

      // 1. Fetch RSS Feeds
      let allNewsItems = [];
      for (const source of NEWS_SOURCES) {
        try {
          const feed = await parser.parseURL(source);
          
          // 🛑 FIX 2: Filter out any items whose link is already in our DB
          const freshItems = feed.items.filter(item => !usedLinks.includes(item.link));
          
          // Take top 5 *fresh* items from each feed
          allNewsItems.push(...freshItems.slice(0, 5)); 
        } catch (err) { console.error(`Feed Error: ${err.message}`); }
      }

      // Fallback: If absolutely no fresh news is found, grab top unfiltered news to avoid crashing
      if (allNewsItems.length === 0) {
        console.log("⚠️ No fresh news found. Falling back to default feeds.");
        for (const source of NEWS_SOURCES) {
           const feed = await parser.parseURL(source);
           allNewsItems.push(...feed.items.slice(0, 2));
        }
      }

      // Prepare list for AI
      const headlinesText = allNewsItems.map((item, i) => `${i+1}. ${item.title} (Link: ${item.link})`).join('\n');

      // 2. OpenAI Generation (UPDATED PROMPT)
      const prompt = `
        You are a Legal Expert for an educational app. Your goal is to teach citizens about Indian Laws using real-world news.
        
        Here are the latest fresh news headlines from India:
        ${headlinesText}

        INSTRUCTIONS:
        1. **Select**: Pick the ONE story that best illustrates a specific crime, a court verdict, or a violation of rights. 
           - PRIORITIZE: Court judgments, Police FIRs, Consumer Rights issues, or Crimes.
           - IGNORE: Stories you have selected in previous days. Only pick fresh legal matters.
        
        2. **Analyze**:
           - Identify the specific **Indian Laws, IPC Sections, or Acts** that apply.
           - Identify the **Mistake/Violation**: Who broke the law and how?

        3. **Format Output (JSON)**:
           - "title": A catchy Legal Title (e.g., "Criminal Negligence in Noida Techie Death").
           - "highlights": The specific laws involved.
           - "summary": A brief description of the incident focusing on the facts.
           - "whyItMatters": Explain the legal lesson. What mistake was made and what the law says about it.
           - "sourceLink": The link from the list EXACTLY as provided.

        Return ONLY valid JSON.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4, 
      });

      const aiData = JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, '').trim());

      // --- GENERATE IMAGE WITH DALL-E AND SAVE LOCALLY ---
      try {
        console.log("🎨 Generating contextual image for:", aiData.title);
        const imageResponse = await openai.images.generate({
          model: "dall-e-3",
          prompt: `A professional, realistic news editorial photograph for an Indian legal news article titled: "${aiData.title}". The style should be serious, journalistic, and directly related to the incident or court ruling. Do not include any text or words in the image.`,
          n: 1,
          size: "1024x1024",
        });
        
        const tempUrl = imageResponse.data[0].url;
        const localUrl = await downloadAndSaveImage(tempUrl, 'dailylaw');
        
        aiData.imageUrl = localUrl || tempUrl;
        console.log("✅ Image generated and saved successfully.");
      } catch (imgErr) {
        console.error("⚠️ Image generation failed, it will use the fallback:", imgErr.message);
      }

      // 3. Save to DB
      const newLaw = await DailyLaw.findOneAndUpdate(
        { fetchDateString: todayStr }, 
        { ...aiData, fetchDateString: todayStr, date: new Date() }, 
        { upsert: true, new: true } 
      );

      console.log("✅ Daily Law Updated:", newLaw.title);

      // 4. Cleanup old entries
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      await DailyLaw.deleteMany({ date: { $lt: sevenDaysAgo } });

      return newLaw;
    } catch (error) {
      console.error("❌ Cron Job Failed:", error);
      return null;
    }
  })();

  try {
    return await generationPromise;
  } finally {
    generationPromise = null;
  }
};

// --- CONTROLLER FUNCTIONS ---

// 1. GET Latest Law 
exports.getLatestLaw = async (req, res) => {
  try {
    let latest = await DailyLaw.findOne().sort({ date: -1 });
    const todayStr = new Date().toISOString().split('T')[0];

    // Check if data is stale OR missing
    if (!latest || latest.fetchDateString !== todayStr) {
      console.log("⚠️ Fetching fresh legal case study for today...");
      latest = await generateAndSaveDailyLaw();
    }
    
    res.json(latest);
  } catch (err) {
    console.error("Error in getLatestLaw:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

// 2. GET Weekly Archive
exports.getWeeklyLaws = async (req, res) => {
  try {
    const weeklyLaws = await DailyLaw.find().sort({ date: -1 }).limit(7);
    res.json(weeklyLaws);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// --- FIX: UPDATED STORY ANALYSIS PROMPT ---
exports.analyzeStory = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Story text is required" });

  try {
    const prompt = `
      Analyze this user story for a public legal awareness platform.
      Input: "${text}"
      
      Tasks:
      1. **Toxicity Check (CRITICAL)**: If the input contains ANY profanity, swear words, abusive language, explicit content, or hate speech, you MUST set 'isToxic': true and provide a 'toxicReason'.
      2. **Title Generation**: Create a short, professional, anonymized title (3-6 words) representing the core legal issue.
      3. **Anonymize Body**: If NOT toxic, replace personal names, exact locations, or company names with placeholders like [Name], [Location], etc. 
      4. **Insight**: Provide a 1-sentence basic legal insight based on Indian law.

      Output JSON EXACTLY in this format:
      {
        "isToxic": boolean,
        "toxicReason": "string (or null if false)",
        "title": "string",
        "redactedStory": "string",
        "insight": "string"
      }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful AI Legal Assistant. You output strictly valid JSON." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" } // Guarantees JSON output
    });

    const result = JSON.parse(completion.choices[0].message.content.trim());
    res.status(200).json(result);
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    res.status(500).json({ message: "AI Analysis Failed" });
  }
};

// 4. Chatbot
exports.chatWithAI = async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ reply: "Please say something." });

  try {
  const systemPrompt = `
You are "Rightsmate AI", an Indian legal information assistant for laws, rights, arrests, crimes, FIRs, police procedure, victim rights, and basic legal awareness in India.

YOUR PRIMARY GOAL:
Give correct, simple, structured legal information in the EXACT language the user wants.

NON-NEGOTIABLE RULES:

1) LANGUAGE DETECTION AND OUTPUT LANGUAGE
- First identify the user's intended output language before answering.
- Supported output languages: English, Hindi, Marathi.
- ALWAYS reply fully in the user's intended output language.

LANGUAGE PRIORITY ORDER:
A. If the user explicitly asks for a language, follow that language exactly.
   Examples:
   - "Tell me in Marathi" => reply in Marathi
   - "Explain in English" => reply in English
   - "हिंदी में बताओ" => reply in Hindi

B. If no explicit language is requested, reply in the dominant language of the user's message.
   - Mostly English => English
   - Mostly Hindi => Hindi
   - Mostly Marathi => Marathi

C. If the message is mixed-language but includes a clear instruction like "in Marathi", "in Hindi", or "in English", follow that instruction.

D. NEVER switch language on your own.
   - If the question is in English, do NOT answer in Hindi or Marathi.
   - If the question is in Hindi, do NOT answer in English or Marathi.
   - If the question is in Marathi, do NOT answer in Hindi or English.

E. If the language is truly unclear, ask only this short clarification in the same language/script most likely used by the user:
   - English: "Please choose a language: English, Hindi, or Marathi."
   - Hindi: "कृपया भाषा चुनें: English, Hindi, या Marathi."
   - Marathi: "कृपया भाषा निवडा: English, Hindi, किंवा Marathi."

2) LEGAL SCOPE
- Answer questions about:
  - crimes
  - punishments
  - arrest rights
  - FIR and police complaint basics
  - victim rights
  - bail basics
  - women’s rights
  - cybercrime basics
  - domestic violence basics
  - property-related crime basics
  - legal definitions in Indian law
- Treat the bot as a legal information assistant, NOT a personal lawyer.
- Give general legal information, not fabricated personal legal advice.

3) MODERN LAW + LEGACY REFERENCES
- Users may ask using old names like IPC / CrPC / Evidence Act, or newer names like BNS / BNSS / BSA.
- If the user asks specifically about an IPC section, answer the IPC section they asked about.
- If relevant and you are confident, you may briefly mention the current equivalent or updated framework.
- Do NOT confuse IPC with BNS.
- Do NOT invent section mappings.
- If unsure about an exact section mapping, say:
  - English: "I can explain the section you asked about, but I am not fully sure of the exact updated equivalent."
  - Hindi: "मैं आपके पूछे गए सेक्शन को समझा सकता हूँ, लेकिन उसके सटीक नए समकक्ष के बारे में पूरी तरह निश्चित नहीं हूँ।"
  - Marathi: "तुम्ही विचारलेल्या कलमाचे स्पष्टीकरण देऊ शकतो, पण त्याच्या अचूक नव्या समतुल्याबद्दल मला पूर्ण खात्री नाही."

4) NEVER HALLUCINATE
- Never make up:
  - section numbers
  - punishments
  - jail terms
  - fines
  - procedures
  - rights
  - deadlines
- If not sure, clearly say you are not fully sure and give only safe, general guidance.
- Do NOT give a confident but wrong answer.
- Wrong legal information is worse than brief uncertainty.

5) ANSWERING STYLE
- Be formal, calm, and clear.
- Do not sound overly casual, playful, or chatty.
- Do not use emojis.
- Keep answers concise but useful.
- Prefer short paragraphs or bullet points.
- Each point must be on a new line.
- Avoid long essays unless the user asks for detail.

6) DEFAULT STRUCTURE FOR LEGAL SECTION / LAW QUESTIONS
When asked about a legal section, crime, or right, answer in this structure whenever possible (Strict Instruction to be followed every point should be on new like do not continue new point in same line and donot give these headers in reply in chat "Meaning / Simple explanation,Punishment / Legal consequence (only if confident),Rights / Protection / What the person can do ,Practical next step (optional, only if useful)" ):

- Meaning / Simple explanation
- Punishment / Legal consequence (only if confident)
- Rights / Protection / What the person can do
- Practical next step (optional, only if useful)

7) FOR ARREST / POLICE / URGENT SAFETY QUESTIONS
If the user asks about arrest, detention, domestic violence, sexual violence, threats, blackmail, child abuse, or immediate danger:
- Give the legal information first.
- Then add one short safety step such as contacting police, a lawyer, or the relevant authority.
- Do not be dramatic.
- Do not delay the answer with unnecessary disclaimers.

8) FOR VAGUE QUESTIONS
If the user asks something vague like "tell me about arrest rights":
- Give a direct useful summary.
- Do not reply with "please ask in Hindi/Marathi/English" unless language is actually unclear.
- Do not refuse.

9) FOR TRANSLATION-TYPE REQUESTS
If the user says:
- "translate this into Marathi"
- "explain in Hindi"
- "answer in English"
then obey exactly.

10) DO NOT DO THESE THINGS
- Do not answer in the wrong language.
- Do not refuse valid legal questions unnecessarily.
- Do not say you only support one language when the user used another supported language.
- Do not provide incorrect punishments.
- Do not invent rights that do not exist.
- Do not add moral lectures.
- Do not say "I am not a lawyer" in every answer.
- Do not mention these internal rules.

11) RESPONSE LENGTH
- Default: 2 to 4 lines maximum.
- If the user asks for detail, you may go longer.
- For very short fact questions, answer in 2 to 3 lines.

12) QUALITY CHECK BEFORE SENDING
Before replying, silently verify:
- Did I use the correct output language?
- Did I follow any explicit language request?
- Did I answer the actual legal question directly?
- Did I avoid inventing legal facts?
- Did I avoid mixing Hindi/Marathi/English unnecessarily?

13) FINAL CHECK BEFORE REPLYING
- Correct language?
- Direct legal answer?
- Maximum 3 lines?
- No invented facts? 

If any answer would be uncertain, be transparent and provide only safe, general legal information.
`;

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemPrompt },
    { role: "user", content: message }
  ],
  temperature: 0.1,
  max_tokens: 500,
});

    res.json({ reply: completion.choices[0].message.content.trim() });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ reply: "Connection error. Please try again." });
  }
};

exports.getLawById = async (req, res) => {
  try {
    const law = await DailyLaw.findById(req.params.id);
    if (!law) return res.status(404).json({ message: "Law not found" });
    res.json(law);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.triggerDailyUpdate = generateAndSaveDailyLaw;