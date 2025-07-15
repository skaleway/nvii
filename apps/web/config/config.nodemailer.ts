import nodemailer from "nodemailer";

// Transporter setup
export const transporter = nodemailer.createTransport({
  service: process.env.MAIL_HOST!,
  auth: {
    user: process.env.MAIL_FROM!,
    pass: process.env.MAIL_PASS,
  },
});
