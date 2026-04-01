import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;

export const resend = resendApiKey ? new Resend(resendApiKey) : null;

export const senderEmail =
  process.env.RESEND_SENDER_EMAIL || "Framecast AI <noreply@mail.jerrizz.com>";

export const audienceId = process.env.RESEND_AUDIENCE_ID || "";
