const Story = require('../models/Story');
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

exports.getStories = async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createStory = async (req, res) => {
  try {
    const { title, content, category, location, consent } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Story content is missing." });
    }
    if (!consent) {
      return res.status(400).json({ message: "Consent is required to post a story." });
    }

    const prompt = `
      Analyze this user story for a legal awareness platform.
      Input: "${content}"
      
      Tasks:
      1. **Anonymize**: Replace real names, phone numbers, exact addresses, or company names with placeholders like [Name] or [Company].
      2. **Insight**: Provide a 1-sentence legal insight explaining the rights or laws involved (e.g., "This implies workplace harassment under the POSH Act.").
      3. **Safety**: Flag 'isToxic': true ONLY if it contains severe hate speech, spam, or direct violent threats.

      Output JSON format exactly like this: 
      { "redactedStory": "...", "insight": "...", "isToxic": boolean, "toxicReason": "..." }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    const analysis = JSON.parse(completion.choices[0].message.content.replace(/```json|```/g, '').trim());

 
    if (analysis.isToxic) {
      return res.status(400).json({ 
        message: "Content flagged for violation.", 
        reason: analysis.toxicReason 
      });
    }

    const newStory = new Story({
      title: title || "Untitled Experience",
      originalBody: content,
      redactedBody: analysis.redactedStory,
      insight: analysis.insight,
      category: category || "General",
      location: location || "India",
      isAnonymous: true,
      consentGiven: consent
    });

    const savedStory = await newStory.save();
    
    res.status(201).json(savedStory);

  } catch (err) {
    console.error("Story Creation/AI Error:", err);
    res.status(500).json({ message: "Failed to process and save story." });
  }
};

exports.deleteStory = async (req, res) => {
  try {
    await Story.findByIdAndDelete(req.params.id);
    res.json({ message: "Story deleted successfully." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.supportStory = async (req, res) => {
  try {
    const story = await Story.findByIdAndUpdate(
      req.params.id,
      { $inc: { supports: 1 } }, 
      { new: true }
    );
    if (!story) return res.status(404).json({ message: "Story not found" });
    res.json(story);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};