import { NextResponse } from "next/server";
import axios from "axios";
import { createClient } from "@/lib/supabase/server";
import { getPlatformConfig } from "@/lib/credits";

// Set dynamic route handling
export const dynamic = "force-dynamic";

// Environment Variables
const API_KEY = process.env.ASTRIA_API_KEY;
const DOMAIN = "https://api.astria.ai";

// Check if API Key is missing
if (!API_KEY) {
  throw new Error("MISSING API_KEY!");
}

export async function GET(request: Request) {
  try {
    if (!API_KEY) {
      return NextResponse.json(
        { message: "API key not configured" },
        { status: 500 },
      );
    }

    // User auth is optional: authenticated users get both personal + gallery packs;
    // public users get gallery packs only.
    const supabase = await createClient();
    const {
      data: { user },
      error: _authError,
    } = await supabase.auth.getUser();

    let margin = 0.5;
    let creditValue = 0.1;
    try {
      const config = await getPlatformConfig();
      margin = Math.min(Math.max(config.profit_margin || 0, 0), 0.99);
      creditValue = Math.max(config.credit_value || 0.1, 0.000001);
    } catch {
      // Use safe defaults if config fetch fails.
    }

    const headers = {
      Authorization: `Bearer ${API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    // Fetch listed gallery packs for everyone; include user packs only for signed-in users.
    const [userPacksRes, galleryPacksRes] = await Promise.all([
      user
        ? axios.get(`${DOMAIN}/packs?listed=true`, {
            headers,
            validateStatus: (status) => status < 500,
          })
        : Promise.resolve({ data: [] as any[] }),
      axios.get(`${DOMAIN}/gallery/packs?listed=true`, {
        headers,
        validateStatus: (status) => status < 500,
      }),
    ]);

    const combinedData = [
      ...(Array.isArray(userPacksRes.data) ? userPacksRes.data : []),
      ...(Array.isArray(galleryPacksRes.data) ? galleryPacksRes.data : []),
    ];

    // Deduplicate packs by ID
    const seenIds = new Set<number>();
    const rawData: any[] = combinedData.filter((pack: any) => {
      if (seenIds.has(pack.id)) return false;
      seenIds.add(pack.id);
      return true;
    });

    const normalizeKey = (value: string) =>
      value.toLowerCase().replace(/[^a-z0-9]/g, "");

    const withManWomanReplication = (
      classes: Array<{
        key: string;
        num_images: number;
        cost_mc: number | null;
        cost_cents: number | null;
        credits_per_image?: number;
        credits_per_pack?: number;
      }>,
    ) => {
      const byNormalizedKey = new Map(
        classes.map((cls) => [normalizeKey(cls.key), cls]),
      );

      const manClass = byNormalizedKey.get("man");
      const womanClass = byNormalizedKey.get("woman");

      const replicated = [...classes];

      if (manClass && !womanClass) {
        replicated.push({ ...manClass, key: "woman" });
      }

      if (womanClass && !manClass) {
        replicated.push({ ...womanClass, key: "man" });
      }

      return replicated;
    };

    // Enrich packs with headshot count + pricing data
    const enrichedPacks = rawData
      .map((pack: any) => {
        const costs = pack.costs || {};
        const costMcHash = pack.cost_mc_hash || {};
        const promptsPerClass = pack.prompts_per_class || {};

        const classKeys = Array.from(
          new Set([
            ...Object.keys(costs),
            ...Object.keys(costMcHash),
            ...Object.keys(promptsPerClass),
          ]),
        );

        const baseClasses = classKeys
          .map((key) => {
            const normalizedKey = normalizeKey(key);
            const costEntry = Object.entries(costMcHash).find(
              ([rawKey]) => normalizeKey(rawKey) === normalizedKey,
            );

            const rawCost = costEntry?.[1];
            const parsedCost =
              rawCost === null || rawCost === undefined
                ? null
                : Number(rawCost);

            const costFromCostsObject =
              typeof costs[key]?.cost === "number"
                ? costs[key].cost
                : typeof costs[key]?.cost === "string"
                  ? Number(costs[key].cost)
                  : null;

            // Astria gallery often returns `costs.{class}.cost` (cents) rather than `cost_mc_hash`.
            // Normalize everything to milli-cents so frontend math stays consistent.
            const normalizedCostMc =
              parsedCost !== null && Number.isFinite(parsedCost)
                ? parsedCost
                : costFromCostsObject !== null &&
                    Number.isFinite(costFromCostsObject)
                  ? costFromCostsObject * 1000
                  : null;

            const numImagesFromCosts = costs[key]?.num_images || 0;
            const numImagesFromPrompts = Array.isArray(promptsPerClass[key])
              ? promptsPerClass[key].length
              : 0;

            const num_images = Math.max(
              numImagesFromCosts,
              numImagesFromPrompts,
            );

            return {
              key,
              num_images,
              cost_mc:
                normalizedCostMc !== null && Number.isFinite(normalizedCostMc)
                  ? normalizedCostMc
                  : null,
              cost_cents:
                costFromCostsObject !== null &&
                Number.isFinite(costFromCostsObject)
                  ? costFromCostsObject
                  : null,
            };
          })
          .filter((cls) => cls.num_images > 0 || cls.cost_mc !== null);

        const classes = withManWomanReplication(baseClasses);

        const classesWithCredits = classes.map((cls) => {
          if (!cls.cost_mc || !cls.num_images) {
            return {
              ...cls,
              credits_per_image: 0,
              credits_per_pack: 0,
            };
          }

          const packPriceDollars = cls.cost_mc / 100000;
          const costPerImage = packPriceDollars / Math.max(cls.num_images, 1);
          const chargePerImage = costPerImage / (1 - margin);
          const creditsPerImage = Math.ceil(chargePerImage / creditValue);

          return {
            ...cls,
            credits_per_image: creditsPerImage,
            credits_per_pack: creditsPerImage * cls.num_images,
          };
        });

        const classImageCounts = baseClasses
          .map((cls) => cls.num_images || 0)
          .filter((n) => n > 0);

        const totalImages = classImageCounts.reduce(
          (sum: number, n: number) => sum + n,
          0,
        );

        const totalCostMc = baseClasses.reduce(
          (sum: number, cls: any) => sum + (cls.cost_mc || 0),
          0,
        );

        const classPackCredits = classesWithCredits
          .map((cls) => cls.credits_per_pack || 0)
          .filter((value) => value > 0);

        const minCreditsPerPack =
          classPackCredits.length > 0 ? Math.min(...classPackCredits) : 0;
        const maxCreditsPerPack =
          classPackCredits.length > 0 ? Math.max(...classPackCredits) : 0;

        // Collect preview images from prompts_per_class (up to 6)
        const previewImages: string[] = [];
        for (const cls of Object.values(promptsPerClass)) {
          for (const prompt of cls as any[]) {
            if (prompt.images?.[0] && previewImages.length < 6) {
              previewImages.push(prompt.images[0]);
            }
          }
        }

        return {
          id: pack.id,
          title: pack.title,
          slug: pack.slug,
          cover_url: pack.cover_url,
          total_images: totalImages,
          total_cost_mc: totalCostMc,
          preview_images: previewImages,
          credits_per_pack_min: minCreditsPerPack,
          credits_per_pack_max: maxCreditsPerPack,
          classes: classesWithCredits,
        };
      })
      .filter(
        (pack: any) =>
          (pack.cover_url &&
            pack.cover_url.startsWith("http") &&
            !pack.cover_url.includes("placeholder")) ||
          pack.preview_images.length > 0,
      );

    // Sort: highest image count first
    enrichedPacks.sort((a: any, b: any) => b.total_images - a.total_images);

    return NextResponse.json(enrichedPacks);
  } catch (error) {
    console.error("Error fetching packs:", error);

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return NextResponse.json(
          { message: "Invalid API key or unauthorized access to Astria API" },
          { status: 401 },
        );
      }
    }

    return NextResponse.json(
      { message: "Failed to fetch packs" },
      { status: 500 },
    );
  }
}
