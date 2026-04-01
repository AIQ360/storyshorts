"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FlaskConical } from "lucide-react";
import { useTranslations } from "next-intl";

export default function Alert() {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  const d = useTranslations("Dashboard");

  return (
    <AnimatePresence>
      {isBannerVisible && (
        <motion.div
          key="test-mode-badge"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="mb-4 inline-flex"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/80 pl-3 pr-2 py-1.5">
            <FlaskConical className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <p className="text-xs font-medium text-amber-700">
              {d("testMode")}
            </p>
            <button
              type="button"
              onClick={() => setIsBannerVisible(false)}
              className="shrink-0 rounded-full p-0.5 text-amber-500 hover:bg-amber-100 hover:text-amber-700 transition-colors cursor-pointer"
            >
              <X className="h-3 w-3" />
              <span className="sr-only">{d("dismiss")}</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
