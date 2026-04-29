import transporter from "./transporter.js";

const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
  const mailOptions = {
    from: process.env.GMAIL_USER,
    to,
    subject: "Provisioning Tech - Password Reset",
    html: `
      <p>Hi ${name || "there"},</p>
      <p>You requested a password reset for your Provisioning Tech account. Click the link below to set a new password. This link is valid for one hour.</p>
      <p><a href="${resetUrl}">Reset your password</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
      <p>— Provisioning Tech</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

export default sendResetPasswordEmail;
