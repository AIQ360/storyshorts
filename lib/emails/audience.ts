import { resend, audienceId } from "@/lib/resend";

/**
 * Add a contact to the "Framecast AI Users" audience in Resend.
 * Creates the audience automatically if RESEND_AUDIENCE_ID is not set.
 * No-ops silently if Resend is not configured.
 */
export async function addContactToAudience({
  email,
  firstName,
  lastName,
}: {
  email: string;
  firstName?: string;
  lastName?: string;
}): Promise<void> {
  if (!resend) {
    console.log("[audience] Resend not configured, skipping contact add");
    return;
  }

  try {
    let resolvedAudienceId = audienceId;

    // If no audience ID is set, find or create the "Framecast AI Users" audience
    if (!resolvedAudienceId) {
      const { data: audiences } = await resend.audiences.list();
      const existing = audiences?.data?.find(
        (a) => a.name === "Framecast AI Users",
      );

      if (existing) {
        resolvedAudienceId = existing.id;
      } else {
        const { data: created } = await resend.audiences.create({
          name: "Framecast AI Users",
        });
        if (created) {
          resolvedAudienceId = created.id;
        }
      }
    }

    if (!resolvedAudienceId) {
      console.error("[audience] Could not resolve audience ID");
      return;
    }

    const { data, error } = await resend.contacts.create({
      email,
      firstName: firstName || "",
      lastName: lastName || "",
      audienceId: resolvedAudienceId,
      unsubscribed: false,
    });

    if (error) {
      // "Contact already exists" is not a real error — skip it
      if (
        error.message?.toLowerCase().includes("already exists") ||
        error.name === "validation_error"
      ) {
        console.log(`[audience] Contact ${email} already exists, skipping`);
        return;
      }
      console.error("[audience] Error adding contact:", error);
    } else {
      console.log(`[audience] Added contact ${email}, id: ${data?.id}`);
    }
  } catch (err) {
    console.error("[audience] Failed to add contact:", err);
  }
}
