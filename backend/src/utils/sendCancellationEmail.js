import { resolveFromEmail, sgMail } from "../config/sendGrid.js";
import { offerLetterTemplate } from "./offerLetterTemplate.js";

const formatDate = (dateValue) => {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const sendCancellationEmail = async ({
  to,
  studentName,
  internshipType,
  cancelReason,
  cancelledAt
}) => {
  if (!to || !studentName) {
    console.error("Missing required cancellation email parameters");
    return false;
  }

  try {
    const fromEmail = resolveFromEmail();
    if (!fromEmail) {
      console.error("SENDGRID_FROM_EMAIL/MAIL_FROM/SMTP_USER/GMAIL_USER not configured");
      return false;
    }

    const formattedCancelledAt = formatDate(cancelledAt || new Date());
    const safeReason = escapeHtml(cancelReason || "Not provided");
    const safeStudentName = escapeHtml(studentName);
    const safeInternshipType = escapeHtml(internshipType || "Internship Program");

    const baseHtml = offerLetterTemplate({
      name: safeStudentName,
      internshipType: safeInternshipType,
      startDate: formattedCancelledAt,
      duration: "Cancelled",
      refNumber: `CAN/${new Date().getFullYear()}/001`,
      hrContactName: "Human Resources Team",
      hrContactEmail: fromEmail,
      hrContactPhone: ""
    });

    const cancellationHtml = baseHtml
      .replace(/Internship Offer Letter - Provisioning Tech/g, "Internship Cancellation Notice - Provisioning Tech")
      .replace(/Internship offer Letter/g, "Internship Cancellation Notice")
      .replace(/SUB: Internship Offer Letter for the post of ([^<]+)/g, "SUB: Internship Cancellation Notice for the post of $1")
      .replace(
        /This has reference to your application for internship with our organization\. We are pleased to offer you an <strong>Internship for the position of ([^<]+)<\/strong> with our company\./g,
        "This has reference to your internship application with our organization. We regret to inform you that your internship for the position of <strong>$1</strong> has been cancelled with immediate effect."
      )
      .replace(
        /Your internship will commence from <strong>[^<]+<\/strong>\. This internship will provide you with practical exposure and learning opportunities in web development technologies related to the ([^<]+)\./g,
        `The cancellation was recorded on <strong>${formattedCancelledAt}</strong>. Cancellation reason: <strong>${safeReason}</strong>.`
      )
      .replace(
        /<strong>Please note that this is an Unpaid Internship \(No Stipend\)<\/strong> and no financial remuneration will be provided during the internship period\. The purpose of this internship is to provide hands-on experience, industry exposure, and skill development\./g,
        "Please note that this internship has been cancelled and is no longer active. If you need any clarification, please contact our HR team."
      )
      .replace(
        /During the internship period, you will be expected to maintain discipline, complete assigned tasks, and follow company policies and guidelines\./g,
        "This cancellation is effective immediately and you are no longer required to continue the internship tasks or schedule."
      )
      .replace(
        /Upon successful completion of the internship and satisfactory performance, the company may provide an <strong>Internship Completion Certificate and Experience Letter\.<\/strong>/g,
        "If you need documentation related to this cancellation, please reply to this email and our team will assist you."
      )
      .replace(
        /We welcome you to the team and wish you a successful learning experience with us\./g,
        "We regret any inconvenience caused and wish you the very best for your future opportunities."
      )
      .replace(
        /<h4>1\. Internship Period<\/h4>[\s\S]*?<\/div>\s*<\/div>/g,
        `<h4>1. Cancellation Summary</h4><p>Your internship under <strong>${safeInternshipType}</strong> has been cancelled.</p><p><strong>Cancelled On:</strong> ${formattedCancelledAt}</p><p><strong>Reason:</strong> ${safeReason}</p>`
      )
      .replace(
        /<h4>2\. Unpaid Internship<\/h4>[\s\S]*?<\/div>\s*<\/div>/g,
        `<h4>2. Next Steps</h4><p>If you believe this update requires clarification, please contact Human Resources. Your account records will remain updated with this cancellation notice.</p>`
      )
      .replace(
        /<h4>3\. Termination<\/h4>[\s\S]*?<\/div>\s*<\/div>/g,
        `<h4>3. Effective Date</h4><p>This cancellation is effective immediately as of ${formattedCancelledAt}.</p>`
      );

    const mailOptions = {
      from: fromEmail,
      to: String(to).toLowerCase().trim(),
      subject: "Internship Cancellation Notice - Provisioning Tech",
      html: cancellationHtml,
      text: `Dear ${studentName},\n\nYour internship has been cancelled.\n\nInternship: ${internshipType || "Internship Program"}\nCancelled On: ${formattedCancelledAt}\nReason: ${cancelReason || "Not provided"}\n\nIf you need clarification, please reply to this email.\n\nRegards,\nHuman Resources Team\nProvisioning Tech`
    };

    const [info] = await sgMail.send(mailOptions);
    console.log("Cancellation email sent to", to, "- Message ID:", info?.headers?.["x-message-id"] || info?.headers?.["X-Message-Id"] || "n/a");
    return true;
  } catch (error) {
    console.error("Cancellation email send error:", error.message);
    if (error?.response) {
      console.error("SendGrid response:", error.response.body || error.response);
    }
    if (error?.code) {
      console.error("SendGrid code:", error.code);
    }
    return false;
  }
};

export default sendCancellationEmail;