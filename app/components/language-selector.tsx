"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@/i18n/routing";

const languages = [
  {
    code: "en",
    label: "English",
    flag: (
      <svg width="16" height="12" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="12" fill="white" />
        <rect width="16" height="0.92" fill="red" />
        <rect y="1.84" width="16" height="0.92" fill="red" />
        <rect y="3.68" width="16" height="0.92" fill="red" />
        <rect y="5.52" width="16" height="0.92" fill="red" />
        <rect y="7.36" width="16" height="0.92" fill="red" />
        <rect y="9.2" width="16" height="0.92" fill="red" />
        <rect y="11.04" width="16" height="0.92" fill="red" />
        <rect width="6" height="4.6" fill="blue" />
      </svg>
    ),
  },
  {
    code: "de",
    label: "German",
    flag: (
      <svg width="16" height="12" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="4" fill="black" />
        <rect y="4" width="16" height="4" fill="red" />
        <rect y="8" width="16" height="4" fill="gold" />
      </svg>
    ),
  },
  {
    code: "es",
    label: "Spanish",
    flag: (
      <svg width="16" height="12" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="4" fill="#C60B1E" />
        <rect y="4" width="16" height="4" fill="yellow" />
        <rect y="8" width="16" height="4" fill="#C60B1E" />
      </svg>
    ),
  },
  {
    code: "fr",
    label: "French",
    flag: (
      <svg width="16" height="12" xmlns="http://www.w3.org/2000/svg">
        <rect width="5.33" height="12" fill="blue" />
        <rect x="5.33" width="5.34" height="12" fill="white" />
        <rect x="10.67" width="5.33" height="12" fill="red" />
      </svg>
    ),
  },
  {
    code: "it",
    label: "Italian",
    flag: (
      <svg width="16" height="12" xmlns="http://www.w3.org/2000/svg">
        <rect width="5.33" height="12" fill="#008C45" />
        <rect x="5.33" width="5.34" height="12" fill="white" />
        <rect x="10.67" width="5.33" height="12" fill="#CD212A" />
      </svg>
    ),
  },
];

interface LanguageSelectorProps {
  variant?: "light" | "dark";
  showLabel?: boolean;
  mode?: "dropdown" | "inline";
}

export default function LanguageSelector({
  variant = "light",
  showLabel = false,
  mode = "dropdown",
}: LanguageSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();
  const t = useTranslations("Footer");
  const selected =
    languages.find((l) => l.code === currentLocale) ?? languages[0];
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Dashboard routes bypass next-intl middleware, so detect them
  const isDashboardRoute =
    typeof window !== "undefined" &&
    (window.location.pathname.startsWith("/dashboard") ||
      window.location.pathname.startsWith("/login"));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function switchLocale(locale: Locale) {
    setOpen(false);
    if (isDashboardRoute) {
      // Dashboard is not under [locale] route — set cookie and reload
      document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=${60 * 60 * 24 * 365}`;
      window.location.reload();
    } else {
      router.replace(pathname, { locale });
    }
  }

  if (mode === "inline") {
    return (
      <div className="w-full">
        <button
          onClick={() => setOpen(!open)}
          className="w-full flex items-center justify-between py-3 text-sm font-semibold text-black cursor-pointer transition-colors"
        >
          <span className="flex items-center gap-2">
            {selected.flag}
            <span>{selected.label}</span>
          </span>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.span>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="overflow-hidden"
            >
              <div className="flex flex-col gap-0.5 pb-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => switchLocale(lang.code as Locale)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      selected.code === lang.code
                        ? "bg-primary/5 font-semibold text-primary"
                        : "hover:bg-gray-50 font-medium text-black"
                    }`}
                  >
                    {lang.flag}
                    {lang.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={`relative ${showLabel ? "w-full" : "inline-block"}`}
    >
      <button
        onClick={() => setOpen(!open)}
        className={`h-9 px-3 flex items-center gap-1.5 text-sm font-semibold rounded-lg cursor-pointer transition-colors ${
          showLabel ? "w-full justify-between" : ""
        } ${
          variant === "dark"
            ? "text-white hover:bg-white/10"
            : "text-black hover:bg-gray-100"
        }`}
      >
        <span className="flex items-center gap-1.5">
          {selected.flag}
          <span>
            {showLabel ? selected.label : selected.code.toUpperCase()}
          </span>
        </span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className={`absolute ${showLabel ? "left-0 bottom-full z-50 pb-2" : variant === "dark" ? "left-0 top-full z-50 pt-2" : "right-0 top-full z-50 pt-2"}`}
        >
          <div
            className={`rounded-xl shadow-lg border py-2 px-2 w-48 ${
              variant === "dark"
                ? "bg-[#1a1a1a] border-gray-800 text-white"
                : "bg-white border-gray-200"
            }`}
          >
            <div
              className={`text-xs font-semibold uppercase mb-1.5 px-2 py-1 border-b-gray-100 ${
                variant === "dark"
                  ? "text-gray-400 bg-white/5"
                  : "text-gray-500 "
              }`}
            >
              {t("language")}
            </div>
            <ul className="flex flex-col gap-0.5">
              {languages.map((lang) => (
                <li key={lang.code}>
                  <button
                    onClick={() => switchLocale(lang.code as Locale)}
                    className={`w-full gap-2.5 flex items-center text-left px-2.5 py-2 rounded-lg cursor-pointer transition-colors text-sm ${
                      variant === "dark"
                        ? selected.code === lang.code
                          ? "bg-white/10 font-semibold text-white"
                          : "hover:bg-white/5 font-medium text-gray-300 hover:text-white"
                        : selected.code === lang.code
                          ? "bg-gray-100 font-semibold text-black"
                          : "hover:bg-gray-50 font-medium text-black"
                    }`}
                  >
                    {lang.flag}
                    {lang.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
