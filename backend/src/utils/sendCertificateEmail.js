import transporter from "./transporter.js";

const sendCertificateEmail = async ({
  to,
  studentName,
  pdfBuffer,
}) => {
  // Validate input
  if (!to || !studentName || !pdfBuffer) {
    console.error("❌ Missing required email parameters");
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
      subject: "Internship Completion Certificate - Provisioning Tech",
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
              .highlight-box { background-color: #ecf0f1; padding: 25px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #27ae60; }
              .highlight-box p { margin: 10px 0; font-size: 16px; }
              .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
              .footer a { color: #3498db; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Internship Completion Certificate</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>We are pleased to confirm that you have successfully completed your internship program at Provisioning Tech.</p>
                
                <div class="highlight-box">
                  <p><b>Internship Status: Completed</b></p>
                  <p>Your dedication and contribution during the internship period have been highly appreciated.</p>
                </div>
                
                <p>Your completion certificate is attached to this email. This certificate serves as official recognition of your successful completion of the internship program.</p>
                
                <p>We wish you success in your future endeavors. Please feel free to reach out if you need any assistance.</p>
                
                <p>Best regards,<br/><b>Human Resources Team</b><br/>Provisioning Tech</p>
              </div>
              <div class="footer">
                <p>&copy; 2026 Provisioning Tech. All rights reserved.</p>
                <p><a href="http://localhost:5173">Visit our website</a></p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `Dear ${studentName},\n\nWe are pleased to confirm that you have successfully completed your internship program at Provisioning Tech.\n\nYour completion certificate is attached to this email.\n\nBest regards,\nHuman Resources Team\nProvisioning Tech`,
      attachments: [
        {
          filename: "certificate.pdf",
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    const accepted = Array.isArray(info.accepted) && info.accepted.includes(String(to).toLowerCase().trim());
    const rejected = Array.isArray(info.rejected) ? info.rejected : [];

    if (!accepted || rejected.length > 0) {
      console.error("❌ Certificate email was not accepted by SMTP", {
        to,
        accepted: info.accepted,
        rejected: info.rejected,
        response: info.response
      });
      return false;
    }

    console.log("✅ Certificate email accepted by Nodemailer to", to, "- Message ID:", info.messageId);
    return true;
  } catch (error) {
    console.error("❌ Nodemailer Error:", error.message);
    return false;
  }
};

export default sendCertificateEmail;
