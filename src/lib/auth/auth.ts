import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { getDb } from "@/db";
import { schema } from "@/db/schema";
import { actionEmail, sendEmail } from "@/lib/email/service";

const appUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export const auth = betterAuth({
  appName: "Tracker",
  baseURL: appUrl,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(getDb(), { provider: "pg", schema }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 10,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email, subject: "Reset your Tracker password",
        html: actionEmail({ name: user.name, title: "Reset your password", message: "Use the secure link below to choose a new password. This link expires shortly.", action: "Reset password", url }), text: `Reset your Tracker password: ${url}`,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email, subject: "Verify your Tracker email",
        html: actionEmail({ name: user.name, title: "Verify your email", message: "One quick step and your workspace will be ready.", action: "Verify email", url }), text: `Verify your Tracker email: ${url}`,
      });
    },
  },
  session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
  advanced: { useSecureCookies: process.env.NODE_ENV === "production" },
  trustedOrigins: [appUrl, "https://tracker.abdulwadood.com"],
  plugins: [nextCookies()],
});
