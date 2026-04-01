import { Sparkles, ImageIcon, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getPlatformConfig } from "@/lib/credits";
import EntryCreditLabel from "./components/entry-credit-label";

export default async function CreateHeadshotsPage() {
  const config = await getPlatformConfig().catch(() => null);
  const aiModelCredits = config?.ai_model_credits ?? 30;
  const d = await getTranslations("Dashboard");
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-black">
          {d("createHeadshots")}
        </h2>
        <p className="text-muted-foreground mt-1">{d("chooseHow")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
        {/* Train Model */}
        <Link
          href="/dashboard/create-headshots/ai-models/train/styles"
          className="group rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 transition-all hover:shadow-lg hover:border-gray-300/60 flex flex-col"
        >
          <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            {d("trainYourModel")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {d("trainYourModelDesc")}
          </p>
          <div className="flex items-center justify-between gap-3 text-sm font-medium text-primary">
            <div className="flex items-center">
              {d("getStarted")}
              <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <EntryCreditLabel kind="train" aiModelCredits={aiModelCredits} />
          </div>
        </Link>

        {/* Styles Gallery */}
        <Link
          href="/dashboard/create-headshots/styles"
          className="group rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6 transition-all hover:shadow-lg hover:border-gray-300/60 flex flex-col"
        >
          <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
            <ImageIcon className="h-6 w-6 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-black mb-2">
            {d("stylesGallery")}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {d("stylesGalleryDesc")}
          </p>
          <div className="flex items-center justify-between gap-3 text-sm font-medium text-primary">
            <div className="flex items-center">
              {d("browseStyles")}
              <ArrowRight className="h-4 w-4 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <EntryCreditLabel kind="styles" aiModelCredits={aiModelCredits} />
          </div>
        </Link>
      </div>
    </div>
  );
}
