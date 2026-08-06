import { Resend } from "resend";

export type EmailMessage = { to: string; subject: string; html: string; text: string };

export async function sendEmail(message: EmailMessage) {
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === "development") console.info(`[email preview] ${message.subject} -> ${message.to}`);
    return { id: "development-preview" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const result = await resend.emails.send({ from: process.env.EMAIL_FROM ?? "Tempo <noreply@clockify.abdulwadood.com>", ...message });
  if (result.error) throw new Error("Email delivery failed");
  return result.data;
}

export function actionEmail({ name, title, message, action, url }: { name: string; title: string; message: string; action: string; url: string }) {
  const safeUrl = url.replace(/"/g, "&quot;");
  return `<!doctype html><html><body style="margin:0;background:#f5f5f7;font-family:Arial,sans-serif;color:#1b1b20"><table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:40px 16px"><table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:auto;background:white;border:1px solid #e7e7ea;border-radius:16px"><tr><td style="padding:32px"><div style="font-size:20px;font-weight:700;color:#6558d3">tempo</div><h1 style="font-size:23px;margin:28px 0 12px">${title}</h1><p style="color:#6f6f78;line-height:1.6">Hi ${name},</p><p style="color:#6f6f78;line-height:1.6">${message}</p><a href="${safeUrl}" style="display:inline-block;margin:16px 0;padding:12px 18px;border-radius:9px;background:#6558d3;color:white;text-decoration:none;font-weight:700">${action}</a><p style="color:#999;font-size:12px;line-height:1.5">If the button does not work, copy this link:<br>${safeUrl}</p></td></tr></table></td></tr></table></body></html>`;
}
