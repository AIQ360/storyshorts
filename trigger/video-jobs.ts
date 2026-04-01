import { logger, task } from "@trigger.dev/sdk/v3";
import { createClient } from "@supabase/supabase-js";

type VideoJobPayload = {
  jobId: string;
};

async function updateJob(
  appUrl: string,
  workerSecret: string,
  payload: Record<string, unknown>,
) {
  const response = await fetch(`${appUrl}/api/internal/video-jobs/update`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-video-worker-secret": workerSecret,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(`Failed to update job: ${response.status}`);
  }
}

export const processVideoJobTask = task({
  id: "video-jobs-process",
  retry: {
    maxAttempts: 3,
    minTimeoutInMs: 5000,
    maxTimeoutInMs: 30000,
    factor: 2,
    randomize: true,
  },
  run: async (payload: VideoJobPayload, { ctx }) => {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole = process.env.SUPABASE_SECRET_KEY;

    if (!appUrl || !workerSecret || !supabaseUrl || !supabaseServiceRole) {
      throw new Error("Missing required env for video job processing");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceRole);
    const { data: job, error: jobError } = await supabase
      .from("video_jobs")
      .select("id,input_json")
      .eq("id", payload.jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    await updateJob(appUrl, workerSecret, {
      jobId: payload.jobId,
      status: "dispatching",
      progress: 10,
      eventType: "dispatching",
      eventPayload: { triggerRunId: ctx.run.id },
      triggerRunId: ctx.run.id,
    });

    const engineBaseUrl = process.env.VIDEO_ENGINE_URL;
    if (!engineBaseUrl) {
      throw new Error("VIDEO_ENGINE_URL is not configured");
    }

    const engineResponse = await fetch(`${engineBaseUrl}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId: payload.jobId,
        input: job.input_json,
      }),
    });

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text();
      await updateJob(appUrl, workerSecret, {
        jobId: payload.jobId,
        status: "failed",
        progress: 100,
        error: errorText || `Engine returned ${engineResponse.status}`,
        eventType: "failed",
        eventPayload: { httpStatus: engineResponse.status },
      });
      return;
    }

    const engineResult = await engineResponse.json();
    const isCompleted = engineResult?.status === "completed";
    const nextStatus = isCompleted ? "completed" : "failed";

    await updateJob(appUrl, workerSecret, {
      jobId: payload.jobId,
      status: nextStatus,
      progress: 100,
      output: engineResult?.output || {},
      error: isCompleted ? null : engineResult?.error || "Render failed",
      eventType: nextStatus,
      eventPayload: {
        engineJobId: engineResult?.engineJobId || null,
      },
      engineJobId: engineResult?.engineJobId || null,
      refundCredits: !isCompleted,
    });

    logger.info("Video job processed", {
      jobId: payload.jobId,
      status: nextStatus,
    });
  },
});
