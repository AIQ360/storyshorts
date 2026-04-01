import PacksGallery from "../components/packs-gallery";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function Index() {
  const d = await getTranslations("Dashboard");
  return (
    <div className="w-full space-y-6">
      <div>
        <Link
          href="/dashboard/create-headshots"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-black transition-colors border border-gray-200/60 rounded-full px-4 py-2 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          {d("back")}
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-black">
          {d("stylesGallery")}
        </h2>
        <p className="text-muted-foreground mt-1">{d("chooseType")}</p>
      </div>

      <PacksGallery />
    </div>
  );
}
