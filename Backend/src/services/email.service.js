const nodemailer = require("nodemailer");

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send contact form email
exports.sendContactEmail = async (contactData) => {
  try {
    const transporter = createTransporter();
    
    const { name, email, subject, message } = contactData;
    
    // Email to business owner
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #022c4a 0%, #2a41c2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Contact Form Submission</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Contact Details</h2>
              <p style="margin: 5px 0; color: #4b5563;"><strong style="color: #022c4a;">Name:</strong> ${name}</p>
              <p style="margin: 5px 0; color: #4b5563;"><strong style="color: #022c4a;">Email:</strong> <a href="mailto:${email}" style="color: #3C53E8; text-decoration: none;">${email}</a></p>
              <p style="margin: 5px 0; color: #4b5563;"><strong style="color: #022c4a;">Subject:</strong> ${subject}</p>
            </div>
            
            <div style="margin-top: 20px;">
              <h2 style="color: #1f2937; margin: 0 0 10px 0; font-size: 18px;">Message</h2>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; border-left: 4px solid #3C53E8;">
                <p style="margin: 0; color: #374151; line-height: 1.6; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                This email was sent from the Kenkoo Health contact form.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

// Optional: Send confirmation email to user
exports.sendConfirmationEmail = async (userEmail, userName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "We've received your message - Kenkoo Health",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; border-radius: 10px;">
          <div style="background: linear-gradient(135deg, #022c4a 0%, #2a41c2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Thank You for Contacting Us!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Hi <strong>${userName}</strong>,
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              Thank you for reaching out to Kenkoo Health. We've received your message and our team will get back to you within 24 hours.
            </p>
            
            <p style="color: #374151; font-size: 16px; line-height: 1.6;">
              We appreciate your interest in our services and look forward to assisting you on your journey to better health.
            </p>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                Best regards,<br>
                <strong style="color: #022c4a;">Kenkoo Health Team</strong>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Confirmation email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return { success: false, error: error.message };
  }
};
