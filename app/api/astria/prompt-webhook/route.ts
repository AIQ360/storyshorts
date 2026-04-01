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

export async function POST(request: Request) {
  type PromptData = {
    id: number;
    text: string;
    negative_prompt: string;
    steps: null;
    tune_id: number;
    trained_at: string;
    started_training_at: string;
    created_at: string;
    updated_at: string;
    images: string[];
  };

  const incomingData = (await request.json()) as { prompt: PromptData };

  const { prompt } = incomingData;

  console.log({ prompt });

  const urlObj = new URL(request.url);
  const user_id = urlObj.searchParams.get("user_id");
  const model_id = urlObj.searchParams.get("model_id");

  if (!model_id) {
    return NextResponse.json(
      {
        message: "Malformed URL, no model_id detected!",
      },
      { status: 500 },
    );
  }

  if (!user_id) {
    return NextResponse.json(
      {
        message: "Malformed URL, no user_id detected!",
      },
      { status: 500 },
    );
  }

  const supabase = createClient<Database>(
    supabaseUrl as string,
    supabaseSecretKey as string,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    },
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.admin.getUserById(user_id);

  if (error) {
    return NextResponse.json(
      {
        message: error.message,
      },
      { status: 401 },
    );
  }

  if (!user) {
    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    // Here we join all of the arrays into one.
    const allHeadshots = prompt.images;

    const { data: model, error: modelError } = await supabase
      .from("models")
      .select("*")
      .eq("id", Number(model_id))
      .single();

    if (modelError) {
      console.error({ modelError });
      return NextResponse.json(
        {
          message: "Something went wrong!",
        },
        { status: 500 },
      );
    }

    await Promise.all(
      allHeadshots.map(async (image) => {
        const { error: imageError } = await supabase.from("images").insert({
          modelId: Number(model.id),
          uri: image,
        });
        if (imageError) {
          console.error({ imageError });
        }
      }),
    );

    // Send ONE "headshots_ready" email per model using an atomic flag.
    // Only the first prompt-webhook to flip email_notified from false → true sends the email.
    if (resend && user.email) {
      const { data: flagged } = await supabase
        .from("models")
        .update({ email_notified: true })
        .eq("id", Number(model_id))
        .eq("email_notified", false)
        .select("id");

      // flagged will have data only for the FIRST webhook that wins the race
      if (flagged && flagged.length > 0) {
        await sendNotificationEmail(user.email, "headshots_ready");
      } else {
        console.log(
          `[email] Skipping duplicate "headshots_ready" for model ${model_id}`,
        );
      }
    }

    return NextResponse.json(
      {
        message: "success",
      },
      { status: 200, statusText: "Success" },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        message: "Something went wrong!",
      },
      { status: 500 },
    );
  }
}
