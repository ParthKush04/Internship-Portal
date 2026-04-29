import { resolveFromEmail, resolveFromName, sgMail } from "../config/sendGrid.js";

const sendOfferLetterEmail = async ({
  to,
  studentName,
  pdfBuffer,
  startDate,
  duration,
  assignedInternship,
}) => {
  // Validate input
  if (!to || !studentName || !pdfBuffer) {
    console.error("❌ Missing required email parameters");
    return false;
  }

  try {
    const fromEmail = resolveFromEmail();
    if (!fromEmail) {
      console.error("❌ SENDGRID_FROM_EMAIL/MAIL_FROM/SMTP_USER/GMAIL_USER not configured");
      return false;
    }

    const fromName = resolveFromName();
    console.log("📨 Offer letter send config:", { fromEmail, fromName, to: String(to).toLowerCase().trim() });

    // Convert buffer to base64
    let base64Content;
    if (Buffer.isBuffer(pdfBuffer)) {
      base64Content = pdfBuffer.toString("base64");
    } else if (pdfBuffer instanceof Uint8Array) {
      base64Content = Buffer.from(pdfBuffer).toString("base64");
    } else {
      console.error("❌ Invalid pdfBuffer type:", typeof pdfBuffer);
      return false;
    }

    const mailOptions = {
      from: { email: fromEmail, name: fromName },
      to: String(to).toLowerCase().trim(),
      subject: "Internship Offer Letter - Provisioning Tech",
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
              .details { background-color: white; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0; }
              .details-row { margin: 12px 0; }
              .label { font-weight: 600; color: #2c3e50; display: inline-block; width: 120px; }
              .footer { background-color: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
              .footer a { color: #3498db; text-decoration: none; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Internship Offer Letter</h1>
              </div>
              <div class="content">
                <p>Dear ${studentName},</p>
                <p>We are pleased to inform you that you have been selected for an internship position at Provisioning Tech.</p>
                
                <div class="details">
                  <div class="details-row">
                    <span class="label">Position:</span> ${assignedInternship}
                  </div>
                  <div class="details-row">
                    <span class="label">Start Date:</span> ${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div class="details-row">
                    <span class="label">Duration:</span> ${duration}
                  </div>
                </div>
                
                <p>Please find your complete offer letter attached to this email. If you have any questions or require any clarifications, please do not hesitate to contact our HR team.</p>
                <p>We look forward to working with you!</p>
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
      text: `Dear ${studentName},\n\nCongratulations! You have been selected for the ${assignedInternship} internship at Provisioning Tech.\n\nPosition: ${assignedInternship}\nStart Date: ${new Date(startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}\nDuration: ${duration}\n\nPlease find your complete offer letter attached to this email.\n\nBest regards,\nHuman Resources Team\nProvisioning Tech`,
      attachments: [
        {
          filename: "offer-letter.pdf",
          content: Buffer.isBuffer(pdfBuffer) ? pdfBuffer.toString("base64") : Buffer.from(pdfBuffer).toString("base64"),
          type: "application/pdf",
          disposition: "attachment"
        }
      ]
    };

    const response = await sgMail.send(mailOptions);
    const info = Array.isArray(response) ? response[0] : response;
    console.log("✅ Offer letter email sent via SendGrid to", to, "- Status:", info?.statusCode || "n/a");
    return true;
  } catch (error) {
    console.error("❌ SendGrid Error:", error.message);
    if (error?.response) {
      console.error("SendGrid response:", error.response.body || error.response);
    }
    if (error?.code) {
      console.error("SendGrid code:", error.code);
    }
    return false;
  }
};

export default sendOfferLetterEmail;
