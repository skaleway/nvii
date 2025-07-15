"use server";

import { transporter } from "@/config/config.nodemailer";

export async function sendEmail({
  to,
  subject,
  text,
}: {
  to: string;
  subject: string;
  text: string;
}) {
  if (!process.env.MAIL_FROM) {
    throw new Error("MAIL_FROM environment variable is not set");
  }

  const message = {
    to: to.toLowerCase().trim(),
    from: process.env.MAIL_FROM,
    subject: subject.trim(),
    text: text.trim(),
  };

  try {
    const response = await transporter.sendMail(message);

    if (!response.accepted) {
      throw new Error(
        `Nodemailer API returned status of: ${response.response}`,
      );
    }

    return {
      success: true,
      messageId: response.messageId,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      message: "Failed to send email. Please try again later.",
    };
  }
}
