export type VideoMaterialInput = {
  provider: string;
  url: string;
  duration: number;
};

export type VideoGenerationInput = {
  video_subject: string;
  video_script: string;
  video_terms: string;
  video_aspect: "16:9" | "9:16" | "1:1";
  video_concat_mode: "random" | "sequential";
  video_transition_mode:
    | "None"
    | "FadeIn"
    | "FadeOut"
    | "FadeInOut"
    | "SlideIn"
    | "SlideOut"
    | "CrossFade";
  video_clip_duration: number;
  video_count: number;
  video_duration_mode: "auto" | "target";
  video_target_duration: number;
  video_source: "pexels" | "pixabay" | "local";
  video_materials: VideoMaterialInput[] | null;
  custom_audio_file: string | null;
  video_language: string;
  voice_name: string;
  voice_volume: number;
  voice_rate: number;
  bgm_type: "random" | "custom" | "none";
  bgm_file: string;
  bgm_volume: number;
  subtitle_enabled: boolean;
  subtitle_style:
    | "basic"
    | "revid"
    | "hormozi"
    | "wrap1"
    | "wrap2"
    | "elegant"
    | "difference"
    | "playful"
    | "bold_punch"
    | "movie"
    | "outline"
    | "floating";
  subtitle_position: "top" | "center" | "bottom" | "custom";
  custom_position: number;
  font_name: string;
  text_fore_color: string;
  text_background_color: boolean | string;
  font_size: number;
  stroke_color: string;
  stroke_width: number;
  n_threads: number;
  paragraph_number: number;
};

export const videoAspectOptions = ["16:9", "9:16", "1:1"] as const;
export const videoSourceOptions = ["pexels", "pixabay", "local"] as const;
export const videoConcatModeOptions = ["random", "sequential"] as const;
export const videoDurationModeOptions = ["auto", "target"] as const;
export const videoTransitionModeOptions = [
  "None",
  "FadeIn",
  "FadeOut",
  "FadeInOut",
  "SlideIn",
  "SlideOut",
  "CrossFade",
] as const;
export const subtitleStyleOptions = [
  "basic",
  "revid",
  "hormozi",
  "wrap1",
  "wrap2",
  "elegant",
  "difference",
  "playful",
  "bold_punch",
  "movie",
  "outline",
  "floating",
] as const;
export const subtitlePositionOptions = [
  "top",
  "center",
  "bottom",
  "custom",
] as const;

export const voiceNamePresets = [
  "en-AU-NatashaNeural-Female",
  "en-US-AvaMultilingualNeural-Female",
  "en-US-AndrewMultilingualNeural-Male",
  "gemini:Zephyr-Female",
  "gemini:Puck-Male",
];

export const fontNamePresets = [
  "MicrosoftYaHeiBold.ttc",
  "MicrosoftYaHeiNormal.ttc",
  "STHeitiMedium.ttc",
  "STHeitiLight.ttc",
  "Charm-Bold.ttf",
  "Charm-Regular.ttf",
];

export const defaultVideoGenerationInput: VideoGenerationInput = {
  video_subject: "",
  video_script: "",
  video_terms: "",
  video_aspect: "9:16",
  video_concat_mode: "random",
  video_transition_mode: "None",
  video_clip_duration: 3,
  video_count: 1,
  video_duration_mode: "target",
  video_target_duration: 20,
  video_source: "pexels",
  video_materials: null,
  custom_audio_file: null,
  video_language: "en-US",
  voice_name: "gemini:Zephyr-Female",
  voice_volume: 1,
  voice_rate: 1,
  bgm_type: "random",
  bgm_file: "",
  bgm_volume: 0.2,
  subtitle_enabled: true,
  subtitle_style: "hormozi",
  subtitle_position: "bottom",
  custom_position: 70,
  font_name: "Charm-Bold.ttf",
  text_fore_color: "#FFFFFF",
  text_background_color: true,
  font_size: 63,
  stroke_color: "#000000",
  stroke_width: 1.5,
  n_threads: 2,
  paragraph_number: 1,
};
