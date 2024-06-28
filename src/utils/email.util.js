const nodeMailer = require("nodemailer");
require("dotenv").config()

const transporter = nodeMailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_NAME,
        pass: process.env.EMAIL_PASSWORD,
    }
});

const sendCodeToCheckExistingEmail = async (targetEmail) => {
    const code = Math.floor(100000 + Math.random() * 900000);
    await transporter.sendMail({
        from: process.env.EMAIL_NAME,
        to: targetEmail,
        subject: 'LOCKET - Account Registration Confirmation Code',
        html: `
        <div style="font-family: Arial, sans-serif;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">You are receiving this email because you requested to register an account on "Locket".</p>
            <p style="font-size: 24px; text-align: center; font-weight: bold; color: #333;">${code}</p>
            <p style="font-size: 16px;">Please enter this code to verify your identity and complete the registration process.</p>
            <p style="font-size: 16px;">Thank you,<br/>The Locket Team</p>
            <p style="font-size: 14px; color: #777;">If you did not request this registration, please ignore this email.</p>
        </div>`
    });
    return code;
}

const sendCodeToCheckOwner= async (targetEmail) => {
    const code = Math.floor(100000 + Math.random() * 900000);
    await transporter.sendMail({
        from: process.env.EMAIL_NAME,
        to: targetEmail,
        subject: 'LOCKET - Password Changing Confirmation Code',
        html: `
        <div style="font-family: Arial, sans-serif;">
            <p style="font-size: 16px;">Dear User,</p>
            <p style="font-size: 16px;">You are receiving this email because you requested to change password on "Locket".</p>
            <p style="font-size: 24px; text-align: center; font-weight: bold; color: #333;">${code}</p>
            <p style="font-size: 16px;">Please enter this code to verify your identity and complete the password changing process.</p>
            <p style="font-size: 16px;">Thank you,<br/>The Locket Team</p>
            <p style="font-size: 14px; color: #777;">If you did not request this password changing, please ignore this email.</p>
        </div>`
    });
    return code;
}

module.exports = {
    sendCodeToCheckExistingEmail,
    sendCodeToCheckOwner
}