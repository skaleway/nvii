import { db } from "@nvii/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

  // Local dev port drifts (Next bumps to the next free port when 3000 is taken,
  // which used to make every sign in 403 with "Invalid callbackURL"). Trust
  // the local origins so the port never matters.
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
    "http://localhost:3004",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "http://127.0.0.1:3003",
    "http://127.0.0.1:3004",
  ],

  session: {
    expiresIn: 60 * 60 * 24 + 14,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 12,
    },
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },

  user: {
    additionalFields: {
      username: {
        type: "string",
        required: false,
      },
    },
  },

  plugins: [username()],
});

export type Session = typeof auth.$Infer.Session;
