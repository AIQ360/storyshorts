import { resend, senderEmail } from "@/lib/resend";
import { getAdminSupabase } from "@/lib/admin";
import {
  modelTrainedEmail,
  headshotsReadyEmail,
  welcomeEmail,
  confirmEmailTemplate,
  resetPasswordEmailTemplate,
} from "./templates";
import type { User } from "@supabase/supabase-js";

export type EmailType =
  | "model_trained"
  | "headshots_ready"
  | "welcome"
  | "confirm_email"
  | "reset_password";

const defaultSubjects: Record<EmailType, string> = {
  model_trained: "Your AI Model is Ready!",
  headshots_ready: "Your Headshots Are Ready!",
  welcome: "Welcome to Framecast AI!",
  confirm_email: "Confirm Your Email",
  reset_password: "Reset Your Password",
};

const defaultTemplates: Record<EmailType, () => string> = {
  model_trained: modelTrainedEmail,
  headshots_ready: headshotsReadyEmail,
  welcome: welcomeEmail,
  confirm_email: () => confirmEmailTemplate("{{confirm_url}}"),
  reset_password: () => resetPasswordEmailTemplate("{{reset_url}}"),
};

/**
 * Resolve the email template for a given type.
 * Checks email_templates table for a custom template first, falls back to built-in default.
 */
async function resolveTemplate(
  type: EmailType,
): Promise<{ subject: string; html: string }> {
  try {
    const supabase = getAdminSupabase();
    const { data } = await supabase
      .from("email_templates")
      .select("subject, html, is_custom")
      .eq("type", type)
      .single();

    if (data) {
      return {
        subject: data.subject || defaultSubjects[type],
        html:
          data.is_custom && data.html ? data.html : defaultTemplates[type](),
      };
    }
  } catch {
    // Ignore — use defaults
  }

  return {
    subject: defaultSubjects[type],
    html: defaultTemplates[type](),
  };
}

/**
 * Send a notification email to a user.
 * Resolves custom template/subject from email_templates table, falls back to defaults.
 * No-ops if Resend is not configured.
 */
export async function sendNotificationEmail(
  to: string,
  type: EmailType,
): Promise<void> {
  if (!resend) {
    console.log("[email] Resend not configured, skipping email");
    return;
  }

  try {
    const { subject, html } = await resolveTemplate(type);

    console.log(`[email] Sending "${type}" email to ${to} from ${senderEmail}`);

    const { data, error } = await resend.emails.send({
      from: senderEmail,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("[email] Resend API error:", error);
    } else {
      console.log("[email] Sent successfully, id:", data?.id);
    }
  } catch (err) {
    console.error("[email] Failed to send notification email:", err);
  }
}

/**
 * Resolve an auth email template (confirm_email / reset_password) with variable substitution.
 * Checks the email_templates table for a custom template and replaces placeholders
 * such as {{confirm_url}} or {{reset_url}} with the actual URL value.
 * Falls back to built-in template functions when no custom template exists.
 */
export async function resolveAuthTemplate(
  type: "confirm_email" | "reset_password",
  variables: Record<string, string>,
): Promise<{ subject: string; html: string }> {
  const { subject, html } = await resolveTemplate(type);

  // Replace all {{variable}} placeholders with their values
  let resolved = html;
  for (const [key, value] of Object.entries(variables)) {
    resolved = resolved.replaceAll(`{{${key}}}`, value);
  }

  return { subject, html: resolved };
}

/**
 * Send a welcome email exactly once per user, regardless of auth method.
 * Uses the `welcome_email_sent` flag in Supabase user_metadata to prevent duplicates.
 * Safe to call from any auth flow (email signup, OAuth, magic link, etc.).
 */
export async function sendWelcomeEmailOnce(user: User): Promise<void> {
  if (!user.email) return;
  if (user.user_metadata?.welcome_email_sent) return;

  try {
    const adminSupabase = getAdminSupabase();

    // Atomically set the flag — if another request set it first, we'll just skip
    const { error: updateError } =
      await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: { ...user.user_metadata, welcome_email_sent: true },
      });

    if (updateError) {
      console.error(
        "[email] Failed to set welcome_email_sent flag:",
        updateError,
      );
      return;
    }

    await sendNotificationEmail(user.email, "welcome");
  } catch (err) {
    console.error("[email] Failed to send welcome email:", err);
  }
}
