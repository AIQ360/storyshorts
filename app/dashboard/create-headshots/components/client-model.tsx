"use client";

import React, { useState, useEffect } from "react";
import { Icons } from "@/components/icons";
import { Database } from "@/types/supabase";
import { imageRow, modelRow, sampleRow } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Eye, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogCancel,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/animate-ui/components/radix/alert-dialog";

export const revalidate = 0;

type ClientSideModelProps = {
  serverModel: modelRow;
  serverImages: imageRow[];
  samples: sampleRow[];
};

export default function ClientSideModel({
  serverModel,
  serverImages,
  samples,
}: ClientSideModelProps) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  );
  const [model, setModel] = useState<modelRow>(serverModel);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const d = useTranslations("Dashboard");

  useEffect(() => {
    const channel = supabase
      .channel("realtime-model")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "models" },
        (payload: { new: modelRow }) => {
          setModel(payload.new);
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, model, setModel]);

  const handleDownload = async (
    imageId: number,
    imageUrl: string,
    fileName: string,
  ) => {
    setDownloadingId(imageId);
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
      const response = await fetch(proxyUrl);

      if (!response.ok) throw new Error("Failed to fetch image");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(d("meDownloaded"));
    } catch (error) {
      console.error("Error downloading the image:", error);
      toast.error(d("meDownloadFailed"));
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-col w-full mt-4 gap-8">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
          {samples && (
            <div className="flex w-full lg:w-1/2 flex-col gap-3">
              <h2 className="text-lg font-semibold text-black">
                {d("trainingData")}
              </h2>
              <div className="flex flex-row gap-4 flex-wrap">
                {samples.map((sample, index) => (
                  <img
                    key={sample.id}
                    src={sample.uri}
                    alt={`${d("sampleAlt")} ${index + 1}`}
                    className="rounded-xl w-full sm:w-60 h-48 sm:h-60 object-cover"
                  />
                ))}
              </div>
            </div>
          )}
          <div className="flex flex-col w-full lg:w-1/2 rounded-md">
            {model.status === "finished" && (
              <div className="flex flex-1 flex-col gap-3">
                <h2 className="text-lg font-semibold text-black">
                  {d("results")}
                </h2>
                <div className="flex flex-row flex-wrap gap-4">
                  {serverImages?.map((image) => (
                    <div
                      key={image.id}
                      className="group relative rounded-xl w-full sm:w-60 h-48 sm:h-60 overflow-hidden"
                    >
                      <img
                        src={image.uri}
                        alt={`Generated image ${image.id}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4 gap-2">
                        <Button
                          size="sm"
                          className="bg-white hover:bg-gray-100 text-gray-900 border-0 shadow-lg cursor-pointer rounded-full"
                          onClick={() => setPreviewImage(image.uri)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" />
                          {d("preview")}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white hover:bg-gray-100 text-gray-900 border-0 shadow-lg cursor-pointer rounded-full"
                          disabled={downloadingId === image.id}
                          onClick={() =>
                            handleDownload(
                              image.id,
                              image.uri,
                              `generated-image-${image.id}.jpg`,
                            )
                          }
                        >
                          {downloadingId === image.id ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                          ) : (
                            <Download className="h-3.5 w-3.5 mr-1.5" />
                          )}
                          {d("download")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Animated Image Preview Dialog */}
      <AlertDialog
        open={!!previewImage}
        onOpenChange={(open) => {
          if (!open) setPreviewImage(null);
        }}
      >
        <AlertDialogContent className="max-w-2xl p-0 overflow-hidden bg-white border-0">
          <AlertDialogTitle className="sr-only">
            {d("imagePreview")}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            {d("previewDescription")}
          </AlertDialogDescription>
          <div className="relative">
            <img
              src={previewImage || ""}
              alt="Preview"
              className="w-full h-auto"
            />
            <AlertDialogCancel className="absolute top-3 right-3 h-8 w-8 rounded-full bg-white/80 hover:bg-white border-0 p-0 flex items-center justify-center cursor-pointer">
              <span className="sr-only">{d("close")}</span>✕
            </AlertDialogCancel>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
