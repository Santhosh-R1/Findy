const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            // Do not fail on invalid certs
            rejectUnauthorized: false
        }
    });

    // 2. Define the email options
    const mailOptions = {
        from: `"Findy App" <${process.env.EMAIL_FROM}>`, // It's good practice to add a sender name
        to: options.email,
        subject: options.subject,
        text: options.message, // The plain-text version for fallback
        html: options.html     // <<<--- THIS IS THE LINE YOU NEED TO ADD
    };

    // 3. Actually send the email
    await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;