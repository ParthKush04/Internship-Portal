import sgMail from "@sendgrid/mail";

const initializeSendGrid = () => {
  const { SENDGRID_API_KEY } = process.env;
  
  console.log("🔍 SendGrid Initialization Debug:");
  console.log("   SENDGRID_API_KEY exists:", !!SENDGRID_API_KEY);
  console.log("   SENDGRID_API_KEY length:", SENDGRID_API_KEY?.length);
  console.log("   First 20 chars:", SENDGRID_API_KEY?.substring(0, 20) + "...");
  
  if (!SENDGRID_API_KEY) {
    console.warn("⚠️ SENDGRID_API_KEY not set - emails will not be sent");
    return false;
  }
  
  sgMail.setApiKey(SENDGRID_API_KEY);
  console.log("✅ SendGrid initialized successfully");
  return true;
};

export default initializeSendGrid;
