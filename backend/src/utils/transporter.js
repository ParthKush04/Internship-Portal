import nodemailer from "nodemailer";

const cleanSecret = (value) => String(value || "")
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\s+/g, "");

const smtpUser = String(process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
const smtpPass = cleanSecret(process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD || "");
const smtpHost = String(process.env.SMTP_HOST || "").trim();
const smtpPort = Number(process.env.SMTP_PORT || 0);
const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";

const transportConfig = smtpHost
  ? {
      host: smtpHost,
      port: smtpPort || 587,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    }
  : {
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    };

const transporter = nodemailer.createTransport({
  ...transportConfig,
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 20000
});

// Test the transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer Error:", error.message);
  } else if (success) {
    console.log("✅ Nodemailer (Gmail/SMTP) is ready");
  }
});

export default transporter;
