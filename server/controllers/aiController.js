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
    const prompt = `
      You are 'Sahayak AI', an Expert Multilingual Indian Legal Assistant.
      
      User Input: "${message}"

      INSTRUCTIONS:
      
      1. **DETECT & MATCH LANGUAGE (STRICT)**:
         - Identify if the user is writing in **English**, **Hindi**, or **Marathi**.
         - If **English** -> Reply in **English**.
         - If **Hindi** (or Hinglish) -> Reply in **Hindi (Devanagari script)**.
         - If **Marathi** -> Reply in **Marathi (Devanagari script)**.
         - *Special Case*: If the user asks "What language am I speaking?", simply state the detected language in that language's script.

      2. **LEGAL ACCURACY (CRITICAL)**:
         - If the user asks about a specific **IPC Section** (e.g., "IPC 379", "Section 302"), you MUST:
           a. **Identify the Correct Crime Name** (e.g., IPC 379 is THEFT/CHORI).
           b. **Explain the Offense** simply.
           c. **Mention the Punishment** (Jail term/Fine) if applicable.
         - **FACT CHECK**: Do not hallucinate. If you are unsure, say "I can only answer about Indian Laws." 
         - **Ensure IPC 379 is identified as THEFT**, not Hurt or any other crime.

      3. **FORMATTING**:
         - Keep answers concise (max 3-4 sentences).
         - Ensure the sentence is **COMPLETE**. Do not cut off mid-sentence.
         - Do not use markdown (like **bold**) excessively; keep it readable for chat.

      Reply:
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        // COMBINED SYSTEM PROMPT: Enforces both "Language Mirroring" and "Legal Expertise"
        { role: "system", content: "You are a helpful AI Legal Expert. You strictly mirror the user's language (English, Hindi, or Marathi). You provide precise, factually correct definitions for Indian Penal Code (IPC) sections." },
        { role: "user", content: prompt }
      ],
      temperature: 0.1, // Low temperature = High Precision/Factuality
      max_tokens: 350,  // Increased to ensure Hindi text doesn't get cut off
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