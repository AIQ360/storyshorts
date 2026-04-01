import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser, getAdminSupabase } from "@/lib/admin";
import {
  modelTrainedEmail,
  headshotsReadyEmail,
  welcomeEmail,
  confirmEmailTemplate,
  resetPasswordEmailTemplate,
} from "@/lib/emails/templates";

export const dynamic = "force-dynamic";

const EMAIL_TYPES = [
  "model_trained",
  "headshots_ready",
  "welcome",
  "confirm_email",
  "reset_password",
] as const;
type EmailType = (typeof EMAIL_TYPES)[number];

const defaultSubjects: Record<EmailType, string> = {
  model_trained: "Your AI Model is Ready!",
  headshots_ready: "Your Headshots Are Ready!",
  welcome: "Welcome to Framecast AI!",
  confirm_email: "Confirm Your Email",
  reset_password: "Reset Your Password",
};

/** Default template generators. Auth templates use a placeholder for the variable. */
const defaultTemplates: Record<EmailType, () => string> = {
  model_trained: modelTrainedEmail,
  headshots_ready: headshotsReadyEmail,
  welcome: welcomeEmail,
  confirm_email: () => confirmEmailTemplate("{{confirm_url}}"),
  reset_password: () => resetPasswordEmailTemplate("{{reset_url}}"),
};

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = getAdminSupabase();
  const { data: rows } = await adminSupabase
    .from("email_templates")
    .select("type, subject, html, is_custom, updated_at");

  const templates: Record<
    string,
    {
      subject: string;
      html: string;
      isCustom: boolean;
      updatedAt: string | null;
    }
  > = {};

  for (const type of EMAIL_TYPES) {
    const row = rows?.find((r) => r.type === type);
    templates[type] = {
      subject: row?.subject || defaultSubjects[type],
      html: row?.is_custom && row.html ? row.html : defaultTemplates[type](),
      isCustom: row?.is_custom ?? false,
      updatedAt: row?.updated_at ?? null,
    };
  }

  return NextResponse.json(templates);
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isTestAdminUser(user)) {
    return NextResponse.json(
      { error: "Demo mode — changes are disabled" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { type, subject, html } = body;

  if (!EMAIL_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
  }

  if (
    (!subject || typeof subject !== "string" || !subject.trim()) &&
    (!html || typeof html !== "string" || !html.trim())
  ) {
    return NextResponse.json(
      { error: "Subject or HTML is required" },
      { status: 400 },
    );
  }

  const adminSupabase = getAdminSupabase();

  const upsertData: Record<string, unknown> = {
    type,
    is_custom: true,
    updated_at: new Date().toISOString(),
    subject:
      typeof subject === "string" && subject.trim()
        ? subject.trim()
        : defaultSubjects[type as EmailType],
    html: typeof html === "string" && html.trim() ? html.trim() : "",
  };

  const { error } = await adminSupabase
    .from("email_templates")
    .upsert(upsertData, { onConflict: "type" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isTestAdminUser(user)) {
    return NextResponse.json(
      { error: "Demo mode — changes are disabled" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { type } = body;

  if (!EMAIL_TYPES.includes(type)) {
    return NextResponse.json({ error: "Invalid email type" }, { status: 400 });
  }

  const adminSupabase = getAdminSupabase();

  const { error } = await adminSupabase.from("email_templates").upsert(
    {
      type,
      subject: defaultSubjects[type as EmailType],
      html: "",
      is_custom: false,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "type" },
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
