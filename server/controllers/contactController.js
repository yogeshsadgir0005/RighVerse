const Contact = require('../models/Contact');
const axios = require('axios');

exports.submitContactForm = async (req, res) => {
  console.log("--- New Contact Form Submission Received ---");
  console.log("Request Body Received:", req.body);

  try {
    const { name, email, subject, message } = req.body;

    // 1. Save to Database
    console.log("Attempting to save to database...");
    const newContact = new Contact({ name, email, subject, message });
    await newContact.save();
    console.log("✅ Successfully saved contact to database. Record ID:", newContact._id);

    // 2. Send Email via Brevo API
    console.log("Preparing to send email via Brevo...");
    const brevoApiKey = process.env.BREVO_API_KEY; 
    const receiverEmail = process.env.RECEIVER_EMAIL; // This is yogeshsadgir05@gmail.com

    // Safety check for ENV variables
    if (!brevoApiKey || !receiverEmail) {
      console.error("❌ CRITICAL ERROR: Missing BREVO_API_KEY or RECEIVER_EMAIL in environment variables!");
      return res.status(500).json({ success: false, message: 'Server configuration error' });
    }

    const emailData = {
      // 👇 CRITICAL FIX: The sender email MUST be the one verified in your Brevo account
      sender: { name: "Platform Contact Form", email: receiverEmail }, 
      to: [{ email: receiverEmail, name: "Admin" }],
      replyTo: { email: email, name: name }, // If you hit "reply", it will reply to the user's email
      subject: `New Contact Inquiry: ${subject}`,
      htmlContent: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `
    };

    console.log("Sending payload to Brevo API:", JSON.stringify(emailData, null, 2));

    const brevoResponse = await axios.post('https://api.brevo.com/v3/smtp/email', emailData, {
      headers: {
        'api-key': brevoApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log("✅ Brevo API Call Successful! Message ID:", brevoResponse.data.messageId);
    res.status(200).json({ success: true, message: 'Message sent successfully' });
    console.log("--- Contact Form Processing Completed Successfully ---\n");

  } catch (error) {
    console.error("❌ --- Contact Form Processing Failed ---");
    
    if (error.response) {
      console.error("Brevo API Error Status:", error.response.status);
      console.error("Brevo API Error Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from Brevo API. Network issue?");
    } else {
      console.error("Server Logic Error:", error.message);
    }
    
    res.status(500).json({ success: false, message: 'Failed to send message' });
    console.log("------------------------------------------\n");
  }
};