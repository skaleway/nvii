import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@workspace/db";
import { sendEmail } from "./send-mail";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  session: {
    expiresIn: 60 * 60 * 24 + 14, // Ensure user login session expires after 25 days
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 12, // Ensure that user cookie data is cached for half a day to prevent excess refetch from the database
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Verify your email",
        text: `Click the link to verify your email: ${url}`,
      });
    },
  },
});

export type Session = typeof auth.$Infer.Session;
