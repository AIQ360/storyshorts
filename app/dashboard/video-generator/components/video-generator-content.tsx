"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bot,
  Clapperboard,
  Loader2,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  defaultVideoGenerationInput,
  fontNamePresets,
  subtitlePositionOptions,
  subtitleStyleOptions,
  videoAspectOptions,
  videoConcatModeOptions,
  videoDurationModeOptions,
  videoSourceOptions,
  videoTransitionModeOptions,
  VideoGenerationInput,
  voiceNamePresets,
} from "@/lib/video-generator";

type VideoJob = {
  id: string;
  status: string;
  progress: number;
  error?: string | null;
  created_at: string;
  output_json?: Record<string, unknown> | null;
};

type VideoJobEvent = {
  id: number;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
};

type VideoJobDetail = {
  job: VideoJob;
  events: VideoJobEvent[];
};

type SectionId =
  | "content"
  | "video"
  | "audio"
  | "subtitle"
  | "advanced"
  | "materials";

const sectionLabels: Record<SectionId, string> = {
  content: "Content & AI",
  video: "Video Composition",
  audio: "Voice & Audio",
  subtitle: "Subtitle Styling",
  advanced: "Advanced Runtime",
  materials: "Local Materials",
};

function parseMaterials(raw: string) {
  const lines = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  return lines.map((url) => ({
    provider: "local",
    url,
    duration: 0,
  }));
}

