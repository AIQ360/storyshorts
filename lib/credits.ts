import { getAdminSupabase } from "./admin";

export type BillingPackage = {
  id: string;
  name: string;
  price: number;
  credits: number;
  featured?: boolean;
  badge?: string;
};

export type PlatformConfig = {
  credit_value: number;
  profit_margin: number;
  ai_model_api_cost: number;
  ai_model_credits: number;
  magic_editor_api_cost: number;
  magic_editor_credits: number;
  video_render_credits: number;
  styles_pricing_mode: "dynamic" | "fixed";
  active_gemini_models: ("flash" | "pro")[];
  primary_gemini_model: "flash" | "pro";
  billing_packages: BillingPackage[];
  astria_test_mode: boolean;
};

/**
 * Fetch all platform config values from the database.
 * Uses service-role client (server-side only).
 */
export async function getPlatformConfig(): Promise<PlatformConfig> {
  const supabase = getAdminSupabase();
  const { data, error } = await supabase
    .from("platform_config")
    .select("key, value");

  if (error) {
    console.warn(`[Supabase] Failed to fetch platform config (using defaults): ${error.message}`);
  }

  const config: Record<string, any> = {};
  for (const row of data || []) {
    config[row.key] = row.value;
  }

  return {
    credit_value: parseFloat(config.credit_value) || 0.1,
    profit_margin: parseFloat(config.profit_margin) || 0.5,
    ai_model_api_cost: parseFloat(config.ai_model_api_cost) || 1.5,
    ai_model_credits: parseInt(config.ai_model_credits) || 30,
    magic_editor_api_cost: parseFloat(config.magic_editor_api_cost) || 0.3,
    magic_editor_credits: parseInt(config.magic_editor_credits) || 6,
    video_render_credits: parseInt(config.video_render_credits) || 10,
    styles_pricing_mode: config.styles_pricing_mode || "dynamic",
    active_gemini_models: config.active_gemini_models || ["flash"],
    primary_gemini_model: config.primary_gemini_model || "flash",
    billing_packages: config.billing_packages || [],
    astria_test_mode: config.astria_test_mode === true,
  };
}

/**
 * Calculate credits to deduct for styles gallery (dynamic pricing).
 * packPriceMilliCents: price from Astria cost_mc_hash in milli-cents
 * imageCount: number of images in the pack for that class
 */
export function calculateStylesCredits(
  packPriceMilliCents: number,
  imageCount: number,
  margin: number,
  creditValue: number,
): number {
  const packPriceDollars = packPriceMilliCents / 100000;
  const costPerImage = packPriceDollars / Math.max(imageCount, 1);
  const chargePerImage = costPerImage / (1 - margin);
  return Math.ceil(chargePerImage / creditValue);
}

/**
 * Recalculate recommended credit costs based on margin and credit value.
 */
export function recalculateCredits(
  margin: number,
  creditValue: number,
  aiModelApiCost: number,
  magicEditorApiCost: number,
): { aiModelCredits: number; magicEditorCredits: number } {
  const aiModelCharge = aiModelApiCost / (1 - margin);
  const magicEditorCharge = magicEditorApiCost / (1 - margin);
  return {
    aiModelCredits: Math.ceil(aiModelCharge / creditValue),
    magicEditorCredits: Math.ceil(magicEditorCharge / creditValue),
  };
}
