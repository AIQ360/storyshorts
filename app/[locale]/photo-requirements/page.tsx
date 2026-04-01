import React from "react";
import Image from "next/image";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FinalCTA from "@/app/components/final-cta";
import { Check, ThumbsUp, ThumbsDown, X } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Photo Requirements — Framecast AI",
  description:
    "Learn what makes a great photo for AI headshot generation. Tips for best results.",
};

const PhotoRequirements = async () => {
  const t = await getTranslations("PhotoRequirements");

  const goodPhotos = [
    t("clearFace"),
    t("samePerson"),
    t("goodQuality"),
    t("lookingIntoCamera"),
    t("faceLarger"),
    t("emotions"),
  ];

  const badPhotos = [
    t("headwear"),
    t("groupPhotos"),
    t("sunglasses"),
    t("aiGenerated"),
    t("badQuality"),
    t("funnyFaces"),
    t("faceTooCloseFar"),
    t("notLookingAtCamera"),
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="mx-auto mt-20 mb-20 max-w-3xl px-6 lg:px-8 flex-1 w-full text-left">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
          {t("title")}
        </h1>
        <p className="mt-4 leading-7 text-muted-foreground text-lg mb-4">
          {t("intro")}
        </p>
        <p className="leading-7 text-muted-foreground mb-12">
          {t("instructions")}
        </p>

        <div className="space-y-16">
          {/* Good Photos Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ThumbsUp className="h-7 w-7 text-green-600" />
              <h2 className="text-2xl font-bold text-green-600 tracking-tight">
                {t("goodPhotos")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {goodPhotos.map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-base font-semibold text-slate-700">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <Image
              src="/assets/dos.png"
              alt="Examples of good photos for AI headshots"
              width={768}
              height={400}
              className="mt-4 rounded-lg"
              loading="lazy"
            />
          </section>

          {/* Bad Photos Section */}
          <section>
            <div className="flex items-center gap-3 mb-6">
              <ThumbsDown className="h-7 w-7 text-red-600" />
              <h2 className="text-2xl font-bold text-red-600 tracking-tight">
                {t("badPhotos")}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {badPhotos.map((text, i) => (
                <div key={i} className="flex items-center gap-2">
                  <X className="h-5 w-5 text-red-500" />
                  <span className="text-base font-semibold text-slate-700">
                    {text}
                  </span>
                </div>
              ))}
            </div>

            <Image
              src="/assets/dont.png"
              alt="Examples of bad photos for AI headshots"
              width={768}
              height={400}
              className="mt-4 rounded-lg"
              loading="lazy"
            />
          </section>
        </div>
      </main>
      <FinalCTA />
      <Footer />
    </div>
  );
};

export default PhotoRequirements;
