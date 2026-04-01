import { createClient } from "@/lib/supabase/server";
import { getPlatformConfig } from "@/lib/credits";
import axios from "axios";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const astriaApiKey = process.env.ASTRIA_API_KEY;
const ASTRIA_DOMAIN = "https://api.astria.ai";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

const normalizeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

type AstriaPackClass = {
  key: string;
  num_images: number;
  cost_mc: number | null;
};

async function getPackClassesForSlug(packSlug: string) {
  const headers = {
    Authorization: `Bearer ${astriaApiKey}`,
    Accept: "application/json",
    "Content-Type": "application/json",
  };

  const [userPacksRes, galleryPacksRes] = await Promise.all([
    axios.get(`${ASTRIA_DOMAIN}/packs?listed=true`, {
      headers,
      validateStatus: (status) => status < 500,
    }),
    axios.get(`${ASTRIA_DOMAIN}/gallery/packs?listed=true`, {
      headers,
      validateStatus: (status) => status < 500,
    }),
  ]);

  const combinedData = [
    ...(Array.isArray(userPacksRes.data) ? userPacksRes.data : []),
    ...(Array.isArray(galleryPacksRes.data) ? galleryPacksRes.data : []),
  ];

  const targetPack = combinedData.find(
    (item: any) =>
      String(item?.slug || "").toLowerCase() === packSlug.toLowerCase(),
  );

  if (!targetPack) return [];

  const costs = targetPack.costs || {};
  const costMcHash = targetPack.cost_mc_hash || {};
  const promptsPerClass = targetPack.prompts_per_class || {};

  const classKeys = Array.from(
    new Set([
      ...Object.keys(costs),
      ...Object.keys(costMcHash),
      ...Object.keys(promptsPerClass),
    ]),
  );

  const baseClasses: AstriaPackClass[] = classKeys
    .map((key) => {
      const normalized = normalizeKey(key);
      const mcEntry = Object.entries(costMcHash).find(
        ([rawKey]) => normalizeKey(rawKey) === normalized,
      );

      const costFromMc =
        mcEntry?.[1] === null || mcEntry?.[1] === undefined
          ? null
          : Number(mcEntry[1]);

      const costFromCostsObject =
        typeof costs[key]?.cost === "number"
          ? costs[key].cost
          : typeof costs[key]?.cost === "string"
            ? Number(costs[key].cost)
            : null;

      const normalizedCostMc =
        costFromMc !== null && Number.isFinite(costFromMc)
          ? costFromMc
          : costFromCostsObject !== null && Number.isFinite(costFromCostsObject)
            ? costFromCostsObject * 1000
            : null;

      const numImagesFromCosts = costs[key]?.num_images || 0;
      const numImagesFromPrompts = Array.isArray(promptsPerClass[key])
        ? promptsPerClass[key].length
        : 0;

      return {
        key,
        num_images: Math.max(numImagesFromCosts, numImagesFromPrompts),
        cost_mc: normalizedCostMc,
      };
    })
    .filter((cls) => cls.num_images > 0 || cls.cost_mc !== null);

  const byNormalized = new Map(
    baseClasses.map((cls) => [normalizeKey(cls.key), cls]),
  );

  const manClass = byNormalized.get("man");
  const womanClass = byNormalized.get("woman");
  const replicated = [...baseClasses];

  if (manClass && !womanClass) {
    replicated.push({ ...manClass, key: "woman" });
  }
  if (womanClass && !manClass) {
    replicated.push({ ...womanClass, key: "man" });
  }

  return replicated;
}

// Generate descriptive text from style selections for dynamic prompts
function generateStyleDescription(
  place?: string,
  style?: string,
  color?: string,
) {
  let description = "";

  if (place) {
    const placeDescriptions: Record<string, string> = {
      studio: "professional studio setting with neutral backdrop",
      office: "corporate office environment with professional decor",
      medical: "clean medical facility with professional healthcare setting",
      "home-office":
        "comfortable home office workspace with modern furnishings",
      retail: "retail business environment with professional displays",
      education: "educational setting with academic atmosphere",
      "real-estate": "modern interior with architectural elements",
      outdoors: "natural outdoor setting with soft natural lighting",
    };
    description += placeDescriptions[place] || "professional setting";
  }

  if (style) {
    const styleDescriptions: Record<string, string> = {
      casual: "smart casual attire with polo shirt or casual blazer",
      business: "professional business suit with dress shirt and tie",
      "smart-casual": "smart casual outfit with blazer and chinos",
      medical: "professional medical attire with white coat",
      formal: "elegant formal wear",
    };
    if (description) description += ", ";
    description += styleDescriptions[style] || "professional attire";
  }

  if (color) {
    const colorDescriptions: Record<string, string> = {
      "charcoal-grey": "charcoal grey color",
      "navy-blue": "navy blue color",
      black: "black color",
      brown: "brown color",
      white: "white color",
      "light-grey": "light grey color",
      burgundy: "burgundy color",
      beige: "beige color",
    };
    if (description) description += " in ";
    description += colorDescriptions[color] || "";
  }

  return description;
}

