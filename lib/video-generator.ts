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
    | "Shuffle"
    | "FadeIn"
    | "FadeOut"
    | "SlideIn"
    | "SlideOut";
  video_clip_duration: number;
  video_count: number;
  video_duration_mode: "auto" | "target";
  video_target_duration: number;
  video_source: "pexels" | "pixabay" | "local";
  video_materials: VideoMaterialInput[] | null;
  custom_audio_file: string | null;
  video_language: string;
  tts_server: "azure-tts-v1" | "azure-tts-v2" | "siliconflow" | "gemini-tts";
  voice_name: string;
  azure_speech_region: string;
  azure_speech_key: string;
  siliconflow_api_key: string;
  voice_volume: number;
  voice_rate: number;
  bgm_type: "" | "random" | "custom";
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
  "Shuffle",
  "FadeIn",
  "FadeOut",
  "SlideIn",
  "SlideOut",
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

export const ttsServerOptions = [
  { value: "azure-tts-v1", label: "Azure TTS V1" },
  { value: "azure-tts-v2", label: "Azure TTS V2" },
  { value: "siliconflow", label: "SiliconFlow TTS" },
  { value: "gemini-tts", label: "Google Gemini TTS" },
] as const;

export const voiceOptionsByServer: Record<
  VideoGenerationInput["tts_server"],
  string[]
> = {
  "azure-tts-v1": [
    "en-US-AnaNeural-Female",
    "en-US-AriaNeural-Female",
    "en-US-JennyNeural-Female",
    "en-US-GuyNeural-Male",
    "en-US-JasonNeural-Male",
    "en-AU-NatashaNeural-Female",
    "en-GB-SoniaNeural-Female",
    "en-IN-NeerjaNeural-Female",
  ],
  "azure-tts-v2": [
    "en-US-AvaMultilingualNeural-V2-Female",
    "en-US-AndrewMultilingualNeural-V2-Male",
    "en-US-BrianMultilingualNeural-V2-Male",
    "en-US-EmmaMultilingualNeural-V2-Female",
    "en-US-RyanMultilingualNeural-V2-Male",
  ],
  siliconflow: [
    "siliconflow:FunAudioLLM/CosyVoice2-0.5B:david",
    "siliconflow:FunAudioLLM/CosyVoice2-0.5B:alex",
    "siliconflow:FunAudioLLM/CosyVoice2-0.5B:anna",
    "siliconflow:FunAudioLLM/CosyVoice2-0.5B:bella",
  ],
  "gemini-tts": [
    "gemini:Zephyr-Female",
    "gemini:Puck-Male",
    "gemini:Kore-Female",
    "gemini:Orus-Male",
    "gemini:Leda-Female",
    "gemini:Charon-Male",
  ],
};

export const fontNamePresets = [
  "MicrosoftYaHeiBold.ttc",
  "MicrosoftYaHeiNormal.ttc",
  "STHeitiMedium.ttc",
  "STHeitiLight.ttc",
  "Charm-Bold.ttf",
  "Charm-Regular.ttf",
  "UTM Kabel KT.ttf",
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
  video_target_duration: 30,
  video_source: "pexels",
  video_materials: null,
  custom_audio_file: null,
  video_language: "en-US",
  tts_server: "gemini-tts",
  voice_name: "gemini:Zephyr-Female",
  azure_speech_region: "",
  azure_speech_key: "",
  siliconflow_api_key: "",
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
