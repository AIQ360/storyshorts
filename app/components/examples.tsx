"use client";

import Image from "next/image";
import Link from "next/link";
import * as m from "motion/react-client";
import {
  User,
  CheckCircle,
  Sparkles,
  SmilePlus,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

const featureIcons = [User, CheckCircle, Sparkles, SmilePlus, ShieldCheck];

const topRow = [
  {
    image: "/assets/examples/jg-1.avif",
  },
  {
    image: "/assets/examples/jg-2.avif",
  },
  {
    image: "/assets/examples/jg-3.avif",
  },
  {
    image: "/assets/examples/jg-4.avif",
  },
];

const showcaseGridImages = [
  "/assets/examples/ex-1.jpg",
  "/assets/examples/ex-2.jpg",
  "/assets/examples/ex-3.jpg",
  "/assets/examples/ex-4.jpg",
  "/assets/examples/ex-5.jpg",
  "/assets/examples/ex-6.jpg",
  "/assets/examples/ex-7.jpg",
  "/assets/examples/ex-8.jpg",
  "/assets/examples/ex-9.jpg",
  "/assets/examples/ex-10.jpg",
  "/assets/examples/ex-11.jpg",
  "/assets/examples/ex-12.jpg",
];

const reviewAvatars = [
  "/headshots/human6.png",
  "/headshots/human7.png",
  null,
  null,
  null,
  "/headshots/human8.png",
  null,
  null,
];

export type ReviewData = {
  nameKey: string;
  avatar: string | null;
  stars: number;
  textKey: string;
  dateKey: string;
};

export const reviews: ReviewData[] = reviewAvatars.map((avatar, i) => ({
  nameKey: `review${i + 1}Name`,
  avatar,
  stars: i === 7 ? 4 : 5,
  textKey: `review${i + 1}Text`,
  dateKey: `review${i + 1}Date`,
}));

const ImageCard = ({
  image,
  quote,
  aiGenLabel,
}: {
  image: string;
  quote?: string;
  aiGenLabel: string;
}) => (
  <div className="group relative cursor-pointer overflow-hidden rounded-2xl">
    <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-medium uppercase text-white opacity-70 backdrop-blur-md">
      {aiGenLabel}
    </div>
    <Image
      src={image}
      alt="AI Generated Headshot"
      width={300}
      height={375}
      className="aspect-4/5 w-full object-cover object-top transition duration-200 group-hover:scale-[1.02]"
    />
    {quote && (
      <div className="absolute bottom-0 left-0 flex h-2/5 w-full flex-col justify-end bg-linear-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-6">
        <p
          className="text-[11px] font-medium italic leading-snug text-white drop-shadow-md md:text-xs md:leading-4"
          style={{
            textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)",
          }}
        >
          &ldquo;{quote}&rdquo;
        </p>
      </div>
    )}
  </div>
);

const LandscapeCard = ({
  image,
  quote,
  aiGenLabel,
}: {
  image: string;
  quote: string;
  aiGenLabel: string;
}) => (
  <div className="group relative cursor-pointer overflow-hidden rounded-2xl">
    <div className="absolute left-2.5 top-2.5 z-10 rounded-full bg-black/70 px-1.5 py-0.5 text-[9px] font-medium uppercase text-white opacity-70 backdrop-blur-md">
      {aiGenLabel}
    </div>
    <Image
      src={image}
      alt="AI Generated Headshot"
      width={305}
      height={275}
      className="aspect-305/275 w-full object-cover object-top transition duration-200 group-hover:scale-[1.02]"
    />
    <div className="absolute bottom-0 left-0 flex h-2/5 w-full flex-col justify-end bg-linear-to-t from-black/90 via-black/60 to-transparent px-3 pb-3 pt-6">
      <p
        className="text-[11px] font-medium italic leading-snug text-white drop-shadow-md md:text-xs md:leading-4"
        style={{
          textShadow: "0 1px 3px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7)",
        }}
      >
        &ldquo;{quote}&rdquo;
      </p>
    </div>
  </div>
);

export const StarRating = ({ count }: { count: number }) => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`h-3.5 w-3.5 ${i < count ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`}
      />
    ))}
  </div>
);

export const ReviewCard = ({ review }: { review: ReviewData }) => {
  const t = useTranslations("Examples");
  const name = t(review.nameKey);
  return (
    <div className="group flex flex-col rounded-2xl border border-gray-200/60 bg-white/60 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-gray-30060/50 hover:bg-white/80lue-100 hover:shadow-[0_16px_40px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center">
        {review.avatar ? (
          <Image
            src={review.avatar}
            alt={name}
            width={36}
            height={36}
            className="mr-3 h-9 w-9 rounded-full object-cover shadow-xs"
          />
        ) : (
          <div className="mr-3 flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 shadow-xs">
            <span className="text-sm font-bold text-primary">{name[0]}</span>
          </div>
        )}
        <div className="flex-1">
          <p className="text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted-foreground/60">
            {t("framecastCustomer")}
          </p>
        </div>
      </div>
      <StarRating count={review.stars} />
      <p className="mt-2 grow text-sm leading-relaxed text-gray-600">
        {t(review.textKey)}
      </p>
      <p className="mt-4 text-xs text-muted-foreground/50">
        <strong>{t("dateOfExperience")}</strong> {t(review.dateKey)}
      </p>
    </div>
  );
};

