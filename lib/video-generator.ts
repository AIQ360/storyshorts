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

export const supportedLanguages = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-AU", label: "English (AU)" },
  { value: "en-CA", label: "English (CA)" },
  { value: "en-IN", label: "English (India)" },
  { value: "en-PH", label: "English (Philippines)" },
  { value: "zh-CN", label: "Chinese (Simplified)" },
  { value: "zh-TW", label: "Chinese (Traditional)" },
  { value: "es-ES", label: "Spanish (Spain)" },
  { value: "es-MX", label: "Spanish (Mexico)" },
  { value: "es-US", label: "Spanish (US)" },
  { value: "es-CO", label: "Spanish (Colombia)" },
  { value: "es-AR", label: "Spanish (Argentina)" },
  { value: "fr-FR", label: "French" },
  { value: "fr-CA", label: "French (Canada)" },
  { value: "de-DE", label: "German" },
  { value: "it-IT", label: "Italian" },
  { value: "ja-JP", label: "Japanese" },
  { value: "ko-KR", label: "Korean" },
  { value: "pt-BR", label: "Portuguese (Brazil)" },
  { value: "pt-PT", label: "Portuguese (Portugal)" },
  { value: "ru-RU", label: "Russian" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { value: "ar-AE", label: "Arabic (UAE)" },
  { value: "ar-EG", label: "Arabic (Egypt)" },
  { value: "hi-IN", label: "Hindi" },
  { value: "ta-IN", label: "Tamil" },
  { value: "te-IN", label: "Telugu" },
  { value: "ur-PK", label: "Urdu" },
  { value: "tr-TR", label: "Turkish" },
  { value: "nl-NL", label: "Dutch" },
  { value: "da-DK", label: "Danish" },
  { value: "sv-SE", label: "Swedish" },
  { value: "vi-VN", label: "Vietnamese" },
  { value: "id-ID", label: "Indonesian" },
  { value: "th-VN", label: "Thai" },
  { value: "ro-RO", label: "Romanian" },
  { value: "uk-UA", label: "Ukrainian" },
  { value: "he-UA", label: "Hebrew" },
  { value: "el-IL", label: "Greek" },
  { value: "zu-ZA", label: "Zulu" },
];

export type VoiceOption = {
  value: string;
  label: string;
  description: string;
  engine: "gemini-tts" | "azure-tts-v1";
  tags: string[];
  previewUrl?: string;
  isPremium?: boolean;
};

