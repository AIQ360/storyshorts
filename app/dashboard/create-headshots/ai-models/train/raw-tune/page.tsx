import TrainModelZone from "../../../components/train-model";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPlatformConfig } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function RawTunePage({
  searchParams,
}: {
  searchParams: Promise<{ place?: string; style?: string; color?: string }>;
}) {
  const { place, style, color } = await searchParams;

  if (!place || !style || !color) {
    redirect("/dashboard/create-headshots/ai-models/train/styles");
  }

  const config = await getPlatformConfig().catch(() => null);
  const d = await getTranslations("Dashboard");

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/create-headshots/ai-models/train/styles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-black transition-colors border border-gray-200/60 rounded-full px-4 py-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {d("backToStyleSelection")}
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-black">
          {d("trainModelTitle")}
        </h2>
        <p className="text-muted-foreground mt-1">{d("trainModelDesc")}</p>
      </div>

      <TrainModelZone
        packSlug="raw-tune"
        place={place}
        style={style}
        color={color}
        mode="train"
        trainCredits={config?.ai_model_credits ?? 30}
        testMode={config?.astria_test_mode ?? false}
      />
    </div>
  );
}
