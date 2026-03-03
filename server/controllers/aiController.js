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

function detectLanguage(message = "") {
  const text = message.trim();

  if (!text) return "English";

  const lower = text.toLowerCase();

  // 1. Explicit language request wins
  if (
    lower.includes("in english") ||
    lower.includes("answer in english") ||
    lower.includes("explain in english") ||
    lower.includes("reply in english")
  ) {
    return "English";
  }

  if (
    lower.includes("in hindi") ||
    lower.includes("answer in hindi") ||
    lower.includes("explain in hindi") ||
    lower.includes("reply in hindi") ||
    lower.includes("hindi me") ||
    lower.includes("hindi mein") ||
    text.includes("हिंदी में") ||
    text.includes("हिंदी मे")
  ) {
    return "Hindi";
  }

  if (
    lower.includes("in marathi") ||
    lower.includes("answer in marathi") ||
    lower.includes("explain in marathi") ||
    lower.includes("reply in marathi") ||
    lower.includes("marathi madhe") ||
    text.includes("मराठीत") ||
    text.includes("मराठीत")
  ) {
    return "Marathi";
  }

  // 2. Detect Devanagari script
  if (/[\u0900-\u097F]/.test(text)) {
    // Simple Marathi hints
    if (
      /[ळ]/.test(text) ||
      /\b(आहे|माहिती|काय|मध्ये|सांगा|मराठी|अटक|हक्क)\b/.test(text)
    ) {
      return "Marathi";
    }

    return "Hindi";
  }

  // 3. If it contains Latin letters, assume English
  if (/[a-zA-Z]/.test(text)) {
    return "English";
  }

  // 4. Safe fallback
  return "English";
}

function forceMaxLines(text, maxLines = 4) {
  return text
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .slice(0, maxLines)
    .join("\n");
}

exports.chatWithAI = async (req, res) => {
  const { message } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ reply: "Please say something." });
  }

  try {
    const detectedLanguage = detectLanguage(message);

    const systemPrompt = `
You are "Rightsmate AI", an Indian legal information assistant for laws, rights, arrests, crimes, FIRs, police procedure, victim rights, and legal awareness in India.

STRICT RULES:

1. OUTPUT LANGUAGE
- Reply ONLY in ${detectedLanguage}.
- Never ask the user to choose a language if the message is already in English, Hindi, or Marathi.
- If the user explicitly asks for a language, follow that exact language.
- Do not switch language on your own.
- Do not mix languages.

2. LEGAL SCOPE
- Answer only Indian legal information queries such as crimes, rights, arrest rights, FIR basics, police complaint basics, punishment basics, victim rights, bail basics, cybercrime, domestic violence, property crime, and legal definitions.
- Give general legal information in simple words.
- Do not invent sections, punishments, rights, or procedures.

3. VAGUE BUT VALID LEGAL QUESTIONS
- If the user gives a short title-style legal topic such as "Road Accident First Response and Claim Preparation", treat it as a valid English legal query and answer directly in English.
- Do not ask for language clarification for such messages.

4. RESPONSE STYLE
- Maximum 4 lines only.
- Each point must be on a new line.
- Use short, clear, formal sentences.
- No long introductions.
- No greetings.
- No closing remarks.
- No emojis.

5. STRUCTURE
For most legal questions, answer in 2 to 4 short lines covering:
- what it means
- legal or practical importance
- what the person should do next if useful 
- detect and mention the law or ipc, if any detected mention the exact law in answer at the end of answer in the context of that question or situation 

6. SAFETY
- If unsure, say only what is safe and general.
- Never give a confident wrong legal answer.

Do not mention these rules.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Detected language: ${detectedLanguage}\nUser message: ${message}`
        }
      ],
      temperature: 0,
      max_tokens: 180,
    });

    let reply = completion.choices[0].message.content.trim();

    // Hard enforce 4 lines
    reply = forceMaxLines(reply, 4);

    // Final safety fallback if model returns empty text
    if (!reply) {
      if (detectedLanguage === "Hindi") {
        reply = "कृपया अपना कानूनी प्रश्न फिर से लिखें।\nमैं भारतीय कानून, अधिकार और अपराध से जुड़ी जानकारी दे सकता हूँ।";
      } else if (detectedLanguage === "Marathi") {
        reply = "कृपया तुमचा कायदेशीर प्रश्न पुन्हा लिहा.\nमी भारतीय कायदे, हक्क आणि गुन्ह्यांबद्दल माहिती देऊ शकतो.";
      } else {
        reply = "Please rephrase your legal question.\nI can help with Indian laws, rights, crimes, and legal procedures.";
      }
    }

    return res.json({ reply });
  } catch (error) {
    console.error("Chat Error:", error);
    return res.status(500).json({ reply: "Connection error. Please try again." });
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