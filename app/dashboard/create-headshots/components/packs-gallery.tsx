"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

interface Pack {
  id: string;
  title: string;
  cover_url: string;
  slug: string;
  total_images: number;
  preview_images: string[];
  credits_per_pack_min?: number;
  credits_per_pack_max?: number;
}

export default function PacksGalleryZone() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const d = useTranslations("Dashboard");

  const fetchPacks = async (): Promise<void> => {
    try {
      const response = await fetch("/api/astria/packs");
      const data = await response.json();
      setPacks(data);
    } catch (err) {
      toast.error(d("pleaseTryAgainLater"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="rounded-2xl overflow-hidden">
            <Skeleton className="aspect-3/4 w-full" />
            <div className="pt-3 pb-1">
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (packs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-muted-foreground">
          {d("noStylesAvailable")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {packs.map((pack) => (
        <Link
          href={`/dashboard/create-headshots/ai-models/train/${pack.slug}`}
          key={pack.id}
          className="group block"
        >
          <div className="overflow-hidden rounded-2xl bg-gray-50/50 transition-all duration-300 group-hover:shadow-lg group-hover:-translate-y-0.5">
            <div className="aspect-3/4 overflow-hidden">
              <img
                src={
                  pack.cover_url ||
                  pack.preview_images?.[0] ||
                  "/api/placeholder/400/500"
                }
                alt={pack.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </div>
          <div className="mt-2.5 text-center">
            <p className="text-sm font-medium text-gray-800 capitalize group-hover:text-primary transition-colors">
              {pack.title}
            </p>
            {pack.total_images > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                <ImageIcon className="h-3 w-3" />
                {pack.total_images} {d("headshots")}
              </p>
            )}
            {(pack.credits_per_pack_min || pack.credits_per_pack_max) && (
              <p className="text-xs text-[#0025cc] mt-1 font-medium">
                {pack.credits_per_pack_min === pack.credits_per_pack_max
                  ? `${pack.credits_per_pack_max} ${d("creditsPerPack")}`
                  : `${pack.credits_per_pack_min}-${pack.credits_per_pack_max} ${d("creditsPerPack")}`}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
