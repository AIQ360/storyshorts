type RunVideoJobInput = {
  jobId: string;
  input: Record<string, unknown>;
  appUrl: string;
  engineBaseUrl: string;
  workerSecret: string;
  triggerRunId?: string;
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

export async function runVideoJobOnce(params: RunVideoJobInput) {
  const { jobId, input, appUrl, engineBaseUrl, workerSecret, triggerRunId } = params;
  try {
    await updateJob(appUrl, workerSecret, {
      jobId,
      status: "dispatching",
      progress: 10,
      eventType: "dispatching",
      eventPayload: { triggerRunId: triggerRunId || null },
      triggerRunId: triggerRunId || null,
    });

    const engineResponse = await fetch(`${engineBaseUrl}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jobId,
        input,
      }),
    });

    if (!engineResponse.ok) {
      const errorText = await engineResponse.text();
      await updateJob(appUrl, workerSecret, {
        jobId,
        status: "failed",
        progress: 100,
        error: errorText || `Engine returned ${engineResponse.status}`,
        eventType: "failed",
        eventPayload: { httpStatus: engineResponse.status },
        refundCredits: true,
      });
      return;
    }

    const engineResult = await engineResponse.json();
    const isCompleted = engineResult?.status === "completed";
    const nextStatus = isCompleted ? "completed" : "failed";

    await updateJob(appUrl, workerSecret, {
      jobId,
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
  } catch (error: any) {
    await updateJob(appUrl, workerSecret, {
      jobId,
      status: "failed",
      progress: 100,
      error: error?.message || "Job execution failed",
      eventType: "failed",
      eventPayload: { reason: "local-runner-exception" },
      refundCredits: true,
    });
  }
}
