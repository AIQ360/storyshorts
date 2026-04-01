"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";

type Pack = {
  credits_per_pack_min?: number;
  credits_per_pack_max?: number;
};

export default function EntryCreditLabel({
  kind,
  aiModelCredits,
}: {
  kind: "train" | "styles";
  aiModelCredits: number;
}) {
  const d = useTranslations("Dashboard");
  const [stylesRange, setStylesRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  useEffect(() => {
    if (kind !== "styles") return;

    let mounted = true;

    const loadStylesCredits = async () => {
      try {
        const res = await fetch("/api/astria/packs");
        if (!res.ok) return;

        const packs = (await res.json()) as Pack[];
        if (!Array.isArray(packs)) return;

        const mins = packs
          .map((pack) => Number(pack.credits_per_pack_min || 0))
          .filter((value) => Number.isFinite(value) && value > 0);
        const maxes = packs
          .map((pack) => Number(pack.credits_per_pack_max || 0))
          .filter((value) => Number.isFinite(value) && value > 0);

        if (!mounted || mins.length === 0 || maxes.length === 0) return;

        setStylesRange({
          min: Math.min(...mins),
          max: Math.max(...maxes),
        });
      } catch {
        // Keep fallback label when pack pricing is unavailable.
      }
    };

    loadStylesCredits();

    return () => {
      mounted = false;
    };
  }, [kind]);

  const label = useMemo(() => {
    if (kind === "train") {
      const credits = Math.max(1, Math.round(aiModelCredits || 1));
      return `${credits} ${credits === 1 ? d("credit") : d("creditPlural")}`;
    }

    if (!stylesRange) {
      return `${d("dynamic")} ${d("creditPlural")}`;
    }

    if (stylesRange.min === stylesRange.max) {
      return `${stylesRange.max} ${d("creditPlural")}`;
    }

    return `${stylesRange.min}-${stylesRange.max} ${d("creditPlural")}`;
  }, [aiModelCredits, d, kind, stylesRange]);

  return (
    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
      {label}
    </span>
  );
}
