import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import ModelsOverview from "./components/models-overview";
import StylesOverview from "./components/styles-overview";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

function OverviewLoading() {
  return (
    <div className="space-y-12">
      {/* AI Models Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-40 bg-gray-100/80 rounded-lg animate-pulse" />
            <div className="h-4 w-56 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-50 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-50 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {/* Create card skeleton */}
          <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-white p-8 min-h-45 flex flex-col items-center justify-center animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-50 mb-3" />
            <div className="h-4 w-28 bg-gray-50 rounded" />
            <div className="h-3 w-20 bg-gray-50 rounded mt-2" />
          </div>
          {/* Model card skeletons */}
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-100 p-5 min-h-45 flex flex-col animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-gray-100/80 rounded" />
                <div className="h-5 w-16 bg-gray-50 rounded-full" />
              </div>
              <div className="h-3 w-20 bg-gray-50 rounded" />
              <div className="flex-1" />
              <div className="flex justify-end mt-4">
                <div className="flex -space-x-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-8 w-8 rounded-full bg-gray-100/80 ring-2 ring-white"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Styles Gallery Section Skeleton */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-36 bg-gray-100/80 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-gray-50 rounded-lg animate-pulse" />
          </div>
          <div className="flex gap-2">
            <div className="h-8 w-24 bg-gray-50 rounded-full animate-pulse" />
            <div className="h-8 w-20 bg-gray-50 rounded-full animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <div className="rounded-2xl border-2 border-dashed border-gray-100 bg-white p-8 min-h-45 flex flex-col items-center justify-center animate-pulse">
            <div className="h-12 w-12 rounded-full bg-gray-50 mb-3" />
            <div className="h-4 w-28 bg-gray-50 rounded" />
            <div className="h-3 w-20 bg-gray-50 rounded mt-2" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white border border-gray-100 p-5 min-h-45 flex flex-col animate-pulse"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 w-24 bg-gray-100/80 rounded" />
                <div className="h-5 w-16 bg-gray-50 rounded-full" />
              </div>
              <div className="h-3 w-20 bg-gray-50 rounded" />
              <div className="flex-1" />
              <div className="flex justify-end mt-4">
                <div className="flex -space-x-2">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div
                      key={j}
                      className="h-8 w-8 rounded-full bg-gray-100/80 ring-2 ring-white"
                    />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

async function OverviewContent() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const d = await getTranslations("Dashboard");
    return <div className="text-muted-foreground">{d("userNotFound")}</div>;
  }

  const { data: allModels } = await supabase
    .from("models")
    .select("*, samples (*)")
    .eq("user_id", user.id);

  const { data: creditData } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  const credits = creditData?.credits ?? 0;
  const models = allModels ?? [];

  const aiModels = models.filter((m) => !m.pack);
  const styleModels = models.filter((m) => !!m.pack);

  return (
    <div className="space-y-12">
      <ModelsOverview serverModels={aiModels} credits={credits} />
      <StylesOverview serverModels={styleModels} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<OverviewLoading />}>
      <OverviewContent />
    </Suspense>
  );
}
