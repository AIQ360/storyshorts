import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { addContactToAudience } from "@/lib/emails/audience";
import { sendWelcomeEmailOnce } from "@/lib/emails/send";

import type { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnTo = requestUrl.searchParams.get("returnTo");

  if (code) {
    const supabase = await createClient();
    const { data: sessionData } =
      await supabase.auth.exchangeCodeForSession(code);

    // If we got a session, add user to Resend audience + send welcome email for new users
    if (sessionData?.user) {
      const user = sessionData.user;
      const email = user.email;
      const firstName =
        user.user_metadata?.first_name ||
        user.user_metadata?.full_name?.split(" ")[0] ||
        "";
      const lastName =
        user.user_metadata?.last_name ||
        user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
        "";

      if (email) {
        // Add to Resend audience (idempotent — skips if already exists)
        addContactToAudience({ email, firstName, lastName }).catch(() => {});

        // Send welcome email (idempotent — only sends once per user via metadata flag)
        sendWelcomeEmailOnce(user).catch(() => {});
      }
    }
  }

  const destination = returnTo || "/dashboard";
  return NextResponse.redirect(new URL(destination, requestUrl.origin));
}
