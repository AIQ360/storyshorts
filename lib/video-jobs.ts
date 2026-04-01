export const VIDEO_JOB_STATUSES = [
  "queued",
  "dispatching",
  "rendering",
  "uploading",
  "completed",
  "failed",
  "canceled",
] as const;

export type VideoJobStatus = (typeof VIDEO_JOB_STATUSES)[number];

export function isVideoJobStatus(value: string): value is VideoJobStatus {
  return VIDEO_JOB_STATUSES.includes(value as VideoJobStatus);
}