export async function POST(request: Request) {
  const payload = await request.json();
  const images = payload.urls;
  const type = payload.type;
  const pack = payload.pack;
  const name = payload.name;
  const place = payload.place;
  const style = payload.style;
  const color = payload.color;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const platformConfig = await getPlatformConfig();
  const astriaTestModeIsOn = platformConfig.astria_test_mode;

  if (!astriaApiKey) {
    return NextResponse.json(
      {
        message:
          "Missing API Key: Add your Astria API Key to generate headshots",
      },
      { status: 500 },
    );
  }

  if (images?.length < 4) {
    return NextResponse.json(
      { message: "Upload at least 4 sample images" },
      { status: 500 },
    );
  }

  // Validate style selections for raw-tune: if any are provided, all must be provided
  const isRawTuneRequest = !pack || pack === "raw-tune";
  if (isRawTuneRequest && (place || style || color)) {
    if (!place || !style || !color) {
      return NextResponse.json(
        {
          message:
            "Incomplete style selections. Please select place, clothing style, and color.",
        },
        { status: 400 },
      );
    }
  }

  let creditsBeforeDeduction: number | null = null;
  let requiredCredits = 30;

  if (stripeIsConfigured) {
    // Fetch dynamic credit cost from platform config
    try {
      const config = await getPlatformConfig();
      requiredCredits = config.ai_model_credits;

      if (!isRawTuneRequest && pack) {
        const classes = await getPackClassesForSlug(pack);
        const normalizedType = normalizeKey(String(type || ""));
        const margin = Math.min(Math.max(config.profit_margin || 0, 0), 0.99);
        const creditValue = Math.max(config.credit_value || 0.1, 0.000001);

        const calculateClassCredits = (cls?: AstriaPackClass) => {
          if (!cls?.cost_mc || !cls?.num_images) return null;
          const packPriceDollars = cls.cost_mc / 100000;
          const costPerImage = packPriceDollars / Math.max(cls.num_images, 1);
          const chargePerImage = costPerImage / (1 - margin);
          const creditsPerImage = Math.ceil(chargePerImage / creditValue);
          return creditsPerImage * cls.num_images;
        };

        const manClass = classes.find((cls) => normalizeKey(cls.key) === "man");
        const womanClass = classes.find(
          (cls) => normalizeKey(cls.key) === "woman",
        );
        const isInclusiveHumanType =
          normalizedType === "person" ||
          normalizedType === "unisex" ||
          normalizedType === "other";

        if (isInclusiveHumanType && manClass && womanClass) {
          const manCredits = calculateClassCredits(manClass);
          const womanCredits = calculateClassCredits(womanClass);
          if (manCredits && womanCredits) {
            requiredCredits = Math.round((manCredits + womanCredits) / 2);
          }
        } else {
          const classMatch =
            classes.find((cls) => normalizeKey(cls.key) === normalizedType) ||
            classes.find((cls) => normalizeKey(cls.key) === "person") ||
            classes.find((cls) => normalizeKey(cls.key) === "unisex") ||
            classes[0];

          const classCredits = calculateClassCredits(classMatch);
          if (classCredits) {
            requiredCredits = classCredits;
          }
        }
      }
    } catch {
      // Fall back to default if config fetch fails
    }

    const { error: creditError, data: credits } = await supabase
      .from("credits")
      .select("credits")
      .eq("user_id", user.id);

    if (creditError) {
      console.error({ creditError });
      return NextResponse.json(
        { message: "Something went wrong!" },
        { status: 500 },
      );
    }

    if (credits.length === 0) {
      const { error: errorCreatingCredits } = await supabase
        .from("credits")
        .insert({ user_id: user.id, credits: 0 });

      if (errorCreatingCredits) {
        console.error({ errorCreatingCredits });
        return NextResponse.json(
          { message: "Something went wrong!" },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          message:
            "Not enough credits, please purchase some credits and try again.",
        },
        { status: 402 },
      );
    } else if (credits[0]?.credits < requiredCredits) {
      return NextResponse.json(
        {
          message: `Not enough credits. This action requires ${requiredCredits} credits. Please purchase more credits and try again.`,
        },
        { status: 402 },
      );
    }

    creditsBeforeDeduction = credits[0].credits;

    // Deduct credits BEFORE calling Astria API (atomic with gte guard)
    const { error: deductError } = await supabase
      .from("credits")
      .update({ credits: creditsBeforeDeduction! - requiredCredits })
      .eq("user_id", user.id)
      .gte("credits", requiredCredits);

    if (deductError) {
      console.error({ deductError });
      return NextResponse.json(
        {
          message:
            "Not enough credits, please purchase some credits and try again.",
        },
        { status: 402 },
      );
    }
  }

  // Create a model row in supabase
  const isRawTune = !pack || pack === "raw-tune";
  const { error: modelError, data } = await supabase
    .from("models")
    .insert({
      user_id: user.id,
      name,
      type,
      ...(isRawTune ? {} : { pack }),
    })
    .select("id")
    .single();

  if (modelError) {
    console.error("modelError: ", modelError);
    // Rollback credit deduction
    if (stripeIsConfigured && creditsBeforeDeduction !== null) {
      await supabase
        .from("credits")
        .update({ credits: creditsBeforeDeduction })
        .eq("user_id", user.id);
    }
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }

  const modelId = data?.id;

  try {
    const trainWebhook = `https://${process.env.ASTRIA_WEBHOOK_URL}/api/astria/train-webhook`;
    const trainWebhookWithParams = `${trainWebhook}?user_id=${user.id}&model_id=${modelId}`;

    const promptWebhook = `https://${process.env.ASTRIA_WEBHOOK_URL}/api/astria/prompt-webhook`;
    const promptWebhookWithParams = `${promptWebhook}?user_id=${user.id}&model_id=${modelId}`;

    // Generate style description from user selections
    const styleDescription = generateStyleDescription(place, style, color);

    // Build dynamic prompts based on user style selections
    const prompt1 = styleDescription
      ? `portrait of ohwx ${type}, ${styleDescription}, professional photo, Amazing Details, Best Quality, Masterpiece, dramatic lighting highly detailed, analog photo, overglaze, 80mm Sigma f/1.4 or any ZEISS lens`
      : `portrait of ohwx ${type} wearing a business suit, professional photo, white background, Amazing Details, Best Quality, Masterpiece, dramatic lighting highly detailed, analog photo, overglaze, 80mm Sigma f/1.4 or any ZEISS lens`;

    const prompt2 = styleDescription
      ? `8k close up linkedin profile picture of ohwx ${type}, ${styleDescription}, professional headshots, photo-realistic, 4k, high-resolution image, upper body, modern outfit, professional appearance, blurred background`
      : `8k close up linkedin profile picture of ohwx ${type}, professional jack suite, professional headshots, photo-realistic, 4k, high-resolution image, workplace settings, upper body, modern outfit, professional suit, business, blurred background, glass building, office window`;

    // Create a fine tuned model using Astria tune API
    const tuneBody = {
      tune: {
        title: name,
        base_tune_id: 690204,
        name: type,
        branch: astriaTestModeIsOn ? "fast" : "sd15",
        token: "ohwx",
        image_urls: images,
        callback: trainWebhookWithParams,
        prompts_attributes: [
          {
            text: prompt1,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
          {
            text: prompt2,
            callback: promptWebhookWithParams,
            num_images: 8,
          },
        ],
      },
    };

    // Create a fine tuned model using Astria packs API
    const packBody = {
      tune: {
        title: name,
        name: type,
        ...(astriaTestModeIsOn ? { branch: "fast" } : {}),
        callback: trainWebhookWithParams,
        prompt_attributes: {
          callback: promptWebhookWithParams,
        },
        image_urls: images,
      },
    };

    const usePacksApi = !isRawTuneRequest;

    const response = await axios.post(
      ASTRIA_DOMAIN + (usePacksApi ? `/p/${pack}/tunes` : "/tunes"),
      usePacksApi ? packBody : tuneBody,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${astriaApiKey}`,
        },
      },
    );

    const { status } = response;

    if (status !== 201) {
      console.error({ status });
      // Rollback: Delete the created model
      if (modelId) {
        await supabase.from("models").delete().eq("id", modelId);
      }
      // Rollback: Refund credit
      if (stripeIsConfigured && creditsBeforeDeduction !== null) {
        await supabase
          .from("credits")
          .update({ credits: creditsBeforeDeduction })
          .eq("user_id", user.id);
      }

      if (status === 400) {
        return NextResponse.json(
          { message: "webhookUrl must be a URL address" },
          { status },
        );
      }
      if (status === 402) {
        return NextResponse.json(
          { message: "Training models is only available on paid plans." },
          { status },
        );
      }
    }

    const { error: samplesError } = await supabase.from("samples").insert(
      images.map((sample: string) => ({
        modelId: modelId,
        uri: sample,
      })),
    );

    if (samplesError) {
      console.error("samplesError: ", samplesError);
      return NextResponse.json(
        { message: "Something went wrong!" },
        { status: 500 },
      );
    }
  } catch (e: any) {
    console.error(e);
    const astriaError =
      e?.response?.data?.error ||
      e?.response?.data?.message ||
      e?.message ||
      "Unknown error";
    console.error("Astria API error details:", astriaError);

    // Rollback: Delete the created model
    if (modelId) {
      await supabase.from("models").delete().eq("id", modelId);
    }
    // Rollback: Refund credit
    if (stripeIsConfigured && creditsBeforeDeduction !== null) {
      await supabase
        .from("credits")
        .update({ credits: creditsBeforeDeduction })
        .eq("user_id", user.id);
    }
    return NextResponse.json(
      { message: "Something went wrong!" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "success" }, { status: 200 });
}
