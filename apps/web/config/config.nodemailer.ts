import { createTransport, TransportOptions } from "nodemailer";

// Transporter setup
export const transporter = createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: process.env.NODE_ENV === "production",
  auth: {
    user: process.env.MAIL_FROM!,
    pass: process.env.MAIL_PASS,
  },
} as TransportOptions);