export const unifiedVoiceOptions: VoiceOption[] = [
  // Gemini Voices (30 Options)
  { value: "gemini:Zephyr", label: "Zephyr", description: "Bright", engine: "gemini-tts", tags: ["Gemini","Bright"], isPremium: true },
  { value: "gemini:Puck", label: "Puck", description: "Upbeat", engine: "gemini-tts", tags: ["Gemini","Upbeat"], isPremium: true },
  { value: "gemini:Charon", label: "Charon", description: "Informative", engine: "gemini-tts", tags: ["Gemini","Informative"], isPremium: true },
  { value: "gemini:Kore", label: "Kore", description: "Firm", engine: "gemini-tts", tags: ["Gemini","Firm"], isPremium: true },
  { value: "gemini:Fenrir", label: "Fenrir", description: "Excitable", engine: "gemini-tts", tags: ["Gemini","Excitable"], isPremium: true },
  { value: "gemini:Leda", label: "Leda", description: "Youthful", engine: "gemini-tts", tags: ["Gemini","Youthful"], isPremium: true },
  { value: "gemini:Orus", label: "Orus", description: "Firm", engine: "gemini-tts", tags: ["Gemini","Firm"], isPremium: true },
  { value: "gemini:Aoede", label: "Aoede", description: "Breezy", engine: "gemini-tts", tags: ["Gemini","Breezy"], isPremium: true },
  { value: "gemini:Callirrhoe", label: "Callirrhoe", description: "Easy-going", engine: "gemini-tts", tags: ["Gemini","Easy-going"], isPremium: true },
  { value: "gemini:Autonoe", label: "Autonoe", description: "Bright", engine: "gemini-tts", tags: ["Gemini","Bright"], isPremium: true },
  { value: "gemini:Enceladus", label: "Enceladus", description: "Breathy", engine: "gemini-tts", tags: ["Gemini","Breathy"], isPremium: true },
  { value: "gemini:Iapetus", label: "Iapetus", description: "Clear", engine: "gemini-tts", tags: ["Gemini","Clear"], isPremium: true },
  { value: "gemini:Umbriel", label: "Umbriel", description: "Easy-going", engine: "gemini-tts", tags: ["Gemini","Easy-going"], isPremium: true },
  { value: "gemini:Algieba", label: "Algieba", description: "Smooth", engine: "gemini-tts", tags: ["Gemini","Smooth"], isPremium: true },
  { value: "gemini:Despina", label: "Despina", description: "Smooth", engine: "gemini-tts", tags: ["Gemini","Smooth"], isPremium: true },
  { value: "gemini:Erinome", label: "Erinome", description: "Clear", engine: "gemini-tts", tags: ["Gemini","Clear"], isPremium: true },
  { value: "gemini:Algenib", label: "Algenib", description: "Gravelly", engine: "gemini-tts", tags: ["Gemini","Gravelly"], isPremium: true },
  { value: "gemini:Rasalgethi", label: "Rasalgethi", description: "Informative", engine: "gemini-tts", tags: ["Gemini","Informative"], isPremium: true },
  { value: "gemini:Laomedeia", label: "Laomedeia", description: "Upbeat", engine: "gemini-tts", tags: ["Gemini","Upbeat"], isPremium: true },
  { value: "gemini:Achernar", label: "Achernar", description: "Soft", engine: "gemini-tts", tags: ["Gemini","Soft"], isPremium: true },
  { value: "gemini:Alnilam", label: "Alnilam", description: "Firm", engine: "gemini-tts", tags: ["Gemini","Firm"], isPremium: true },
  { value: "gemini:Schedar", label: "Schedar", description: "Even", engine: "gemini-tts", tags: ["Gemini","Even"], isPremium: true },
  { value: "gemini:Gacrux", label: "Gacrux", description: "Mature", engine: "gemini-tts", tags: ["Gemini","Mature"], isPremium: true },
  { value: "gemini:Pulcherrima", label: "Pulcherrima", description: "Forward", engine: "gemini-tts", tags: ["Gemini","Forward"], isPremium: true },
  { value: "gemini:Achird", label: "Achird", description: "Friendly", engine: "gemini-tts", tags: ["Gemini","Friendly"], isPremium: true },
  { value: "gemini:Zubenelgenubi", label: "Zubenelgenubi", description: "Casual", engine: "gemini-tts", tags: ["Gemini","Casual"], isPremium: true },
  { value: "gemini:Vindemiatrix", label: "Vindemiatrix", description: "Gentle", engine: "gemini-tts", tags: ["Gemini","Gentle"], isPremium: true },
  { value: "gemini:Sadachbia", label: "Sadachbia", description: "Lively", engine: "gemini-tts", tags: ["Gemini","Lively"], isPremium: true },
  { value: "gemini:Sadaltager", label: "Sadaltager", description: "Knowledgeable", engine: "gemini-tts", tags: ["Gemini","Knowledgeable"], isPremium: true },
  { value: "gemini:Sulafat", label: "Sulafat", description: "Warm", engine: "gemini-tts", tags: ["Gemini","Warm"], isPremium: true },

  // Edge TTS Multilingual (Premium)
  { value: "en-US-AvaMultilingualNeural", label: "Ava", description: "Expressive, Caring, Pleasant", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "en-US-AndrewMultilingualNeural", label: "Andrew", description: "Warm, Confident, Authentic", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "en-US-EmmaMultilingualNeural", label: "Emma", description: "Cheerful, Clear, Conversational", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "en-US-BrianMultilingualNeural", label: "Brian", description: "Approachable, Casual", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "de-DE-SeraphinaMultilingualNeural", label: "Seraphina", description: "Multilingual German", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "de-DE-FlorianMultilingualNeural", label: "Florian", description: "Multilingual German", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "fr-FR-VivienneMultilingualNeural", label: "Vivienne", description: "Multilingual French", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "fr-FR-RemyMultilingualNeural", label: "Remy", description: "Multilingual French", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "it-IT-GiuseppeMultilingualNeural", label: "Giuseppe", description: "Multilingual Italian", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "ko-KR-HyunsuMultilingualNeural", label: "Hyunsu", description: "Multilingual Korean", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },
  { value: "pt-BR-ThalitaMultilingualNeural", label: "Thalita", description: "Multilingual Portuguese", engine: "azure-tts-v1", tags: ["Edge","Multilingual"], isPremium: true },

  // Edge TTS Standard (Free)
  { value: "en-US-JennyNeural", label: "Jenny", description: "Popular, Conversational", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-GuyNeural", label: "Guy", description: "Reddit / Storytime", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-ChristopherNeural", label: "Christopher", description: "Documentary / Authority", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-AriaNeural", label: "Aria", description: "Positive, Confident", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-AnaNeural", label: "Ana", description: "Cute / Cartoon", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-EricNeural", label: "Eric", description: "Rational / News", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-MichelleNeural", label: "Michelle", description: "Pleasant / News", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-RogerNeural", label: "Roger", description: "Lively / News", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-SteffanNeural", label: "Steffan", description: "Rational / News", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-AvaNeural", label: "Ava", description: "Expressive", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-AndrewNeural", label: "Andrew", description: "Warm / Honest", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-EmmaNeural", label: "Emma", description: "Cheerful", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-US-BrianNeural", label: "Brian", description: "Sincere", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "en-GB-LibbyNeural", label: "Libby", description: "Female, UK", engine: "azure-tts-v1", tags: ["Edge","UK"] },
  { value: "en-GB-MaisieNeural", label: "Maisie", description: "Female, UK", engine: "azure-tts-v1", tags: ["Edge","UK"] },
  { value: "en-GB-RyanNeural", label: "Ryan", description: "Male, UK", engine: "azure-tts-v1", tags: ["Edge","UK"] },
  { value: "en-GB-SoniaNeural", label: "Sonia", description: "Female, UK", engine: "azure-tts-v1", tags: ["Edge","UK"] },
  { value: "en-GB-ThomasNeural", label: "Thomas", description: "Male, UK", engine: "azure-tts-v1", tags: ["Edge","UK"] },
  { value: "en-AU-NatashaNeural", label: "Natasha", description: "Female, AU", engine: "azure-tts-v1", tags: ["Edge","AU"] },
  { value: "en-AU-WilliamNeural", label: "William", description: "Male, AU", engine: "azure-tts-v1", tags: ["Edge","AU"] },
  { value: "en-CA-ClaraNeural", label: "Clara", description: "Female, CA", engine: "azure-tts-v1", tags: ["Edge","CA"] },
  { value: "en-CA-LiamNeural", label: "Liam", description: "Male, CA", engine: "azure-tts-v1", tags: ["Edge","CA"] },
  { value: "en-IN-NeerjaExpressiveNeural", label: "Neerja", description: "Female, IN Expressive", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "en-IN-PrabhatNeural", label: "Prabhat", description: "Male, IN", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "en-PH-RosaNeural", label: "Rosa", description: "Female, PH", engine: "azure-tts-v1", tags: ["Edge","PH"] },
  { value: "en-PH-JamesNeural", label: "James", description: "Male, PH", engine: "azure-tts-v1", tags: ["Edge","PH"] },
  { value: "zh-CN-XiaoxiaoNeural", label: "Xiaoxiao", description: "Warm / Narration", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-YunxiNeural", label: "Yunxi", description: "Lively / Sunshine", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-XiaoyiNeural", label: "Xiaoyi", description: "Lively / Cartoon", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-YunxiaNeural", label: "Yunxia", description: "Cute / Cartoon", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-YunjianNeural", label: "Yunjian", description: "Passion / Sports", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-YunyangNeural", label: "Yunyang", description: "Professional / News", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-CN-XiaobeiNeural", label: "Xiaobei", description: "Humorous", engine: "azure-tts-v1", tags: ["Edge","CN"] },
  { value: "zh-TW-HsiaoChenNeural", label: "HsiaoChen", description: "Standard Taiwanese", engine: "azure-tts-v1", tags: ["Edge","TW"] },
  { value: "es-MX-DaliaNeural", label: "Dalia", description: "Female, MX", engine: "azure-tts-v1", tags: ["Edge","MX"] },
  { value: "es-MX-JorgeNeural", label: "Jorge", description: "Male, MX", engine: "azure-tts-v1", tags: ["Edge","MX"] },
  { value: "es-US-AlonsoNeural", label: "Alonso", description: "Male, US Spanish", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "es-US-PalomaNeural", label: "Paloma", description: "Female, US Spanish", engine: "azure-tts-v1", tags: ["Edge","US"] },
  { value: "es-CO-GonzaloNeural", label: "Gonzalo", description: "Male, CO", engine: "azure-tts-v1", tags: ["Edge","CO"] },
  { value: "es-CO-SalomeNeural", label: "Salome", description: "Female, CO", engine: "azure-tts-v1", tags: ["Edge","CO"] },
  { value: "es-AR-ElenaNeural", label: "Elena", description: "Female, AR", engine: "azure-tts-v1", tags: ["Edge","AR"] },
  { value: "es-ES-AlvaroNeural", label: "Alvaro", description: "Male, ES", engine: "azure-tts-v1", tags: ["Edge","ES"] },
  { value: "es-ES-ElviraNeural", label: "Elvira", description: "Female, ES", engine: "azure-tts-v1", tags: ["Edge","ES"] },
  { value: "es-ES-XimenaNeural", label: "Ximena", description: "Female, ES", engine: "azure-tts-v1", tags: ["Edge","ES"] },
  { value: "pt-BR-AntonioNeural", label: "Antonio", description: "Male, BR", engine: "azure-tts-v1", tags: ["Edge","BR"] },
  { value: "pt-BR-FranciscaNeural", label: "Francisca", description: "Female, BR", engine: "azure-tts-v1", tags: ["Edge","BR"] },
  { value: "pt-PT-DuarteNeural", label: "Duarte", description: "Male, PT", engine: "azure-tts-v1", tags: ["Edge","PT"] },
  { value: "pt-PT-RaquelNeural", label: "Raquel", description: "Female, PT", engine: "azure-tts-v1", tags: ["Edge","PT"] },
  { value: "fr-FR-DeniseNeural", label: "Denise", description: "Female, FR", engine: "azure-tts-v1", tags: ["Edge","FR"] },
  { value: "fr-FR-HenriNeural", label: "Henri", description: "Male, FR", engine: "azure-tts-v1", tags: ["Edge","FR"] },
  { value: "fr-CA-SylvieNeural", label: "Sylvie", description: "Female, CA", engine: "azure-tts-v1", tags: ["Edge","CA"] },
  { value: "fr-CA-AntoineNeural", label: "Antoine", description: "Male, CA", engine: "azure-tts-v1", tags: ["Edge","CA"] },
  { value: "de-DE-AmalaNeural", label: "Amala", description: "Female, DE", engine: "azure-tts-v1", tags: ["Edge","DE"] },
  { value: "de-DE-ConradNeural", label: "Conrad", description: "Male, DE", engine: "azure-tts-v1", tags: ["Edge","DE"] },
  { value: "de-DE-KillianNeural", label: "Killian", description: "Male, DE", engine: "azure-tts-v1", tags: ["Edge","DE"] },
  { value: "de-DE-KatjaNeural", label: "Katja", description: "Female, DE", engine: "azure-tts-v1", tags: ["Edge","DE"] },
  { value: "it-IT-ElsaNeural", label: "Elsa", description: "Female, IT", engine: "azure-tts-v1", tags: ["Edge","IT"] },
  { value: "it-IT-DiegoNeural", label: "Diego", description: "Male, IT", engine: "azure-tts-v1", tags: ["Edge","IT"] },
  { value: "nl-NL-ColetteNeural", label: "Colette", description: "Female, NL", engine: "azure-tts-v1", tags: ["Edge","NL"] },
  { value: "da-DK-ChristelNeural", label: "Christel", description: "Female, DK", engine: "azure-tts-v1", tags: ["Edge","DK"] },
  { value: "ja-JP-NanamiNeural", label: "Nanami", description: "Female, JP", engine: "azure-tts-v1", tags: ["Edge","JP"] },
  { value: "ja-JP-KeitaNeural", label: "Keita", description: "Male, JP", engine: "azure-tts-v1", tags: ["Edge","JP"] },
  { value: "ko-KR-SunHiNeural", label: "SunHi", description: "Female, KR", engine: "azure-tts-v1", tags: ["Edge","KR"] },
  { value: "ko-KR-InJoonNeural", label: "InJoon", description: "Male, KR", engine: "azure-tts-v1", tags: ["Edge","KR"] },
  { value: "id-ID-GadisNeural", label: "Gadis", description: "Female, ID", engine: "azure-tts-v1", tags: ["Edge","ID"] },
  { value: "id-ID-ArdiNeural", label: "Ardi", description: "Male, ID", engine: "azure-tts-v1", tags: ["Edge","ID"] },
  { value: "vi-VN-HoaiMyNeural", label: "HoaiMy", description: "Female, VN", engine: "azure-tts-v1", tags: ["Edge","VN"] },
  { value: "vi-VN-NamMinhNeural", label: "NamMinh", description: "Male, VN", engine: "azure-tts-v1", tags: ["Edge","VN"] },
  { value: "hi-IN-MadhurNeural", label: "Madhur", description: "Male, IN Hindi", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "hi-IN-SwaraNeural", label: "Swara", description: "Female, IN Hindi", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "ta-IN-PallaviNeural", label: "Pallavi", description: "Female, IN Tamil", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "ta-IN-ValluvarNeural", label: "Valluvar", description: "Male, IN Tamil", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "te-IN-ShrutiNeural", label: "Shruti", description: "Female, IN Telugu", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "te-IN-MohanNeural", label: "Mohan", description: "Male, IN Telugu", engine: "azure-tts-v1", tags: ["Edge","IN"] },
  { value: "ur-PK-UzmaNeural", label: "Uzma", description: "Female, PK Urdu", engine: "azure-tts-v1", tags: ["Edge","PK"] },
  { value: "ur-PK-AsadNeural", label: "Asad", description: "Male, PK Urdu", engine: "azure-tts-v1", tags: ["Edge","PK"] },
  { value: "ar-SA-ZariyahNeural", label: "Zariyah", description: "Female, SA", engine: "azure-tts-v1", tags: ["Edge","SA"] },
  { value: "ar-SA-HamedNeural", label: "Hamed", description: "Male, SA", engine: "azure-tts-v1", tags: ["Edge","SA"] },
  { value: "ar-AE-FatimaNeural", label: "Fatima", description: "Female, AE", engine: "azure-tts-v1", tags: ["Edge","AE"] },
  { value: "ar-AE-HamdanNeural", label: "Hamdan", description: "Male, AE", engine: "azure-tts-v1", tags: ["Edge","AE"] },
  { value: "ar-EG-SalmaNeural", label: "Salma", description: "Female, EG", engine: "azure-tts-v1", tags: ["Edge","EG"] },
  { value: "ar-EG-ShakirNeural", label: "Shakir", description: "Male, EG", engine: "azure-tts-v1", tags: ["Edge","EG"] },
  { value: "ru-RU-SvetlanaNeural", label: "Svetlana", description: "Female, RU", engine: "azure-tts-v1", tags: ["Edge","RU"] },
  { value: "ru-RU-DmitryNeural", label: "Dmitry", description: "Male, RU", engine: "azure-tts-v1", tags: ["Edge","RU"] },
  { value: "tr-TR-EmelNeural", label: "Emel", description: "Female, TR", engine: "azure-tts-v1", tags: ["Edge","TR"] },
  { value: "tr-TR-AhmetNeural", label: "Ahmet", description: "Male, TR", engine: "azure-tts-v1", tags: ["Edge","TR"] },
  { value: "uk-UA-PolinaNeural", label: "Polina", description: "Female, UA", engine: "azure-tts-v1", tags: ["Edge","UA"] },
  { value: "uk-UA-OstapNeural", label: "Ostap", description: "Male, UA", engine: "azure-tts-v1", tags: ["Edge","UA"] },
  { value: "zu-ZA-ThandoNeural", label: "Thando", description: "Female, ZA", engine: "azure-tts-v1", tags: ["Edge","ZA"] },
];

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
  voice_name: "gemini:Zephyr",
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
