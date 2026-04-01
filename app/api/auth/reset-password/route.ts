import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { resend, senderEmail } from "@/lib/resend";
import { resolveAuthTemplate } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, redirectTo } = await request.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo,
      },
    });

    if (error) {
      console.error("Password reset generateLink error:", error);
      // Return generic message to prevent email enumeration
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    if (!data?.properties?.action_link) {
      return NextResponse.json({
        message: "If an account exists, a reset link has been sent.",
      });
    }

    // Send password reset email via Resend with branded template
    const resetUrl = data.properties.action_link;

    if (resend) {
      try {
        const { subject, html } = await resolveAuthTemplate("reset_password", {
          reset_url: resetUrl,
        });

        const { error: emailError } = await resend.emails.send({
          from: senderEmail,
          to: email,
          subject,
          html,
        });

        if (emailError) {
          console.error("[email] Failed to send reset email:", emailError);
        } else {
          console.log(`[email] Password reset email sent to ${email}`);
        }
      } catch (emailErr) {
        console.error("[email] Error sending reset email:", emailErr);
      }
    }

    return NextResponse.json({
      message: "If an account exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Password reset route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
