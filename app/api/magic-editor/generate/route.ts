import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getPlatformConfig } from "@/lib/credits";
import {
  generateImage,
  ImageInput,
} from "@/app/dashboard/magic-editor/lib/gemini-client";
import { uploadEditedImage } from "@/app/dashboard/magic-editor/lib/storage";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function dataUrlToBase64(dataUrl: string): string {
  const base64Prefix = "base64,";
  const index = dataUrl.indexOf(base64Prefix);
  if (index === -1) return dataUrl;
  return dataUrl.substring(index + base64Prefix.length);
}

function getMimeType(
  dataUrl: string,
): "image/png" | "image/jpeg" | "image/webp" {
  if (dataUrl.startsWith("data:image/jpeg")) return "image/jpeg";
  if (dataUrl.startsWith("data:image/webp")) return "image/webp";
  return "image/png";
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch dynamic credit cost from platform config
    let requiredCredits = 6;
    try {
      const config = await getPlatformConfig();
      requiredCredits = config.magic_editor_credits;
    } catch {
      // Fall back to default if config fetch fails
    }

    // Check credits
    const { data: creditData } = await supabase
      .from("credits")
      .select("credits")
      .eq("user_id", user.id)
      .single();

    const currentCredits = creditData?.credits ?? 0;
    if (currentCredits < requiredCredits) {
      return NextResponse.json(
        {
          error: `Not enough credits. This action requires ${requiredCredits} credits.`,
        },
        { status: 402 },
      );
    }

    const body = await req.json();
    const { prompt, imageDataUrl } = body;

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 },
      );
    }

    if (!imageDataUrl) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const images: ImageInput[] = [
      {
        base64: dataUrlToBase64(imageDataUrl),
        mimeType: getMimeType(imageDataUrl),
      },
    ];

    const result = await generateImage(prompt, images);

    // Deduct credits
    const { error: creditError } = await supabase
      .from("credits")
      .update({ credits: currentCredits - requiredCredits })
      .eq("user_id", user.id)
      .gte("credits", requiredCredits);

    if (creditError) {
      console.error("Failed to deduct credit:", creditError);
      return NextResponse.json(
        {
          error: `Not enough credits. This action requires ${requiredCredits} credits.`,
        },
        { status: 402 },
      );
    }

    // Save to storage
    const imageBase64WithPrefix = `data:image/png;base64,${result.imageBase64}`;
    let savedImage;
    try {
      savedImage = await uploadEditedImage(
        supabase,
        user.id,
        imageBase64WithPrefix,
        {
          prompt,
          mode: "prompt",
          originalImageUrl: imageDataUrl
            ? imageDataUrl.substring(0, 100) + "..."
            : undefined,
        },
      );
    } catch (storageError: any) {
      console.error("Failed to save image to storage:", storageError);
      return NextResponse.json({
        success: true,
        imageDataUrl: imageBase64WithPrefix,
        text: result.text,
        creditsRemaining: currentCredits - requiredCredits,
        storageError: storageError.message,
      });
    }

    return NextResponse.json({
      success: true,
      imageDataUrl: imageBase64WithPrefix,
      imageUrl: savedImage.image_url,
      imageId: savedImage.id,
      text: result.text,
      creditsRemaining: currentCredits - requiredCredits,
    });
  } catch (error: any) {
    console.error("Magic Editor generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate image", details: error.message },
      { status: 500 },
    );
  }
}
