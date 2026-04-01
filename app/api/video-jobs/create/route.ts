export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { tasks } from "@trigger.dev/sdk";
import { createClient } from "@/lib/supabase/server";
import { getPlatformConfig } from "@/lib/credits";

function buildIdempotencyKey(userId: string, input: Record<string, unknown>) {
  const payload = JSON.stringify(input);
  return createHash("sha256").update(`${userId}:${payload}`).digest("hex");
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const input = body?.input;
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      return NextResponse.json(
        { error: "input must be a JSON object" },
        { status: 400 },
      );
    }

    const providedIdempotencyKey = body?.idempotencyKey;
    const idempotencyKey =
      typeof providedIdempotencyKey === "string" && providedIdempotencyKey.trim()
        ? providedIdempotencyKey.trim()
        : buildIdempotencyKey(user.id, input);

    const platformConfig = await getPlatformConfig();
    const requiredCredits = Math.max(0, platformConfig.video_render_credits || 10);

    const { data, error } = await supabase.rpc("create_video_job", {
      p_user_id: user.id,
      p_input_json: input,
      p_required_credits: requiredCredits,
      p_idempotency_key: idempotencyKey,
    });

    if (error) {
      const message = error.message || "Failed to create video job";
      if (message.includes("INSUFFICIENT_CREDITS")) {
        return NextResponse.json(
          {
            error: "Not enough credits to start a video render job.",
            requiredCredits,
          },
          { status: 402 },
        );
      }
      if (message.includes("UNAUTHORIZED")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const jobId = data?.job_id;
    const status = data?.status || "queued";
    if (!jobId) {
      return NextResponse.json(
        { error: "Job was not created successfully" },
        { status: 500 },
      );
    }

    if (status !== "duplicate") {
      try {
        await tasks.trigger("video-jobs-process", {
          jobId,
        });
      } catch (triggerError) {
        console.error("Failed to trigger video job task", triggerError);
      }
    }

    return NextResponse.json({
      success: true,
      jobId,
      status,
      requiredCredits,
      idempotencyKey,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 },
    );
  }
}
