"use client";

import Link from "next/link";
import Image from "next/image";
import { Sparkles } from "lucide-react";
import * as m from "motion/react-client";
import { useTranslations } from "next-intl";

const HeroSection = () => {
  const t = useTranslations("Hero");

  const reviews = [
    {
      name: t("review1Name"),
      image: "/headshots/human1.png",
      text: t("review1Text"),
    },
    {
      name: t("review2Name"),
      image: "/headshots/human3.png",
      text: t("review2Text"),
    },
    {
      name: t("review3Name"),
      image: "/headshots/human5.png",
      text: t("review3Text"),
    },
  ];

  return (
    <section className="pt-4 pb-16 md:pt-6 md:pb-24">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <m.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xs md:text-sm font-semibold uppercase tracking-widest text-muted-foreground"
        >
          {t("badge")}
        </m.p>

        <m.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mt-3 text-4xl font-bold tracking-tight text-foreground leading-[1.08] sm:text-5xl md:text-6xl lg:text-7xl"
        >
          {t("title")}
        </m.h1>

        <m.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          {t("subtitle")}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90 cursor-pointer"
          >
            {t("cta")}
            <Sparkles className="h-4 w-4" />
          </Link>
          <Link
            href="#how-it-works"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted cursor-pointer"
          >
            {t("learnMore")}
          </Link>
        </m.div>
      </div>

      <div className="mx-auto mt-6 max-w-5xl px-6">
        <m.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="relative"
        >
          <video
            className="w-full rounded-2xl shadow-xl"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/content/hero-1.mp4" type="video/mp4" />
          </video>

          {/* Floating review cards */}
          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="absolute -left-6 top-[8%] z-10 hidden lg:flex items-center gap-2.5 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-zinc-200"
          >
            <Image
              src={reviews[0].image}
              alt={`${reviews[0].name} review`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <p className="text-xs leading-snug text-muted-foreground max-w-42.5">
              {reviews[0].text}
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="absolute -right-6 top-[55%] z-10 hidden lg:flex items-center gap-2.5 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-zinc-200"
          >
            <Image
              src={reviews[1].image}
              alt={`${reviews[1].name} review`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <p className="text-xs leading-snug text-muted-foreground max-w-42.5">
              {reviews[1].text}
            </p>
          </m.div>

          <m.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="absolute -left-6 bottom-[8%] z-10 hidden lg:flex items-center gap-2.5 rounded-lg bg-white/95 backdrop-blur-sm px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.1)] border border-gray-100/80"
          >
            <Image
              src={reviews[2].image}
              alt={`${reviews[2].name} review`}
              width={32}
              height={32}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
            <p className="text-xs leading-snug text-muted-foreground max-w-42.5">
              {reviews[2].text}
            </p>
          </m.div>
        </m.div>
      </div>
    </section>
  );
};

export default HeroSection;
