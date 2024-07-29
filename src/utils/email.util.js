const nodeMailer = require("nodemailer");
require("dotenv").config();

const transporter = nodeMailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_NAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendCodeToCheckExistingEmail = async (targetEmail) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  await transporter.sendMail({
    from: process.env.EMAIL_NAME,
    to: targetEmail,
    subject: "LOCKET - Account Registration Confirmation Code",
    html: `
        <div style="font-family: Arial, sans-serif;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">You are receiving this email because you requested to register an account on "Locket".</p>
            <p style="font-size: 24px; text-align: center; font-weight: bold; color: #333;">${code}</p>
            <p style="font-size: 16px;">Please enter this code to verify your identity and complete the registration process.</p>
            <p style="font-size: 16px;">Thank you,<br/>The Locket Team</p>
            <p style="font-size: 14px; color: #777;">If you did not request this registration, please ignore this email.</p>
        </div>`,
  });
  return code;
};

const sendCodeForChangeEmail = async (targetEmail) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  await transporter.sendMail({
    from: process.env.EMAIL_NAME,
    to: targetEmail,
    subject: "LOCKET - Changing Email Confirmation Code",
    html: `
        <div style="font-family: Arial, sans-serif;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">You are receiving this email because you requested to change email on "Locket".</p>
            <p style="font-size: 24px; text-align: center; font-weight: bold; color: #333;">${code}</p>
            <p style="font-size: 16px;">Please enter this code to verify your identity and complete the changing process.</p>
            <p style="font-size: 16px;">Thank you,<br/>The Locket Team</p>
            <p style="font-size: 14px; color: #777;">If you did not request this changing, please ignore this email.</p>
        </div>`,
  });
  return code;
};

const sendEmailToDeletedAccount = async (targetEmail) => {
  await transporter.sendMail({
    from: process.env.EMAIL_NAME,
    to: targetEmail,
    subject: "Account Deletion Confirmation",
    html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">We are very sorry to hear that you have decided to delete your account on "Locket".</p>
            <p style="font-size: 16px;">If there is anything we can do to improve your experience or if you have any feedback, please do not hesitate to reach out to us at this email.</p>
            <p style="font-size: 16px;">We sincerely hope to have the opportunity to serve you again in the future.</p>
            <p style="font-size: 16px;">Thank you for being a part of our community.</p>
            <p style="font-size: 16px;">Best regards,<br/>The Locket Team</p>
        </div>`,
  });
};

const sendCodeToCheckOwner = async (targetEmail) => {
  const code = Math.floor(100000 + Math.random() * 900000);
  await transporter.sendMail({
    from: process.env.EMAIL_NAME,
    to: targetEmail,
    subject: "LOCKET - Password Changing Confirmation Code",
    html: `
      <div style="font-family: Arial, sans-serif;">
          <p style="font-size: 16px;">Dear User,</p>
          <p style="font-size: 16px;">You are receiving this email because you requested to change password on "Locket".</p>
          <p style="font-size: 24px; text-align: center; font-weight: bold; color: #333;">${code}</p>
          <p style="font-size: 16px;">Please enter this code to verify your identity and complete the password changing process.</p>
          <p style="font-size: 16px;">Thank you,<br/>The Locket Team</p>
          <p style="font-size: 14px; color: #777;">If you did not request this password changing, please ignore this email.</p>
      </div>`,
  });
  return code;
};

module.exports = {
  sendCodeToCheckExistingEmail,
  sendEmailToDeletedAccount,
  sendCodeForChangeEmail,
  sendCodeToCheckOwner,
};
