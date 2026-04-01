"use client";

import Link from "next/link";
import * as m from "motion/react-client";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Carousel from "@/components/ui/carousel";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import type { BillingPackage } from "@/lib/credits";

type StylePackClass = {
  num_images?: number;
  credits_per_image?: number;
};

type StylePack = {
  classes?: StylePackClass[];
};

type CardTheme = {
  checkColor: string;
  borderClass: string;
  buttonClass: string;
  badgeClass: string;
};

const CARD_THEMES: CardTheme[] = [
  {
    checkColor: "text-gray-500",
    borderClass:
      "border border-gray-200 shadow-[0_0px_75px_0px_rgba(0,0,0,0.07)]",
    buttonClass:
      "bg-white hover:bg-gray-50 text-gray-700 shadow-sm ring-1 ring-gray-200",
    badgeClass: "bg-linear-to-r from-sky-400 to-blue-500",
  },
  {
    checkColor: "text-[#2b5fff]",
    borderClass: "border-2 border-[#2b5fff]/30 shadow-lg",
    buttonClass: "bg-[#0025cc] hover:bg-[#0025cc]/90 text-white",
    badgeClass: "bg-linear-to-r from-[#0025cc] to-[#2b5fff]",
  },
  {
    checkColor: "text-sky-500",
    borderClass:
      "border-2 border-sky-200 shadow-[0_0px_75px_0px_rgba(0,0,0,0.07)]",
    buttonClass:
      "bg-white hover:bg-gray-50 text-gray-700 shadow-sm ring-1 ring-gray-200",
    badgeClass: "bg-linear-to-r from-sky-400 to-blue-500",
  },
];

