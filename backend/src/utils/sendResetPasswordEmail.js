import transporter from "./transporter.js";

const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
  if (!to || !resetUrl) {
    console.error("❌ Missing required password reset email parameters");
    return false;
  }

  try {
    const { GMAIL_USER } = process.env;
    if (!GMAIL_USER) {
      console.error("❌ GMAIL_USER not configured");
      return false;
    }

  const mailOptions = {
    from: `Provisioning Tech <${GMAIL_USER}>`,
    replyTo: GMAIL_USER,
    to: String(to).toLowerCase().trim(),
    subject: "Reset Your Provisioning Tech Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background-color: #2c3e50; padding: 30px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .content p { margin: 15px 0; }
            .button { display: inline-block; background: #3498db; color: #fff !important; text-decoration: none; padding: 12px 18px; border-radius: 6px; font-weight: 600; }
            .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Dear ${name || "Student"},</p>
              <p>We received a request to reset your Provisioning Tech account password.</p>
              <p>Click the button below to open the password reset page and set a new password. The link will expire in one hour.</p>
              <p><a class="button" href="${resetUrl}">Reset Password</a></p>
              <p>If you did not request this, you can safely ignore this email.</p>
              <p>Best regards,<br/><b>Provisioning Tech Team</b></p>
            </div>
            <div class="footer">
              <p>&copy; 2026 Provisioning Tech. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `Dear ${name || "Student"},\n\nWe received a request to reset your Provisioning Tech account password.\n\nOpen this link to set a new password (expires in 1 hour):\n${resetUrl}\n\nIf you did not request this, you can ignore this email.\n\nBest regards,\nProvisioning Tech Team`
  };

    const info = await transporter.sendMail(mailOptions);
    const accepted = Array.isArray(info.accepted) && info.accepted.includes(String(to).toLowerCase().trim());
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];

    if (!accepted || rejected.length > 0) {
      console.error("❌ Password reset email was not accepted by SMTP", {
        to,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });
      return false;
    }

    console.log("✅ Password reset email accepted by Nodemailer to", to, "- Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    return false;
  }
};

export default sendResetPasswordEmail;
