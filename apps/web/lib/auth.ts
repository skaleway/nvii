import { db } from "@nvii/db";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { username } from "better-auth/plugins";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),

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
