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
  // If a generation is already in progress, wait for it instead of starting a new one
  if (generationPromise) {
    console.log("⏳ Generation already in progress. Waiting for it to finish to prevent duplicate API calls...");
    return await generationPromise;
  }

  generationPromise = (async () => {
    try {
      const todayStr = new Date().toISOString().split('T')[0]; 
      
      // Double check if it was created just before this lock was engaged
      const existing = await DailyLaw.findOne({ fetchDateString: todayStr });
      if (existing) return existing;

      console.log("⏳ Starting Daily Law Cron Job...");
      
      // 1. Fetch RSS Feeds
      let allNewsItems = [];
      for (const source of NEWS_SOURCES) {
        try {
          const feed = await parser.parseURL(source);
          // Take top 5 from each to give AI more options to find a "teachable" case
          allNewsItems.push(...feed.items.slice(0, 5)); 
        } catch (err) { console.error(`Feed Error: ${err.message}`); }
      }

      // Prepare list for AI
      const headlinesText = allNewsItems.map((item, i) => `${i+1}. ${item.title} (Link: ${item.link})`).join('\n');

      // 2. OpenAI Generation (UPDATED PROMPT)
      const prompt = `
        You are a Legal Expert for an educational app. Your goal is to teach citizens about Indian Laws using real-world news.
        
        Here are the latest news headlines from India:
        ${headlinesText}

        INSTRUCTIONS:
        1. **Select**: Pick the ONE story that best illustrates a specific crime, a court verdict, or a violation of rights. 
           - PRIORITIZE: Court judgments, Police FIRs, Consumer Rights issues, or Crimes (Murder, Fraud, Negligence).
           - IGNORE: Cricket/Sports (unless court-related), Celebrity gossip, or Political party statements.
        
        2. **Analyze**:
           - Identify the specific **Indian Laws, IPC Sections, or Acts** that apply to this case (even if the headline doesn't explicitly name them, YOU must infer them based on the crime).
           - Identify the **Mistake/Violation**: Who broke the law and how?

        3. **Format Output (JSON)**:
           - "title": A catchy Legal Title (e.g., "Criminal Negligence in Noida Techie Death" instead of just "Techie Dies").
           - "highlights": The specific laws involved (e.g., "Section 304A IPC (Negligence), Section 34 IPC").
           - "summary": A brief description of the incident focusing on the facts.
           - "whyItMatters": Explain the legal lesson. Mention what mistake was made and what the law says about it. (e.g., "The builders failed to provide safety barriers, attracting criminal liability under negligence laws. Citizens have a right to safe public infrastructure.")
           - "sourceLink": The link from the list.

        Return ONLY valid JSON.
      `;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.4, // Lower temperature to be more factual/analytical
      });

      const aiData = JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, '').trim());

      // --- NEW: GENERATE IMAGE WITH DALL-E AND SAVE LOCALLY ---
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
        
        // Attach the generated local URL (or fallback) to our data object
        aiData.imageUrl = localUrl || tempUrl;
        console.log("✅ Image generated and saved successfully.");
      } catch (imgErr) {
        console.error("⚠️ Image generation failed, it will use the fallback:", imgErr.message);
      }
      // ---------------------------------------

      // 3. Save to DB
      const newLaw = await DailyLaw.findOneAndUpdate(
        { fetchDateString: todayStr }, 
        { ...aiData, fetchDateString: todayStr, date: new Date() }, 
        { upsert: true, new: true } 
      );

      console.log("✅ Daily Law Updated:", newLaw.title);

      // 4. Cleanup
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      await DailyLaw.deleteMany({ date: { $lt: sevenDaysAgo } });

      return newLaw;
    } catch (error) {
      console.error("❌ Cron Job Failed:", error);
      return null;
    }
  })(); // Execute the async IIFE and store the promise

  try {
    return await generationPromise;
  } finally {
    // Release the lock once generation is complete
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

// 3. Story Analysis (Moderation)
exports.analyzeStory = async (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ message: "Story text is required" });

  try {
    const prompt = `
      Analyze this user story for a legal awareness platform.
      Input: "${text}"
      
      Tasks:
      1. **Anonymize**: Replace names/phones/locations with placeholders like [Name].
      2. **Insight**: Provide a 1-sentence legal insight (e.g. "This implies harassment under Section 354 IPC").
      3. **Safety**: Flag 'isToxic': true ONLY if it contains hate speech/threats (not just describing a crime).

      Output JSON: { "redactedStory": "...", "insight": "...", "isToxic": boolean, "toxicReason": "..." }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, '').trim());
    res.status(200).json(result);
  } catch (error) {
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