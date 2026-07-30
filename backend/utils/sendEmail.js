const nodemailer = require('nodemailer');

// Sends an email using SMTP credentials from env vars.
// If SMTP is not configured (common in local/dev setups), it logs the
// email content to the console instead of failing, so the forgot-password
// flow keeps working during development.
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('--- SMTP not configured. Email content below (dev mode) ---');
    console.log(`To: ${to}\nSubject: ${subject}\n${html}`);
    console.log('-------------------------------------------------------');
    return { simulated: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  await transporter.sendMail({
    from: `"Fitness Tracker" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });

  return { simulated: false };
};

module.exports = sendEmail;
