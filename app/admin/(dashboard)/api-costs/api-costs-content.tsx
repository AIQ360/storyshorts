"use client";

import { useEffect, useState } from "react";
import {
  DollarSign,
  Percent,
  Zap,
  Wand2,
  ImageIcon,
  Save,
  Loader2,
  Cpu,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContents,
  TabsContent,
} from "@/components/animate-ui/components/animate/tabs";

type PlatformConfig = {
  credit_value: number;
  profit_margin: number;
  ai_model_api_cost: number;
  ai_model_credits: number;
  magic_editor_api_cost: number;
  magic_editor_credits: number;
  styles_pricing_mode: string;
  active_gemini_models: string[];
  primary_gemini_model: string;
};

export default function ApiCostsContent({
  config,
  isTestAdmin = false,
}: {
  config: PlatformConfig;
  isTestAdmin?: boolean;
}) {
  const FIXED_AI_MODEL_COST = 1.5;
  const FIXED_MAGIC_EDITOR_COST = 0.3;

  const [creditValue, setCreditValue] = useState(
    config.credit_value.toString(),
  );
  const [profitMargin, setProfitMargin] = useState(
    (config.profit_margin * 100).toString(),
  );
  const [activeModels, setActiveModels] = useState<string[]>(
    config.active_gemini_models,
  );
  const [primaryModel, setPrimaryModel] = useState(config.primary_gemini_model);
  const [isSaving, setIsSaving] = useState(false);

  const [packs, setPacks] = useState<any[]>([]);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [packsError, setPacksError] = useState<string | null>(null);

  const margin = Math.min(
    Math.max(parseFloat(profitMargin) / 100 || 0, 0),
    0.99,
  );
  const cv = parseFloat(creditValue) || 0.1;
  const aiCost = FIXED_AI_MODEL_COST;
  const meCost = FIXED_MAGIC_EDITOR_COST;

  const aiModelCredits = cv > 0 ? Math.ceil(aiCost / (1 - margin) / cv) : 0;
  const magicEditorCredits = cv > 0 ? Math.ceil(meCost / (1 - margin) / cv) : 0;

  const aiModelRevenue = aiModelCredits * cv;
  const magicEditorRevenue = magicEditorCredits * cv;
  const aiModelProfit = aiModelRevenue - aiCost;
  const magicEditorProfit = magicEditorRevenue - meCost;

  const handleSave = async () => {
    const m = parseFloat(profitMargin) / 100;
    if (m < 0 || m >= 1) {
      toast.error("Profit margin must be between 0% and 99%");
      return;
    }
    if (cv <= 0) {
      toast.error("Credit value must be greater than $0");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: {
            credit_value: creditValue,
            profit_margin: m.toString(),
            ai_model_credits: aiModelCredits.toString(),
            magic_editor_credits: magicEditorCredits.toString(),
            active_gemini_models: activeModels,
            primary_gemini_model: primaryModel,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      toast.success("Settings saved successfully");
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModel = (model: string) => {
    setActiveModels((prev) => {
      if (prev.includes(model)) {
        if (prev.length <= 1) return prev;
        const next = prev.filter((m) => m !== model);
        if (primaryModel === model) setPrimaryModel(next[0]);
        return next;
      }
      return [...prev, model];
    });
  };

  useEffect(() => {
    const fetchPacks = async () => {
      setIsLoadingPacks(true);
      setPacksError(null);
      try {
        const res = await fetch("/api/astria/packs");
        if (!res.ok) throw new Error();
        const data = await res.json();
        setPacks(data || []);
      } catch {
        setPacksError("Failed to load packs");
      } finally {
        setIsLoadingPacks(false);
      }
    };

    fetchPacks();
  }, []);

  const calculateCreditsPerImage = (
    packPriceMilliCents: number,
    imageCount: number,
  ) => {
    if (!packPriceMilliCents || imageCount <= 0) return 0;
    const packPriceDollars = packPriceMilliCents / 100000;
    const costPerImage = packPriceDollars / imageCount;
    const chargePerImage = costPerImage / (1 - margin);
    return cv > 0 ? Math.ceil(chargePerImage / cv) : 0;
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-black">API & Pricing</h2>
        <p className="text-muted-foreground mt-1">
          Configure API costs, profit margins, and credit calculations
        </p>
      </div>

      <Tabs defaultValue="core">
        <TabsList className="w-fit">
          <TabsTrigger value="core">Core Pricing</TabsTrigger>
          <TabsTrigger value="styles">Styles Packs</TabsTrigger>
        </TabsList>

        <TabsContents className="mt-6">
          <TabsContent value="core" className="space-y-8">
            {/* Core Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <DollarSign className="h-4.5 w-4.5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      Credit Value
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Dollar value per credit
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    value={creditValue}
                    onChange={(e) => setCreditValue(e.target.value)}
                    className="pl-7 h-11 rounded-xl border-gray-200/60"
                    type="number"
                    step="0.01"
                    min="0.01"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center">
                    <Percent className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      Profit Margin
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Markup on API costs (0–99%)
                    </p>
                  </div>
                </div>
                <div className="relative">
                  <Input
                    value={profitMargin}
                    onChange={(e) => setProfitMargin(e.target.value)}
                    className="pr-8 h-11 rounded-xl border-gray-200/60"
                    type="number"
                    step="1"
                    min="0"
                    max="99"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Feature Costs */}
            <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-black">
                  Feature Costs
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Credits are auto-calculated from API costs and profit margin
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {/* AI Model Training */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-violet-50 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-violet-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        AI Model Training
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Astria API
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        API Cost
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          value={FIXED_AI_MODEL_COST.toFixed(2)}
                          className="pl-7 h-9 rounded-lg text-sm border-gray-200/60 bg-gray-50"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Credits Charged
                      </label>
                      <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm font-semibold text-black">
                        {aiModelCredits}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Revenue / Use
                      </label>
                      <div className="h-9 rounded-lg bg-emerald-50/50 border border-emerald-200/40 flex items-center px-3 text-sm font-medium text-emerald-700">
                        ${aiModelRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Profit / Use
                      </label>
                      <div
                        className={`h-9 rounded-lg flex items-center px-3 text-sm font-medium border ${aiModelProfit >= 0 ? "bg-emerald-50/50 border-emerald-200/40 text-emerald-700" : "bg-red-50/50 border-red-200/40 text-red-700"}`}
                      >
                        ${aiModelProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Magic Editor */}
                <div className="px-6 py-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded-lg bg-pink-50 flex items-center justify-center">
                      <Wand2 className="h-4 w-4 text-pink-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-black">
                        Magic Editor
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Gemini API
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        API Cost (max)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                          $
                        </span>
                        <Input
                          value={FIXED_MAGIC_EDITOR_COST.toFixed(2)}
                          className="pl-7 h-9 rounded-lg text-sm border-gray-200/60 bg-gray-50"
                          type="number"
                          step="0.01"
                          min="0"
                          disabled
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Credits Charged
                      </label>
                      <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm font-semibold text-black">
                        {magicEditorCredits}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Revenue / Use
                      </label>
                      <div className="h-9 rounded-lg bg-emerald-50/50 border border-emerald-200/40 flex items-center px-3 text-sm font-medium text-emerald-700">
                        ${magicEditorRevenue.toFixed(2)}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Profit / Use
                      </label>
                      <div
                        className={`h-9 rounded-lg flex items-center px-3 text-sm font-medium border ${magicEditorProfit >= 0 ? "bg-emerald-50/50 border-emerald-200/40 text-emerald-700" : "bg-red-50/50 border-red-200/40 text-red-700"}`}
                      >
                        ${magicEditorProfit.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gemini Models */}
            <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                  <Cpu className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-black">
                    Gemini Models
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select which models to use for Magic Editor
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    id: "flash",
                    name: "Gemini 3.1 Flash",
                    desc: "Fast & efficient — $0.045–$0.151/image",
                  },
                  {
                    id: "pro",
                    name: "Gemini 3 Pro",
                    desc: "Higher quality — $0.134–$0.24/image",
                  },
                ].map((model) => {
                  const isActive = activeModels.includes(model.id);
                  const isPrimary = primaryModel === model.id;
                  return (
                    <div
                      key={model.id}
                      className={`rounded-xl border p-4 transition-all cursor-pointer ${
                        isActive
                          ? "border-primary/30 bg-primary/5"
                          : "border-gray-200/60 bg-gray-50/30 opacity-60"
                      }`}
                      onClick={() => toggleModel(model.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className={`h-3 w-3 rounded-full border-2 ${isActive ? "border-primary bg-primary" : "border-gray-300"}`}
                          />
                          <span className="text-sm font-medium text-black">
                            {model.name}
                          </span>
                        </div>
                        {isPrimary && (
                          <span className="text-[10px] font-medium text-primary bg-primary/10 rounded-full px-2 py-0.5">
                            Primary
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {model.desc}
                      </p>
                      {isActive && !isPrimary && (
                        <button
                          type="button"
                          className="mt-2 text-xs text-primary font-medium hover:underline cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPrimaryModel(model.id);
                          }}
                        >
                          Set as primary
                        </button>
                      )}
                      {isActive && isPrimary && activeModels.length > 1 && (
                        <p className="mt-2 text-[10px] text-muted-foreground">
                          Other model used as fallback
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end">
              <Button
                onClick={handleSave}
                disabled={isSaving || isTestAdmin}
                className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white px-6"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="styles" className="space-y-6">
            <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 flex items-center justify-center">
                    <ImageIcon className="h-4.5 w-4.5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-black">
                      Styles Packs Pricing
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Astria packs with margin-applied credits
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-5">
                {/* Credits are calculated per image using the margin:
                ceil((pack_price / images / (1 - margin)) / credit_value) */}
                {isLoadingPacks ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading packs...
                  </div>
                ) : packsError ? (
                  <div className="py-12 text-center text-sm text-red-500">
                    {packsError}
                  </div>
                ) : packs.length === 0 ? (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    No packs found.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {packs.map((pack) => {
                      const packImages = [
                        pack.cover_url,
                        ...(pack.preview_images || []),
                      ]
                        .filter(Boolean)
                        .slice(0, 4);

                      return (
                        <div
                          key={pack.id}
                          className="rounded-2xl border border-gray-200/60 bg-gray-50/40 p-5 min-h-90"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-black">
                                {pack.title}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {pack.total_images} images total
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                API cost: $
                                {((pack.total_cost_mc || 0) / 100000).toFixed(
                                  2,
                                )}
                              </p>
                            </div>
                            <div className="w-24 sm:w-36 shrink-0">
                              {packImages[0] ? (
                                // Using img avoids Next/Image remote config changes for Astria CDN variations.
                                <img
                                  src={packImages[0]}
                                  alt={`${pack.title} preview`}
                                  className="aspect-3/4 w-full rounded-xl object-cover border border-gray-200/60 bg-white"
                                />
                              ) : (
                                <div className="aspect-3/4 w-full rounded-xl border border-gray-200/60 bg-white" />
                              )}

                              {packImages.length > 1 && (
                                <div className="mt-2 grid grid-cols-3 gap-1.5">
                                  {packImages
                                    .slice(1)
                                    .map((src: string, idx: number) => (
                                      <img
                                        key={`${pack.id}-thumb-${idx}`}
                                        src={src}
                                        alt={`${pack.title} preview ${idx + 2}`}
                                        className="h-10 w-full rounded-md object-cover border border-gray-200/60 bg-white"
                                      />
                                    ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="mt-4 grid grid-cols-1 gap-3">
                            {(pack.classes || []).map((cls: any) => {
                              const creditsPerImage = calculateCreditsPerImage(
                                cls.cost_mc || 0,
                                cls.num_images || 0,
                              );
                              const totalCredits =
                                creditsPerImage * (cls.num_images || 0);
                              const classCostDollars =
                                (cls.cost_mc || 0) / 100000;
                              return (
                                <div
                                  key={cls.key}
                                  className="rounded-lg bg-white border border-gray-200/60 p-3"
                                >
                                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span className="font-medium text-black">
                                      {cls.key}
                                    </span>
                                    <span>{cls.num_images || 0} images</span>
                                  </div>
                                  <div className="mt-2 text-xs text-muted-foreground">
                                    <span className="font-semibold text-black">
                                      ${classCostDollars.toFixed(2)}
                                    </span>{" "}
                                    API cost ·{" "}
                                    <span className="font-semibold text-black">
                                      {creditsPerImage}
                                    </span>{" "}
                                    credits / image ·{" "}
                                    <span className="font-semibold text-black">
                                      {totalCredits}
                                    </span>{" "}
                                    credits / pack
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </TabsContents>
      </Tabs>
    </div>
  );
}
