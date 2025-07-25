import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,     // 'smtp.gmail.com'
  port: process.env.SMTP_PORT,     // 587
  secure: false,                   // Use TLS (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,   // your-email@gmail.com
    pass: process.env.SMTP_PASS    // app password
  }
});

export default transporter;
