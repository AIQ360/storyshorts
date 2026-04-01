"use client";

import { useState, useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  Wand2,
  Upload,
  ImageIcon,
  Loader2,
  X,
  Download,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { showLowCreditsToast } from "@/app/dashboard/components/low-credits-toast";

export default function MagicEditorContent({
  requiredCredits = 6,
  testMode = false,
}: {
  requiredCredits?: number;
  testMode?: boolean;
}) {
  const astriaTestMode = testMode;
  const d = useTranslations("Dashboard");
  const router = useRouter();
  const normalizedRequiredCredits = Math.max(
    1,
    Math.round(requiredCredits || 6),
  );
  const generateLabel = `${d("meGenerate")} (${normalizedRequiredCredits} ${
    normalizedRequiredCredits === 1 ? d("credit") : d("creditPlural")
  })`;

  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error(d("meInvalidFile"));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error(d("meFileTooLarge"));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setSourceImage(e.target?.result as string);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    },
    [d],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleGenerate = async () => {
    if (!sourceImage) {
      toast.error(d("meImageRequired"));
      return;
    }
    if (!prompt.trim()) {
      toast.error(d("mePromptRequired"));
      return;
    }

    setIsGenerating(true);
    setResultImage(null);

    try {
      const res = await fetch("/api/magic-editor/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: prompt.trim(),
          imageDataUrl: sourceImage || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 402) {
          showLowCreditsToast({
            message: data.error || d("meNoCredits"),
            onBuyMore: () => router.push("/dashboard/billing"),
            buyMoreLabel: d("buyMoreCreditsBtn"),
          });
        } else {
          toast.error(data.error || d("meGenerationFailed"));
        }
        return;
      }

      setResultImage(data.imageDataUrl);
      toast.success(d("meGenerationSuccess"));
    } catch {
      toast.error(d("meGenerationFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!resultImage) return;
    const a = document.createElement("a");
    a.href = resultImage;
    a.download = `magic-edit-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const clearSource = () => {
    setSourceImage(null);
    setResultImage(null);
    setPrompt("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const clearResult = () => {
    setResultImage(null);
  };

  return (
    <div className="flex flex-col min-h-100 h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            {d("magicEditor")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {d("meDescriptionRequired")}
          </p>
        </div>
        <Link href="/dashboard/magic-editor/gallery">
          <Button variant="outline" className="rounded-full border-gray-200/60">
            <ImageIcon className="h-4 w-4 mr-2" />
            {d("meMyGallery")}
          </Button>
        </Link>
      </div>

      {/* Image Zone — shows source or result */}
      <div
        onDrop={!resultImage ? handleDrop : undefined}
        onDragOver={!resultImage ? handleDragOver : undefined}
        onDragLeave={!resultImage ? handleDragLeave : undefined}
        onClick={() =>
          !sourceImage && !resultImage && fileInputRef.current?.click()
        }
        className={`relative w-full flex-1 min-h-0 rounded-2xl border-2 transition-all duration-200 flex items-center justify-center overflow-hidden ${
          resultImage
            ? "border-gray-200/60 bg-gray-50/30"
            : isDragging
              ? "border-dashed border-[#0025cc] bg-[#0025cc]/5"
              : sourceImage
                ? "border-dashed border-gray-200/60 bg-gray-50/50"
                : "border-dashed border-gray-300/60 bg-gray-50/30 hover:border-gray-400/60 hover:bg-gray-50/50 cursor-pointer"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />

        <AnimatePresence mode="wait">
          {resultImage ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="relative w-full h-full flex items-center justify-center p-6"
            >
              {/* Result action bar */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="bg-white/90 backdrop-blur-sm rounded-full px-3.5 py-1.5 text-xs font-medium text-gray-700 border border-gray-200/60 shadow-sm">
                  {d("meResult")}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownload}
                    className="h-8 px-3 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
                  >
                    <Download className="h-3.5 w-3.5" />
                    {d("meDownload")}
                  </button>
                  <Link href="/dashboard/magic-editor/gallery">
                    <span className="h-8 px-3 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer">
                      {d("meViewGallery")}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                  <button
                    onClick={clearResult}
                    className="h-8 px-3 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm text-xs font-medium text-gray-700 inline-flex items-center gap-1.5 hover:bg-white transition-colors cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">{d("meNewEdit")}</span>
                  </button>
                  <button
                    onClick={clearSource}
                    className="h-8 w-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
              </div>
              <img
                src={resultImage}
                alt={d("meGeneratedResult")}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
            </motion.div>
          ) : sourceImage ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full h-full flex items-center justify-center p-6"
            >
              {isGenerating && (
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-[#0025cc]" />
                  <p className="text-sm font-medium text-gray-700">
                    {d("meGenerating")}...
                  </p>
                </div>
              )}
              <img
                src={sourceImage}
                alt={d("meSourceAlt")}
                className="max-h-full max-w-full rounded-xl object-contain"
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearSource();
                }}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-white border border-gray-200/60 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 py-12"
            >
              <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                <Upload className="h-7 w-7 text-gray-400" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-gray-700">
                  {d("meDragDrop")}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {d("meUploadHint")}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                {d("meBrowseFiles")}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Prompt Bar */}
      <div className="relative mt-4">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isGenerating) handleGenerate();
          }}
          placeholder={d("mePromptPlaceholder")}
          disabled={isGenerating}
          className="w-full h-13 pl-5 pr-14 sm:pr-36 rounded-full border border-gray-200/60 bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#0025cc]/20 focus:border-[#0025cc]/40 transition-all disabled:opacity-50"
        />
        <button
          onClick={handleGenerate}
          disabled={
            isGenerating || !prompt.trim() || !sourceImage || astriaTestMode
          }
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 px-3 sm:px-4 rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white text-sm font-medium inline-flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden sm:inline">{d("meGenerating")}</span>
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4" />
              <span className="hidden sm:inline">{generateLabel}</span>
              <span className="sm:hidden">{d("meGenerate")}</span>
            </>
          )}
        </button>
      </div>

      {astriaTestMode && (
        <p className="text-xs text-amber-600 text-center mt-2">
          {d("testModeDisabledEditor")}
        </p>
      )}
    </div>
  );
}
