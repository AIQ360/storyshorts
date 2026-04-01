"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

const StarRating = ({ rating = 5 }: { rating?: number }) => (
  <div className="inline-flex gap-0.5 px-3 py-1">
    {[...Array(rating)].map((_, i) => (
      <svg
        key={i}
        className="w-4 h-4 text-amber-400"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function LoginShowcase() {
  const t = useTranslations("Login");
  const [currentReview, setCurrentReview] = useState(0);

  const reviews = [
    {
      id: 1,
      textKey: "showcaseReview1" as const,
      authorKey: "showcaseAuthor1" as const,
      avatar: "/assets/examples/ex-1.jpg",
    },
    {
      id: 2,
      textKey: "showcaseReview2" as const,
      authorKey: "showcaseAuthor2" as const,
      avatar: "/assets/examples/ex-4.jpg",
    },
    {
      id: 3,
      textKey: "showcaseReview3" as const,
      authorKey: "showcaseAuthor3" as const,
      avatar: "/assets/examples/ex-7.jpg",
    },
    {
      id: 4,
      textKey: "showcaseReview4" as const,
      authorKey: "showcaseAuthor4" as const,
      avatar: "/assets/examples/ex-9.jpg",
    },
    {
      id: 5,
      textKey: "showcaseReview5" as const,
      authorKey: "showcaseAuthor5" as const,
      avatar: "/assets/examples/ex-11.jpg",
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentReview((prev) => (prev + 1) % reviews.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [reviews.length]);

  const headshotImages = [
    "/headshots/human1.png",
    "/headshots/human2.png",
    "/headshots/human3.png",
    "/headshots/human4.png",
    "/headshots/human5.png",
    "/headshots/human6.png",
    "/headshots/human7.png",
    "/headshots/human8.png",
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between h-full bg-primary/5 p-8 overflow-hidden">
      {/* Top section */}
      <div className="space-y-1">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className="text-4xl xl:text-5xl font-bold text-black leading-tight">
            {t("showcaseTitle")}
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0025cc] to-[#2b5fff]">
              {t("showcaseTitleHighlight")}
            </span>{" "}
            {t("showcaseTitleEnd")}
          </h1>
        </motion.div>

        {/* AI Headshot Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-4 gap-1.5 mt-6"
        >
          {headshotImages.map((src, index) => (
            <motion.div
              key={src}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
              className="relative rounded-xl overflow-hidden border border-gray-200"
              style={{ width: 172, height: 172 }}
            >
              <Image
                src={src}
                alt={t("aiHeadshotAlt", { index: index + 1 })}
                fill
                className="object-cover object-top"
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Bottom section - Single Review with Animation */}
        <div className="pt-3">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="relative h-28">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                  className="absolute inset-0"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <StarRating />
                    <span className="text-xs tracking-wide font-medium text-primary">
                      {t("showcaseReviewsLabel")}
                    </span>
                  </div>

                  <p className="text-sm tracking-wide italic text-gray-700 mb-3">
                    &quot;{t(reviews[currentReview].textKey)}&quot;
                  </p>

                  <div className="flex items-center gap-2">
                    <div className="relative w-7 h-7 rounded-full overflow-hidden">
                      <Image
                        src={reviews[currentReview].avatar}
                        alt={t(reviews[currentReview].authorKey)}
                        fill
                        className="object-cover object-top scale-150"
                      />
                    </div>
                    <span className="text-xs text-gray-600 tracking-wider">
                      {t(reviews[currentReview].authorKey)}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Used by professionals section */}
      <div className="mt-0">
        <p className="text-xs text-gray-600 font-medium text-center mb-4">
          {t("usedByProfessionals")}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-5 grayscale opacity-60">
          <Image
            src="/images/company-logos/taxada.svg"
            alt="Taxado"
            width={60}
            height={16}
            className="h-4 w-auto select-none"
          />
          <Image
            src="/images/company-logos/gunzx.svg"
            alt="Gunzx"
            width={80}
            height={28}
            className="h-7 w-auto select-none"
          />
          <Image
            src="/images/company-logos/publisher_logo.jpg"
            alt="Publisher"
            width={24}
            height={24}
            className="h-6 w-auto select-none"
          />
          <Image
            src="/images/company-logos/kanba.svg"
            alt="Kanba"
            width={70}
            height={24}
            className="h-6 w-auto select-none"
          />
        </div>
      </div>
    </div>
  );
}
