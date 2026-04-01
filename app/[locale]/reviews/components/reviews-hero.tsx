"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import * as m from "motion/react-client";
import { useTranslations } from "next-intl";

const ReviewsHero = () => {
  const t = useTranslations("ReviewsHero");

  return (
    <section className="pt-4 pb-8 md:pt-6 md:pb-12">
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
        </m.div>
      </div>
    </section>
  );
};

export default ReviewsHero;