const CheckIcon = ({ className }: { className: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-5 h-5 shrink-0 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    ></path>
  </svg>
);

const normalizeBadge = (value?: string) =>
  (value || "").trim().toLowerCase().replace(/\s+/g, " ");

const Pricing = ({
  packages = [],
  creditValue = 0.1,
  profitMargin = 0.5,
}: {
  packages?: BillingPackage[];
  creditValue?: number;
  profitMargin?: number;
}) => {
  const t = useTranslations("Pricing");
  const ex = useTranslations("Examples");
  const fallbackPackages: BillingPackage[] = [
    {
      id: "basic",
      name: t("basicName"),
      price: Number(String(t("basicPrice")).replace(/[^0-9.]/g, "")) || 35,
      credits: Number(t("basicCredits")) || 100,
      featured: false,
    },
    {
      id: "professional",
      name: t("proName"),
      price: Number(String(t("proPrice")).replace(/[^0-9.]/g, "")) || 45,
      credits: Number(t("proCredits")) || 260,
      badge: t("proBadge"),
      featured: true,
    },
    {
      id: "executive",
      name: t("execName"),
      price: Number(String(t("execPrice")).replace(/[^0-9.]/g, "")) || 65,
      credits: Number(t("execCredits")) || 440,
      badge: t("execBadge"),
      featured: false,
    },
  ];

  const displayPackages = (
    packages.length > 0 ? packages : fallbackPackages
  ).slice(0, 3);
  const [styleImageCreditRange, setStyleImageCreditRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchStyleRange = async () => {
      try {
        const response = await fetch("/api/astria/packs");
        if (!response.ok) return;

        const data = (await response.json()) as StylePack[];
        if (!Array.isArray(data)) return;

        const values = data
          .flatMap((pack) => pack.classes || [])
          .map((cls) => Number(cls.credits_per_image || 0))
          .filter((value) => Number.isFinite(value) && value > 0);

        if (!isMounted || values.length === 0) return;

        setStyleImageCreditRange({
          min: Math.min(...values),
          max: Math.max(...values),
        });
      } catch {
        // Keep fallback copy if style pricing data cannot be loaded.
      }
    };

    fetchStyleRange();

    return () => {
      isMounted = false;
    };
  }, []);

  const margin = Math.min(Math.max(profitMargin || 0, 0), 0.99);
  const cv = Math.max(creditValue || 0.1, 0.000001);

  const editCreditsPerActionRange = useMemo(() => {
    const minApiCost = 0.045;
    const maxApiCost = 0.24;
    const minCredits = Math.max(1, Math.ceil(minApiCost / (1 - margin) / cv));
    const maxCredits = Math.max(1, Math.ceil(maxApiCost / (1 - margin) / cv));
    return { min: minCredits, max: maxCredits };
  }, [cv, margin]);

  const aiModelCredits = useMemo(
    () => Math.max(1, Math.ceil(1.5 / (1 - margin) / cv)),
    [cv, margin],
  );

  const estimateHeadshots = (credits: number) => {
    if (!styleImageCreditRange) return null;
    return {
      min: Math.floor(credits / styleImageCreditRange.max),
      max: Math.floor(credits / styleImageCreditRange.min),
    };
  };

  const estimateEdits = (credits: number) => {
    return {
      min: Math.floor(credits / editCreditsPerActionRange.max),
      max: Math.floor(credits / editCreditsPerActionRange.min),
    };
  };

  return (
    <section id="pricing" className="py-8 md:py-16">
      <div className="flex flex-col items-center justify-center">
        {/* Headings */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center md:mb-16 px-4">
          <m.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground"
          >
            {t("tag")}
          </m.p>
          <m.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl font-bold tracking-tight md:text-[52px] md:leading-[1.1]"
          >
            {t("title")}{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0025cc] to-[#2b5fff]">
              {t("titleHighlight")}
            </span>
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg px-4"
          >
            {t("subtitle")}
          </m.p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4 max-w-5xl mx-auto px-5 w-full">
          {displayPackages.map((pkg, index) => {
            const theme = CARD_THEMES[index % CARD_THEMES.length];
            const normalizedBadge = normalizeBadge(pkg.badge);
            const isPopular =
              pkg.featured ||
              normalizedBadge === "82% choose this" ||
              normalizedBadge === "most popular";
            const badge = pkg.badge || (isPopular ? "Most Popular" : "");

            const aiModels = Math.max(
              0,
              Math.floor(pkg.credits / aiModelCredits),
            );
            const modelHeadshotsMin = aiModels * 8;
            const modelHeadshotsMax = aiModels * 16;
            const styleHeadshots = estimateHeadshots(pkg.credits);
            const edits = estimateEdits(pkg.credits);
            const turnaround =
              index < 2 ? t("oneHourTurnaround") : t("thirtyMinTurnaround");

            const subtitle = t("getHeadshotsSubtitle", {
              min: modelHeadshotsMin,
              max: modelHeadshotsMax,
            });

            return (
              <div
                key={pkg.id}
                className={`relative h-full bg-white rounded-xl ${isPopular ? CARD_THEMES[1].borderClass : theme.borderClass}`}
              >
                {badge && (
                  <div className="absolute inset-x-0 top-0 translate-y-px transform">
                    <div className="flex -translate-y-1/2 transform justify-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white ${isPopular ? CARD_THEMES[1].badgeClass : theme.badgeClass}`}
                      >
                        {badge}
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-5 pb-2 pt-5">
                  <h2 className="text-sm font-medium leading-6 tracking-[-0.2px] text-gray-600">
                    {pkg.name}
                  </h2>
                  <p className="mt-4 flex items-end gap-2 text-3xl sm:text-[40px] leading-6 tracking-[-0.2px] text-gray-800">
                    <span className="font-bold">${pkg.price.toFixed(2)}</span>
                    <span className="text-sm font-medium text-gray-600 leading-none">
                      {t("basicPer")}
                    </span>
                  </p>
                  <p className="mt-6 text-sm font-medium leading-5 tracking-[-0.3px] text-gray-600">
                    {subtitle}
                  </p>
                </div>

                <div className="space-y-4 px-5 pb-5 pt-4">
                  <h3 className="text-sm font-semibold text-gray-800 mb-3">
                    {t("everyPhotoshootIncludes")}
                  </h3>
                  <ul className="space-y-2.5 text-sm font-medium leading-4 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <div className="inline-flex items-center gap-1 group relative">
                        <span>
                          <span className="font-semibold">{pkg.credits}</span>{" "}
                          {t("creditsLabel")}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-4 h-4 text-gray-500 cursor-help shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <div className="absolute text-xs bottom-full left-0 mb-3 w-48 sm:w-64 px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-normal z-50">
                          {t("creditsTooltip")}
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <span>
                        <span className="font-semibold">{aiModels}</span>{" "}
                        {t("aiModelsFeature")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      {styleHeadshots ? (
                        <span>
                          <span className="font-semibold">
                            {styleHeadshots.min}-{styleHeadshots.max}
                          </span>{" "}
                          {t("estimatedStyleHeadshots")}
                        </span>
                      ) : (
                        <span>{t("estimatedStyleHeadshots")}</span>
                      )}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <span>
                        <span className="font-semibold">
                          {edits.min}-{edits.max}
                        </span>{" "}
                        {t("estimatedAiEdits")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <span>{t("customizedBackgrounds")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <span>{t("customizedOutfits")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={theme.checkColor} />
                      <span>{turnaround}</span>
                    </li>
                  </ul>

                  <div className="mt-auto pt-1">
                    <Link
                      className={`flex h-10 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 min-h-11 text-center gap-2 ${isPopular ? CARD_THEMES[1].buttonClass : theme.buttonClass}`}
                      href="/login"
                    >
                      {t("getYourHeadshots")}
                      {isPopular && <Sparkles className="h-4 w-4" />}
                    </Link>
                    <div
                      className={`flex items-center justify-center mt-2 text-xs ${
                        isPopular
                          ? "font-semibold text-green-600"
                          : "font-medium text-gray-500"
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-4 h-4 mr-1.5 ${
                          isPopular ? "text-green-600" : "text-gray-500"
                        }`}
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.403 12.652a3 3 0 0 0 0-5.304 3 3 0 0 0-3.75-3.751 3 3 0 0 0-5.305 0 3 3 0 0 0-3.751 3.75 3 3 0 0 0 0 5.305 3 3 0 0 0 3.75 3.751 3 3 0 0 0 5.305 0 3 3 0 0 0 3.751-3.75Zm-2.546-4.46a.75.75 0 0 0-1.214-.883l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                      {isPopular
                        ? t("moneyBackGuarantee")
                        : t("moneyBackGuarantee")}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            <Image
              alt="Visa"
              src="/assets/trust-badges/visa.svg"
              width={40}
              height={28}
              className="h-7 w-auto border border-gray-200 rounded-md"
            />
            <Image
              alt="Mastercard"
              src="/assets/trust-badges/mastercard.svg"
              width={40}
              height={28}
              className="h-7 w-auto border border-gray-200 rounded-md"
            />
            <Image
              alt="American Express"
              src="/assets/trust-badges/american-express.svg"
              width={40}
              height={24}
              className="h-6 w-auto"
            />
            <Image
              alt="PayPal"
              src="/assets/trust-badges/paypal_lg.svg"
              width={60}
              height={24}
              className="h-6 w-auto"
            />
            <Image
              alt="Apple Pay"
              src="/assets/trust-badges/apple_pay.svg"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <Image
              alt="Klarna"
              src="/assets/trust-badges/klarna.svg"
              width={60}
              height={24}
              className="h-6 w-auto"
            />
            <Image
              alt="Google Pay"
              src="/assets/trust-badges/google-pay.svg"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
          </div>
        </div>

        {/* Divider */}
        <div className="w-full max-w-3xl mx-auto px-4">
          <div className="border-t border-gray-200 my-8"></div>
        </div>

        {/* Social Proof */}
        <Carousel
          hideAvatars
          text={
            <p className="text-sm text-muted-foreground">
              {ex.rich("carouselSocialProof", {
                headshots: ex("statsHeadshots"),
                customers: ex("statsCustomers"),
                bold: (chunks) => <span className="font-bold">{chunks}</span>,
              })}
            </p>
          }
        />
      </div>
    </section>
  );
};

export default Pricing;