const Examples = () => {
  const t = useTranslations("Examples");

  const features = featureIcons.map((icon, i) => ({
    icon,
    label: t(`pill${i + 1}`),
  }));

  const showcaseGrid = showcaseGridImages.map((image, i) => ({
    image,
    quote: t(`showcaseQuote${i + 1}`),
  }));

  return (
    <section className="py-10 md:pt-16 md:pb-2" id="examples">
      <div className="mx-auto max-w-7xl px-5">
        {/* Header */}
        <div className="mx-auto mb-10 flex max-w-2xl flex-col items-center text-center md:mb-16">
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
            <span className="bg-linear-to-r from-[#0025cc] to-[#2b5fff] bg-clip-text text-transparent">
              {t("statsHeadshots")}
            </span>{" "}
            {t("statsCreated")}{" "}
            <span className="bg-linear-to-r from-[#0025cc] to-[#2b5fff] bg-clip-text text-transparent">
              {t("statsCustomers")}
            </span>{" "}
            {t("statsHappy")}
          </m.h2>
          <m.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {t("statsSubtitle")}
          </m.p>
        </div>

        {/* Input images + features row */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8 flex flex-col items-center gap-6 md:flex-row"
        >
          {/* Input images strip */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-base font-bold">{t("personName")}</span>
              <span className="ml-1 text-muted-foreground">
                {t("personRole")}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Image
                src="/assets/examples/input_images.avif"
                alt="Input selfie images example"
                width={350}
                height={100}
                className="h-16 w-auto max-w-[calc(100%-40px)] object-contain"
              />
              <svg
                className="h-6 w-6 shrink-0 text-gray-400 sm:h-8 sm:w-8"
                viewBox="0 0 50 50"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.603,29L30,48l14.396-19H35C35,0,6,1,6,1s19,1.373,19,28H15.603z"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeMiterlimit={10}
                  strokeWidth={2}
                />
              </svg>
            </div>
          </div>

          {/* Feature pills */}
          <div className="flex flex-1 flex-wrap items-center justify-center gap-2 md:justify-start md:gap-3">
            {features.map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 rounded-full border border-primary/15 bg-linear-to-r from-primary/5 to-primary/10 px-3 py-1.5"
              >
                <f.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-gray-700">
                  {f.label}
                </span>
              </div>
            ))}
          </div>
        </m.div>

        {/* Top row — 4 portrait images */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 gap-2 md:grid-cols-4 mt-2 md:mt-0"
        >
          {topRow.map((ex, i) => (
            <ImageCard key={i} {...ex} aiGenLabel={t("aiGenerated")} />
          ))}
        </m.div>

        {/* Animated disclaimer line */}
        <div className="my-7 hidden items-center justify-center space-x-2 text-sm md:flex">
          <ChevronRight className="h-4 w-4 rotate-90 text-black/50" />
          <p className="animate-[textPulse_3s_ease-in-out_infinite] font-medium">
            {t("disclaimer")}
          </p>
          <ChevronRight className="h-4 w-4 rotate-90 text-black/50" />
        </div>

        {/* Showcase grid — 3 rows x 4, landscape 305x275 */}
        <m.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-2 gap-1 md:grid-cols-4 md:gap-2 mt-4 md:mt-0"
        >
          {showcaseGrid.map((ex, i) => (
            <LandscapeCard key={i} {...ex} aiGenLabel={t("aiGenerated")} />
          ))}
        </m.div>

        {/* Review cards — 2 rows of 4 with bottom fade */}
        <div className="relative mt-6 md:mt-8">
          <m.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="grid grid-cols-1 gap-4 pb-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {reviews.map((review, i) => (
              <ReviewCard key={i} review={review} />
            ))}
          </m.div>

          {/* White fade blur at the bottom of the grid */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-44 bg-linear-to-t from-white via-white/80 to-transparent" />
        </div>

        {/* CTA buttons */}
        <m.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative z-10 mt-2 flex flex-col items-center justify-center gap-3 md:flex-row md:gap-4"
        >
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-muted"
          >
            {t("viewAllReviews")}
            <ChevronRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            {t("createHeadshots")}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </m.div>
      </div>
    </section>
  );
};

export default Examples;
