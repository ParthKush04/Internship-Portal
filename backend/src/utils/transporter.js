import nodemailer from "nodemailer";

const cleanSecret = (value) => String(value || "")
  .trim()
  .replace(/^['"]|['"]$/g, "")
  .replace(/\s+/g, "");

const smtpUser = String(process.env.SMTP_USER || process.env.GMAIL_USER || "").trim();
const smtpPass = String(process.env.SMTP_PASS || "").trim() || cleanSecret(process.env.GMAIL_APP_PASSWORD || "");
const smtpHost = String(process.env.SMTP_HOST || "").trim();
const smtpPort = Number(process.env.SMTP_PORT || 0);
const smtpSecure = String(process.env.SMTP_SECURE || "").toLowerCase() === "true";
const hasCustomSmtp = Boolean(smtpHost && smtpUser && smtpPass);

const transportConfig = hasCustomSmtp
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
    console.error("Nodemailer mode:", hasCustomSmtp ? "custom-smtp" : "gmail-service");
  } else if (success) {
    console.log("✅ Nodemailer (Gmail/SMTP) is ready", {
      mode: hasCustomSmtp ? "custom-smtp" : "gmail-service",
      userConfigured: Boolean(smtpUser)
    });
  }
});

export default transporter;
