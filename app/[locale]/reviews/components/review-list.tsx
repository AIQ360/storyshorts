"use client";

import { useState } from "react";
import * as m from "motion/react-client";
import { Loader2 } from "lucide-react";
import {
  ReviewCard,
  reviews as originalReviews,
} from "@/app/components/examples";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

// Create a large list of reviews by repeating the original ones
const allReviews = Array.from({ length: 10 }).flatMap(() => originalReviews);
const REVIEWS_PER_PAGE = 24;

export default function ReviewList() {
  const t = useTranslations("ReviewList");
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);

  const loadMore = () => {
    setIsLoading(true);
    // Simulate loading delay for better UX
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + REVIEWS_PER_PAGE, allReviews.length),
      );
      setIsLoading(false);
    }, 600);
  };

  const visibleReviews = allReviews.slice(0, visibleCount);
  const hasMore = visibleCount < allReviews.length;

  return (
    <section className="py-12 md:py-20">
      <div className="mx-auto max-w-7xl px-5">
        <div className="mb-8 text-center text-sm text-muted-foreground/80 max-w-2xl mx-auto">
          {t("consent")}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleReviews.map((review, i) => (
            <m.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: (i % REVIEWS_PER_PAGE) * 0.05,
              }}
            >
              <ReviewCard review={review} />
            </m.div>
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 flex justify-center">
            <Button
              onClick={loadMore}
              disabled={isLoading}
              variant="outline"
              className="h-12 w-12 rounded-full p-0 shadow-sm transition-all hover:shadow-md cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-light text-primary">+</span>
                </div>
              )}
              <span className="sr-only">{t("loadMore")}</span>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
