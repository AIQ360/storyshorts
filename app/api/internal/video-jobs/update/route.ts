export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { getAdminSupabase } from "@/lib/admin";
import { isVideoJobStatus } from "@/lib/video-jobs";

function isAuthorized(req: NextRequest) {
  const configuredSecret = process.env.VIDEO_WORKER_SECRET;
  if (!configuredSecret) {
    return false;
  }
  const requestSecret = req.headers.get("x-video-worker-secret");
  return requestSecret === configuredSecret;
}

export async function POST(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const jobId = body?.jobId as string;
    const status = body?.status as string;

    if (!jobId || typeof jobId !== "string") {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }
    if (!status || typeof status !== "string" || !isVideoJobStatus(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const adminSupabase = getAdminSupabase();
    const { data: existingJob, error: existingError } = await adminSupabase
      .from("video_jobs")
      .select("id,user_id,required_credits")
      .eq("id", jobId)
      .single();

    if (existingError || !existingJob) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const updatePayload: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };
    if (typeof body.progress === "number") {
      updatePayload.progress = Math.max(0, Math.min(100, body.progress));
    }
    if (typeof body.error === "string") {
      updatePayload.error = body.error;
    }
    if (body.output && typeof body.output === "object") {
      updatePayload.output_json = body.output;
    }
    if (typeof body.triggerRunId === "string") {
      updatePayload.trigger_run_id = body.triggerRunId;
    }
    if (typeof body.engineJobId === "string") {
      updatePayload.engine_job_id = body.engineJobId;
    }

    const { error: updateError } = await adminSupabase
      .from("video_jobs")
      .update(updatePayload)
      .eq("id", jobId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const eventType =
      typeof body.eventType === "string" && body.eventType.trim()
        ? body.eventType.trim()
        : status;
    const eventPayload =
      body.eventPayload && typeof body.eventPayload === "object"
        ? body.eventPayload
        : {};

    const { error: eventError } = await adminSupabase.from("video_job_events").insert({
      job_id: jobId,
      user_id: existingJob.user_id,
      event_type: eventType,
      payload: eventPayload,
    });

    if (eventError) {
      return NextResponse.json({ error: eventError.message }, { status: 500 });
    }

    if (status === "failed" && body.refundCredits === true) {
      await adminSupabase.rpc("exec_sql", {
        sql: `update public.credits set credits = credits + ${Number(existingJob.required_credits || 0)} where user_id = '${existingJob.user_id}'::uuid;`,
      });
      await adminSupabase
        .from("video_jobs")
        .update({ consumed_credits: 0 })
        .eq("id", jobId);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 },
    );
  }
}
