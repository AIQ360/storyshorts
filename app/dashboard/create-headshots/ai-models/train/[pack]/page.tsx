import TrainModelZone from "../../../components/train-model";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getPlatformConfig } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function Index({
  params,
}: {
  params: Promise<{ pack: string }>;
}) {
  const { pack } = await params;
  const d = await getTranslations("Dashboard");
  const config = await getPlatformConfig().catch(() => null);

  return (
    <div className="w-full max-w-2xl space-y-6">
      <div>
        <Link
          href="/dashboard/create-headshots/styles"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-black transition-colors border border-gray-200/60 rounded-full px-4 py-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {d("backToStyles")}
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-black">
          {d("generateHeadshotsTitle")}
        </h2>
        <p className="text-muted-foreground mt-1">
          {d("generateHeadshotsDesc")}
        </p>
      </div>

      <TrainModelZone
        packSlug={pack}
        mode="generate"
        testMode={config?.astria_test_mode ?? false}
      />
    </div>
  );
}
