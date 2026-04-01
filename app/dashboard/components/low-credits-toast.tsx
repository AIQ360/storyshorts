"use client";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type ShowLowCreditsToastParams = {
  message?: string;
  onBuyMore: () => void;
  buyMoreLabel?: string;
};

export function showLowCreditsToast({
  message = "Low credits. Please buy more credits to continue.",
  onBuyMore,
  buyMoreLabel = "Buy More Credits",
}: ShowLowCreditsToastParams) {
  toast.custom(
    (id) => (
      <div className="w-[min(92vw,420px)] rounded-2xl border border-amber-200/70 bg-white p-4 shadow-lg">
        <p className="text-sm text-gray-800">{message}</p>
        <div className="mt-3 flex justify-end">
          <Button
            className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white px-4 h-8"
            onClick={() => {
              toast.dismiss(id);
              onBuyMore();
            }}
          >
            {buyMoreLabel}
          </Button>
        </div>
      </div>
    ),
    { duration: 8000 },
  );
}
