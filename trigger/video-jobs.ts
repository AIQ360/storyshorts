import { logger, task } from "@trigger.dev/sdk";
import { createClient } from "@supabase/supabase-js";
import { runVideoJobOnce } from "@/lib/video-job-runner";

type VideoJobPayload = {
  jobId: string;
  input?: Record<string, unknown>;
  appUrl?: string;
  engineBaseUrl?: string;
};

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
    const appUrl = payload.appUrl || process.env.NEXT_PUBLIC_APP_URL;
    const workerSecret = process.env.VIDEO_WORKER_SECRET;
    const engineBaseUrl = payload.engineBaseUrl || process.env.VIDEO_ENGINE_URL;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceRole =
      process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

    const missing: string[] = [];
    if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL or payload.appUrl");
    if (!workerSecret) missing.push("VIDEO_WORKER_SECRET");
    if (!engineBaseUrl) missing.push("VIDEO_ENGINE_URL or payload.engineBaseUrl");
    if (!payload.input || typeof payload.input !== "object") {
      if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
      if (!supabaseServiceRole) missing.push("SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY");
    }
    if (missing.length > 0) {
      throw new Error(`Missing required env for video job processing: ${missing.join(", ")}`);
    }

    let input = payload.input;
    if (!input || typeof input !== "object") {
      const supabase = createClient(supabaseUrl!, supabaseServiceRole!);
      const { data: job, error: jobError } = await supabase
        .from("video_jobs")
        .select("input_json")
        .eq("id", payload.jobId)
        .single();
      if (jobError || !job?.input_json || typeof job.input_json !== "object") {
        throw new Error("Unable to load job input from database");
      }
      input = job.input_json as Record<string, unknown>;
    }

    await runVideoJobOnce({
      jobId: payload.jobId,
      input,
      appUrl: appUrl!,
      engineBaseUrl: engineBaseUrl!,
      workerSecret: workerSecret!,
      triggerRunId: ctx.run.id,
    });

    logger.info("Video job processed", {
      jobId: payload.jobId,
      status: "completed_or_failed",
    });
  },
});
