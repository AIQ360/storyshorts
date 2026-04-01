import { Database } from "@/types/supabase";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { sendNotificationEmail } from "@/lib/emails/send";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl) {
  throw new Error("MISSING NEXT_PUBLIC_SUPABASE_URL!");
}

if (!supabaseSecretKey) {
  throw new Error("MISSING SUPABASE_SECRET_KEY!");
}

const supabase = createClient<Database>(supabaseUrl, supabaseSecretKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

type TuneData = {
  id: number;
  title: string;
  name: string;
  steps: null;
  trained_at: null;
  started_training_at: null;
  created_at: string;
  updated_at: string;
  expires_at: null;
};

export async function POST(request: Request) {
  try {
    const incomingData = (await request.json()) as { tune: TuneData };
    const { tune } = incomingData;

    const urlObj = new URL(request.url);
    const user_id = urlObj.searchParams.get("user_id");
    const model_id = urlObj.searchParams.get("model_id");

    if (!model_id) {
      return NextResponse.json(
        { message: "Malformed URL, no model_id detected!" },
        { status: 500 },
      );
    }

    if (!user_id) {
      return NextResponse.json(
        { message: "Malformed URL, no user_id detected!" },
        { status: 500 },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.admin.getUserById(user_id);

    if (userError || !user) {
      return NextResponse.json(
        { message: userError?.message || "Unauthorized" },
        { status: 401 },
      );
    }

    // Send email notification if Resend is configured
    if (resend && user.email) {
      await sendNotificationEmail(user.email, "model_trained");
    }

    // Update model status
    const { error: modelUpdatedError } = await supabase
      .from("models")
      .update({
        modelId: `${tune.id}`,
        status: "finished",
      })
      .eq("id", Number(model_id))
      .select();

    if (modelUpdatedError) {
      console.error({ modelUpdatedError });
      return NextResponse.json(
        { message: "Something went wrong!" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { message: "success" },
      { status: 200, statusText: "Success" },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }
}
