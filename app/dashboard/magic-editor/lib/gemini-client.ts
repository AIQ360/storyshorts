import { GoogleGenAI } from "@google/genai";

const getClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export type ModelType = "flash" | "pro";

export interface ImageInput {
  base64: string;
  mimeType?: "image/png" | "image/jpeg" | "image/webp";
}

export interface GenerationConfig {
  model?: ModelType;
  responseModalities?: ("TEXT" | "IMAGE")[];
}

/**
 * Generate or edit an image using Gemini.
 * Prompt-only mode: send a text prompt + optional source image.
 */
export async function generateImage(
  prompt: string,
  images?: ImageInput[],
  config: GenerationConfig = {},
): Promise<{ imageBase64: string; text?: string }> {
  const ai = getClient();

  const { model = "flash", responseModalities = ["TEXT", "IMAGE"] } = config;

  const modelName =
    model === "pro"
      ? "gemini-3-pro-image-preview"
      : "gemini-3.1-flash-image-preview";

  const contents: any[] = [{ text: prompt }];

  if (images && images.length > 0) {
    for (const img of images) {
      contents.push({
        inlineData: {
          mimeType: img.mimeType || "image/png",
          data: img.base64,
        },
      });
    }
  }

  const response = await ai.models.generateContent({
    model: modelName,
    contents,
    config: { responseModalities },
  });

  let imageBase64 = "";
  let text = "";

  if (response.candidates && response.candidates[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if ((part as any).thought) continue;
      if ((part as any).text) {
        text += (part as any).text;
      } else if ((part as any).inlineData) {
        imageBase64 = (part as any).inlineData.data;
      }
    }
  }

  if (!imageBase64) {
    throw new Error("No image generated in response");
  }

  return { imageBase64, text: text || undefined };
}
