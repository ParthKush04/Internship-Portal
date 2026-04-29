import sgMail from "@sendgrid/mail";

const initializeSendGrid = () => {
  const { SENDGRID_API_KEY } = process.env;
  
  if (!SENDGRID_API_KEY) {
    console.warn("⚠️ SENDGRID_API_KEY not set - emails will not be sent");
    return false;
  }
  
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("✅ SendGrid initialized successfully");
  return true;
};

const cleanFromEmail = (value) => String(value || "").trim();

const resolveFromEmail = () => {
  const fromEmail = cleanFromEmail(
    process.env.SENDGRID_FROM_EMAIL ||
    process.env.MAIL_FROM ||
    process.env.SMTP_USER ||
    process.env.GMAIL_USER
  );

  if (!fromEmail) {
    return null;
  }

  return fromEmail;
};

export default initializeSendGrid;
export { sgMail, resolveFromEmail };
