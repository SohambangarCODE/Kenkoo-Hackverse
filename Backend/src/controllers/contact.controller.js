const Contact = require("../models/contact.model");
const { sendContactEmail, sendConfirmationEmail } = require("../services/email.service");

exports.submitContact = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newContact = new Contact({
      name,
      email,
      subject,
      message,
    });

    // Save to database
    await newContact.save();

    // Send email notification to business
    const emailResult = await sendContactEmail({ name, email, subject, message });
    
    if (emailResult.success) {
      console.log("Contact form email sent successfully");
      
      // Optionally send confirmation email to user
      await sendConfirmationEmail(email, name);
    } else {
      console.error("Failed to send email, but contact saved to database");
    }

    res.status(201).json({ message: "Message sent successfully", success: true });
  } catch (error) {
    console.error("Error submitting contact form:", error);
    res.status(500).json({ message: "Server error", success: false });
  }
};
