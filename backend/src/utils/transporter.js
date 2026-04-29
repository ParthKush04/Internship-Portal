import nodemailer from "nodemailer";

const smtpUser = process.env.GMAIL_USER;
const smtpPass = (process.env.GMAIL_APP_PASSWORD || "").replace(/\s+/g, "");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

// Test the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Error:", error.message);
  } else if (success) {
    console.log("✅ Nodemailer (Gmail SMTP) is ready");
  }
});

export default transporter;
