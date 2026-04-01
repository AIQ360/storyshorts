import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { validatePasswordServer } from "@/lib/password";
import { resend, senderEmail } from "@/lib/resend";
import { resolveAuthTemplate } from "@/lib/emails/send";
import { addContactToAudience } from "@/lib/emails/audience";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { email, password, firstName, lastName, redirectTo } =
      await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const passwordError = validatePasswordServer(password);
    if (passwordError) {
      return NextResponse.json({ message: passwordError }, { status: 400 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!,
    );

    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        redirectTo,
        data: {
          first_name: firstName || "",
          last_name: lastName || "",
        },
      },
    });

    if (error) {
      console.error("Signup generateLink error:", error);
      return NextResponse.json({ message: error.message }, { status: 400 });
    }

    if (!data?.properties?.action_link) {
      return NextResponse.json(
        { message: "Failed to generate confirmation link" },
        { status: 500 },
      );
    }

    // Send confirmation email via Resend with branded template
    const confirmUrl = data.properties.action_link;

    if (resend) {
      try {
        const { subject, html } = await resolveAuthTemplate("confirm_email", {
          confirm_url: confirmUrl,
        });

        const { error: emailError } = await resend.emails.send({
          from: senderEmail,
          to: email,
          subject,
          html,
        });

        if (emailError) {
          console.error(
            "[email] Failed to send confirmation email:",
            emailError,
          );
        } else {
          console.log(`[email] Confirmation email sent to ${email}`);
        }
      } catch (emailErr) {
        console.error("[email] Error sending confirmation email:", emailErr);
      }
    }

    // Add contact to Resend audience (fire & forget)
    addContactToAudience({ email, firstName, lastName }).catch(() => {});

    return NextResponse.json({
      message: "Account created. Please check your email to verify.",
      user: { id: data.user?.id, email: data.user?.email },
    });
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
