import nodemailer from "nodemailer";

// Function to configure mail options
const mailOptions = (email, subject, message) => {
  return {
    from: process.env.EMAIL_FROM || "defaultSender@example.com", // Sender email address
    to: email, // Recipient email address
    subject: subject || "No Subject", // Email subject (defaults if not provided)
    text: message, // Email message
  };
};

// Create a transporter for sending emails
const transporter = nodemailer.createTransport({
  service: "gmail", // Email service provider
  auth: {
    user: process.env.EMAIL_USER, // Sender email address from environment variables
    pass: process.env.EMAIL_PASS, // App Password from environment variables
  },
});

/**
 * Send an email.
 * @param {string} email - Recipient email address.
 * @param {string} subject - Subject of the email.
 * @param {string} message - Text body of the email.
 * @returns {Promise} - Resolves if email is sent successfully, rejects otherwise.
 */
const sendEmail = async (email, subject, message) => {
  try {
    const options = mailOptions(email, subject, message);
    const result = await transporter.sendMail(options);
    console.log("Email sent:", result.response);
    return result;
  } catch (error) {
    console.error("Error sending email:", error.message);
    throw new Error("Failed to send email");
  }
};

export { mailOptions, transporter, sendEmail };