export default function VideoGeneratorContent() {
  const [form, setForm] = useState<VideoGenerationInput>(defaultVideoGenerationInput);
  const [materialsText, setMaterialsText] = useState("");
  const [apiUrl, setApiUrl] = useState(
    process.env.NEXT_PUBLIC_VIDEO_API_URL || "http://127.0.0.1:8080/api/v1",
  );
  const [openSections, setOpenSections] = useState<SectionId[]>([
    "content",
    "video",
    "audio",
    "subtitle",
  ]);
  const [jobs, setJobs] = useState<VideoJob[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [jobDetail, setJobDetail] = useState<VideoJobDetail | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingTerms, setIsGeneratingTerms] = useState(false);
  const [isRefreshingJobs, setIsRefreshingJobs] = useState(false);

  const hasRunningJob = useMemo(
    () => jobs.some((job) => !["completed", "failed", "canceled"].includes(job.status)),
    [jobs],
  );

  const updateField = <K extends keyof VideoGenerationInput>(
    key: K,
    value: VideoGenerationInput[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSection = (id: SectionId) => {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const fetchJobs = async (pickFirst = false) => {
    setIsRefreshingJobs(true);
    try {
      const res = await fetch("/api/video-jobs?limit=30");
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch jobs");
      }
      const nextJobs = (data.jobs || []) as VideoJob[];
      setJobs(nextJobs);
      if (pickFirst && nextJobs.length > 0) {
        setSelectedJobId(nextJobs[0].id);
      }
    } catch (error: any) {
      toast.error(error?.message || "Unable to load render jobs");
    } finally {
      setIsRefreshingJobs(false);
    }
  };

  const fetchJobDetail = async (jobId: string) => {
    try {
      const res = await fetch(`/api/video-jobs/${jobId}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to load job details");
      }
      setJobDetail(data as VideoJobDetail);
    } catch (error: any) {
      toast.error(error?.message || "Unable to load job timeline");
    }
  };

  useEffect(() => {
    fetchJobs(true);
  }, []);

  useEffect(() => {
    if (!selectedJobId) {
      setJobDetail(null);
      return;
    }
    fetchJobDetail(selectedJobId);
  }, [selectedJobId]);

  useEffect(() => {
    if (!hasRunningJob) {
      return;
    }
    const timer = setInterval(() => {
      fetchJobs(false);
      if (selectedJobId) {
        fetchJobDetail(selectedJobId);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [hasRunningJob, selectedJobId]);

  const handleGenerateScript = async () => {
    if (!form.video_subject.trim()) {
      toast.error("Enter a video subject first");
      return;
    }
    setIsGeneratingScript(true);
    try {
      const res = await fetch(`${apiUrl}/scripts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_subject: form.video_subject,
          video_language: form.video_language,
          paragraph_number: form.paragraph_number,
          target_duration:
            form.video_duration_mode === "target" ? form.video_target_duration : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.status !== 200) {
        throw new Error(data?.message || "Script generation failed");
      }
      updateField("video_script", data?.data?.video_script || "");
      toast.success("Script generated");
    } catch (error: any) {
      toast.error(error?.message || "Script generation failed");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleGenerateTerms = async () => {
    if (!form.video_subject.trim() || !form.video_script.trim()) {
      toast.error("Need both subject and script to generate keywords");
      return;
    }
    setIsGeneratingTerms(true);
    try {
      const res = await fetch(`${apiUrl}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          video_subject: form.video_subject,
          video_script: form.video_script,
          amount: 5,
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.status !== 200) {
        throw new Error(data?.message || "Keyword generation failed");
      }
      const terms = data?.data?.video_terms || [];
      updateField("video_terms", Array.isArray(terms) ? terms.join(", ") : String(terms));
      toast.success("Keywords generated");
    } catch (error: any) {
      toast.error(error?.message || "Keyword generation failed");
    } finally {
      setIsGeneratingTerms(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.video_subject.trim() && !form.video_script.trim()) {
      toast.error("Provide a video subject or script");
      return;
    }
    if (form.video_source === "local") {
      const materials = parseMaterials(materialsText);
      updateField("video_materials", materials.length ? materials : null);
    } else {
      updateField("video_materials", null);
    }

    setIsSubmitting(true);
    try {
      const payload: VideoGenerationInput = {
        ...form,
        video_materials:
          form.video_source === "local" ? parseMaterials(materialsText) : null,
      };
      const res = await fetch("/api/video-jobs/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: payload,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to queue video job");
      }
      toast.success(data.status === "duplicate" ? "Existing job reused" : "Render job queued");
      await fetchJobs(true);
    } catch (error: any) {
      toast.error(error?.message || "Failed to queue video job");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-3 rounded-3xl border border-gray-200/70 bg-gradient-to-br from-white via-white to-indigo-50/50 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">Video Generator Studio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full MoneyPrinterTurbo parameter control, production-grade presets, and queue-based rendering.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => fetchJobs(false)}
            disabled={isRefreshingJobs}
            className="rounded-full"
          >
            {isRefreshingJobs ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Refresh Jobs
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full">
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PlayCircle className="mr-2 h-4 w-4" />
            )}
            Generate Video
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-gray-700">Python API URL</span>
                <input
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none ring-indigo-500 focus:ring-2"
                />
              </label>
            </div>
          </div>

          {(Object.keys(sectionLabels) as SectionId[]).map((sectionId) => (
            <div key={sectionId} className="overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
              <button
                onClick={() => toggleSection(sectionId)}
                className="flex w-full items-center justify-between px-5 py-4 text-left"
              >
                <span className="text-sm font-semibold text-gray-800">{sectionLabels[sectionId]}</span>
                <span className="text-lg">{openSections.includes(sectionId) ? "−" : "+"}</span>
              </button>
              {openSections.includes(sectionId) && (
                <div className="space-y-4 border-t border-gray-100 px-5 py-4">
                  {sectionId === "content" && (
                    <>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-gray-700">Video Subject</span>
                        <input
                          value={form.video_subject}
                          onChange={(e) => updateField("video_subject", e.target.value)}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                        />
                      </label>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Language</span>
                          <input
                            value={form.video_language}
                            onChange={(e) => updateField("video_language", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Paragraphs</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={form.paragraph_number}
                            onChange={(e) =>
                              updateField("paragraph_number", Number(e.target.value || 1))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Target Seconds</span>
                          <input
                            type="number"
                            min={10}
                            max={1800}
                            value={form.video_target_duration}
                            onChange={(e) =>
                              updateField("video_target_duration", Number(e.target.value || 20))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                          />
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={handleGenerateScript}
                          disabled={isGeneratingScript}
                        >
                          {isGeneratingScript ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Wand2 className="mr-2 h-4 w-4" />
                          )}
                          Generate Script
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="rounded-full"
                          onClick={handleGenerateTerms}
                          disabled={isGeneratingTerms}
                        >
                          {isGeneratingTerms ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                          )}
                          Generate Keywords
                        </Button>
                      </div>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-gray-700">Video Script</span>
                        <textarea
                          value={form.video_script}
                          onChange={(e) => updateField("video_script", e.target.value)}
                          rows={6}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                        />
                      </label>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-gray-700">Video Keywords</span>
                        <textarea
                          value={form.video_terms}
                          onChange={(e) => updateField("video_terms", e.target.value)}
                          rows={3}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2"
                        />
                      </label>
                    </>
                  )}

                  {sectionId === "video" && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Source</span>
                          <select
                            value={form.video_source}
                            onChange={(e) =>
                              updateField("video_source", e.target.value as VideoGenerationInput["video_source"])
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {videoSourceOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Aspect Ratio</span>
                          <select
                            value={form.video_aspect}
                            onChange={(e) =>
                              updateField("video_aspect", e.target.value as VideoGenerationInput["video_aspect"])
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {videoAspectOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Concat Mode</span>
                          <select
                            value={form.video_concat_mode}
                            onChange={(e) =>
                              updateField("video_concat_mode", e.target.value as VideoGenerationInput["video_concat_mode"])
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {videoConcatModeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Transition</span>
                          <select
                            value={form.video_transition_mode}
                            onChange={(e) =>
                              updateField(
                                "video_transition_mode",
                                e.target.value as VideoGenerationInput["video_transition_mode"],
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {videoTransitionModeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Duration Mode</span>
                          <select
                            value={form.video_duration_mode}
                            onChange={(e) =>
                              updateField("video_duration_mode", e.target.value as VideoGenerationInput["video_duration_mode"])
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {videoDurationModeOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Clip Seconds</span>
                          <input
                            type="number"
                            min={2}
                            max={30}
                            value={form.video_clip_duration}
                            onChange={(e) =>
                              updateField("video_clip_duration", Number(e.target.value || 3))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Video Count</span>
                          <input
                            type="number"
                            min={1}
                            max={10}
                            value={form.video_count}
                            onChange={(e) => updateField("video_count", Number(e.target.value || 1))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Target Duration</span>
                          <input
                            type="number"
                            min={10}
                            max={1800}
                            value={form.video_target_duration}
                            onChange={(e) =>
                              updateField("video_target_duration", Number(e.target.value || 20))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {sectionId === "audio" && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Voice Name</span>
                          <input
                            list="voice-presets"
                            value={form.voice_name}
                            onChange={(e) => updateField("voice_name", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                          <datalist id="voice-presets">
                            {voiceNamePresets.map((preset) => (
                              <option key={preset} value={preset} />
                            ))}
                          </datalist>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Custom Audio URL</span>
                          <input
                            value={form.custom_audio_file || ""}
                            onChange={(e) =>
                              updateField("custom_audio_file", e.target.value || null)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Voice Volume</span>
                          <input
                            type="number"
                            min={0}
                            max={2}
                            step={0.1}
                            value={form.voice_volume}
                            onChange={(e) =>
                              updateField("voice_volume", Number(e.target.value || 1))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Voice Rate</span>
                          <input
                            type="number"
                            min={0.5}
                            max={2}
                            step={0.1}
                            value={form.voice_rate}
                            onChange={(e) => updateField("voice_rate", Number(e.target.value || 1))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">BGM Volume</span>
                          <input
                            type="number"
                            min={0}
                            max={1}
                            step={0.1}
                            value={form.bgm_volume}
                            onChange={(e) => updateField("bgm_volume", Number(e.target.value || 0))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">BGM Type</span>
                          <select
                            value={form.bgm_type}
                            onChange={(e) =>
                              updateField("bgm_type", e.target.value as VideoGenerationInput["bgm_type"])
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            <option value="random">random</option>
                            <option value="custom">custom</option>
                            <option value="none">none</option>
                          </select>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">BGM File Name</span>
                          <input
                            value={form.bgm_file}
                            onChange={(e) => updateField("bgm_file", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {sectionId === "subtitle" && (
                    <>
                      <div className="grid gap-3 md:grid-cols-2">
                        <label className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={form.subtitle_enabled}
                            onChange={(e) => updateField("subtitle_enabled", e.target.checked)}
                          />
                          Enable subtitles
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Subtitle Style</span>
                          <select
                            value={form.subtitle_style}
                            onChange={(e) =>
                              updateField(
                                "subtitle_style",
                                e.target.value as VideoGenerationInput["subtitle_style"],
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {subtitleStyleOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-3">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Position</span>
                          <select
                            value={form.subtitle_position}
                            onChange={(e) =>
                              updateField(
                                "subtitle_position",
                                e.target.value as VideoGenerationInput["subtitle_position"],
                              )
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          >
                            {subtitlePositionOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Custom Position %</span>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            value={form.custom_position}
                            onChange={(e) =>
                              updateField("custom_position", Number(e.target.value || 70))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Font Name</span>
                          <input
                            list="font-presets"
                            value={form.font_name}
                            onChange={(e) => updateField("font_name", e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                          <datalist id="font-presets">
                            {fontNamePresets.map((preset) => (
                              <option key={preset} value={preset} />
                            ))}
                          </datalist>
                        </label>
                      </div>
                      <div className="grid gap-3 md:grid-cols-4">
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Text Color</span>
                          <input
                            type="color"
                            value={form.text_fore_color}
                            onChange={(e) => updateField("text_fore_color", e.target.value)}
                            className="h-10 w-full rounded-xl border border-gray-200 px-1 py-1"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Stroke Color</span>
                          <input
                            type="color"
                            value={form.stroke_color}
                            onChange={(e) => updateField("stroke_color", e.target.value)}
                            className="h-10 w-full rounded-xl border border-gray-200 px-1 py-1"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Font Size</span>
                          <input
                            type="number"
                            min={20}
                            max={120}
                            value={form.font_size}
                            onChange={(e) => updateField("font_size", Number(e.target.value || 60))}
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                        <label className="space-y-2 text-sm">
                          <span className="font-medium text-gray-700">Stroke Width</span>
                          <input
                            type="number"
                            min={0}
                            max={10}
                            step={0.1}
                            value={form.stroke_width}
                            onChange={(e) =>
                              updateField("stroke_width", Number(e.target.value || 1.5))
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2"
                          />
                        </label>
                      </div>
                    </>
                  )}

                  {sectionId === "advanced" && (
                    <div className="grid gap-3 md:grid-cols-3">
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-gray-700">Threads</span>
                        <input
                          type="number"
                          min={1}
                          max={16}
                          value={form.n_threads}
                          onChange={(e) => updateField("n_threads", Number(e.target.value || 2))}
                          className="w-full rounded-xl border border-gray-200 px-3 py-2"
                        />
                      </label>
                      <label className="space-y-2 text-sm">
                        <span className="font-medium text-gray-700">Text Background</span>
                        <select
                          value={String(form.text_background_color)}
                          onChange={(e) =>
                            updateField(
                              "text_background_color",
                              e.target.value === "true" ? true : e.target.value,
                            )
                          }
                          className="w-full rounded-xl border border-gray-200 px-3 py-2"
                        >
                          <option value="true">true</option>
                          <option value="false">false</option>
                          <option value="#00000080">semi-black</option>
                          <option value="#1F2937A0">charcoal</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {sectionId === "materials" && (
                    <label className="space-y-2 text-sm">
                      <span className="font-medium text-gray-700">
                        Local Material URLs (one URL per line)
                      </span>
                      <textarea
                        value={materialsText}
                        onChange={(e) => setMaterialsText(e.target.value)}
                        rows={6}
                        className={cn(
                          "w-full rounded-xl border border-gray-200 px-3 py-2 outline-none ring-indigo-500 focus:ring-2",
                          form.video_source !== "local" && "opacity-50",
                        )}
                        disabled={form.video_source !== "local"}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-800">Render Queue</h2>
              <span className="text-xs text-muted-foreground">{jobs.length} jobs</span>
            </div>
            <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {jobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={cn(
                    "w-full rounded-xl border px-3 py-3 text-left transition",
                    selectedJobId === job.id
                      ? "border-indigo-300 bg-indigo-50/50"
                      : "border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-gray-600">{job.id.slice(0, 8)}</span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-[11px] font-medium capitalize",
                        job.status === "completed" && "bg-emerald-100 text-emerald-700",
                        job.status === "failed" && "bg-rose-100 text-rose-700",
                        !["completed", "failed"].includes(job.status) &&
                          "bg-blue-100 text-blue-700",
                      )}
                    >
                      {job.status}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 rounded bg-gray-100">
                    <div
                      className="h-full rounded bg-indigo-500 transition-all"
                      style={{ width: `${Math.max(0, Math.min(100, Number(job.progress || 0)))}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {new Date(job.created_at).toLocaleString()}
                  </p>
                </button>
              ))}
              {jobs.length === 0 && (
                <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-muted-foreground">
                  No video jobs yet
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200/70 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Bot className="h-4 w-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-gray-800">Job Timeline</h2>
            </div>
            {!jobDetail && (
              <div className="rounded-xl border border-dashed border-gray-200 p-6 text-sm text-muted-foreground">
                Pick a job to view live events and outputs.
              </div>
            )}
            {jobDetail && (
              <div className="space-y-3">
                <div className="rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700">Status</span>
                    <span className="capitalize text-gray-900">{jobDetail.job.status}</span>
                  </div>
                  {jobDetail.job.error && (
                    <p className="mt-2 text-xs text-rose-600">{jobDetail.job.error}</p>
                  )}
                  {!!jobDetail.job.output_json &&
                    Object.keys(jobDetail.job.output_json || {}).length > 0 && (
                      <pre className="mt-2 max-h-40 overflow-auto rounded-lg bg-black/90 p-2 text-[11px] text-emerald-300">
                        {JSON.stringify(jobDetail.job.output_json, null, 2)}
                      </pre>
                    )}
                </div>
                <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                  {jobDetail.events.map((event) => (
                    <div key={event.id} className="rounded-xl border border-gray-200 px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-700">
                          {event.event_type}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(event.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      {Object.keys(event.payload || {}).length > 0 && (
                        <pre className="mt-1 overflow-auto rounded bg-gray-50 p-2 text-[11px] text-gray-600">
                          {JSON.stringify(event.payload, null, 2)}
                        </pre>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6 z-40 sm:hidden">
        <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full shadow-lg">
          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clapperboard className="mr-2 h-4 w-4" />}
          Render
        </Button>
      </div>
    </div>
  );
}
