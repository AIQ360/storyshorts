"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { SubmitHandler, useForm } from "react-hook-form";
import { FaFemale, FaImages, FaMale, FaRainbow } from "react-icons/fa";
import * as z from "zod";
import { fileUploadFormSchema } from "@/types/zod";
import { createClient } from "@/lib/supabase/client";
import axios from "axios";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { showLowCreditsToast } from "@/app/dashboard/components/low-credits-toast";

type FormInput = z.infer<typeof fileUploadFormSchema>;

type PackClass = {
  key?: string;
  credits_per_pack?: number;
};

type PackResponse = {
  slug?: string;
  credits_per_pack_min?: number;
  credits_per_pack_max?: number;
  classes?: PackClass[];
};

const DEFAULT_MODEL_TYPES = ["man", "woman", "person"];

const normalizeTypeKey = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]/g, "");

const withManWomanReplicated = (types: string[]) => {
  const normalized = new Set(types.map((type) => normalizeTypeKey(type)));
  const next = [...types];

  if (normalized.has("man") && !normalized.has("woman")) {
    next.push("woman");
  }
  if (normalized.has("woman") && !normalized.has("man")) {
    next.push("man");
  }

  return next;
};

const withInclusiveHumanType = (types: string[]) => {
  const normalized = new Set(types.map((type) => normalizeTypeKey(type)));
  const hasMan = normalized.has("man") || normalized.has("male");
  const hasWoman = normalized.has("woman") || normalized.has("female");
  const hasInclusive =
    normalized.has("person") ||
    normalized.has("unisex") ||
    normalized.has("nonbinary") ||
    normalized.has("other");

  if (hasMan && hasWoman && !hasInclusive) {
    return [...types, "person"];
  }

  return types;
};

const getTypeLabel = (type: string, d: ReturnType<typeof useTranslations>) => {
  const normalized = normalizeTypeKey(type);
  if (normalized === "man" || normalized === "male") return d("man");
  if (normalized === "woman" || normalized === "female") return d("woman");
  if (
    normalized === "person" ||
    normalized === "unisex" ||
    normalized === "other"
  ) {
    return d("unisex");
  }

  return type
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function TrainModelZone({
  packSlug,
  place,
  style,
  color,
  mode = "train",
  trainCredits = 30,
  testMode = false,
}: {
  packSlug: string;
  place?: string;
  style?: string;
  color?: string;
  mode?: "train" | "generate";
  trainCredits?: number;
  testMode?: boolean;
}) {
  const astriaTestMode = testMode;
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>(
    mode === "generate" && packSlug !== "raw-tune" ? [] : DEFAULT_MODEL_TYPES,
  );
  const [isLoadingPackTypes, setIsLoadingPackTypes] = useState(
    mode === "generate" && packSlug !== "raw-tune",
  );
  const [packCreditsByType, setPackCreditsByType] = useState<
    Record<string, number>
  >({});
  const [fallbackPackCredits, setFallbackPackCredits] = useState<number | null>(
    null,
  );
  const router = useRouter();
  const d = useTranslations("Dashboard");

  const form = useForm<FormInput>({
    resolver: zodResolver(fileUploadFormSchema),
    defaultValues: {
      name: "",
      type: "man",
    },
  });

  const onSubmit: SubmitHandler<FormInput> = () => {
    if (files.length < 4) {
      toast.error(d("minFourImages"));
      return;
    }
    if (astriaTestMode && mode === "train") {
      toast.info(d("testModeToast"));
    }
    trainModel();
  };

  useEffect(() => {
    if (mode !== "generate" || packSlug === "raw-tune") {
      setAvailableTypes(DEFAULT_MODEL_TYPES);
      setPackCreditsByType({});
      setFallbackPackCredits(null);
      setIsLoadingPackTypes(false);
      return;
    }

    let isMounted = true;

    const fetchPackTypes = async () => {
      setIsLoadingPackTypes(true);
      try {
        const response = await fetch("/api/astria/packs");
        if (!response.ok) throw new Error("Failed to fetch packs");

        const data = (await response.json()) as PackResponse[];
        const matchedPack = Array.isArray(data)
          ? data.find(
              (pack: any) =>
                String(pack?.slug || "").toLowerCase() ===
                packSlug.toLowerCase(),
            )
          : null;

        const rawTypes = Array.isArray(matchedPack?.classes)
          ? matchedPack.classes
              .map((cls: any) => String(cls?.key || "").trim())
              .filter(Boolean)
          : [];

        const deduped = Array.from(
          new Map(
            rawTypes.map((type: string) => [normalizeTypeKey(type), type]),
          ).values(),
        );

        const nextTypes =
          deduped.length > 0
            ? withInclusiveHumanType(withManWomanReplicated(deduped))
            : DEFAULT_MODEL_TYPES;

        const creditsMap = new Map<string, number>();
        if (Array.isArray(matchedPack?.classes)) {
          for (const cls of matchedPack.classes) {
            const key = normalizeTypeKey(String(cls?.key || ""));
            const credits = Number(cls?.credits_per_pack || 0);
            if (key && Number.isFinite(credits) && credits > 0) {
              creditsMap.set(key, credits);
            }
          }
        }

        const manCredits = creditsMap.get("man") || creditsMap.get("male");
        const womanCredits =
          creditsMap.get("woman") || creditsMap.get("female");

        if (manCredits && womanCredits) {
          const inclusiveCredits = Math.ceil((manCredits + womanCredits) / 2);
          ["person", "unisex", "nonbinary", "other"].forEach((key) => {
            if (!creditsMap.has(key)) creditsMap.set(key, inclusiveCredits);
          });
        }

        const minPackCredits = Number(matchedPack?.credits_per_pack_min || 0);
        const maxPackCredits = Number(matchedPack?.credits_per_pack_max || 0);
        const fallbackCredits =
          minPackCredits > 0
            ? minPackCredits
            : maxPackCredits > 0
              ? maxPackCredits
              : null;

        if (!isMounted) return;

        setAvailableTypes(nextTypes);
        setPackCreditsByType(Object.fromEntries(creditsMap.entries()));
        setFallbackPackCredits(fallbackCredits);

        const currentType = form.getValues("type");
        const hasCurrentType = nextTypes.some(
          (type) => normalizeTypeKey(type) === normalizeTypeKey(currentType),
        );

        if (!hasCurrentType) {
          form.setValue("type", nextTypes[0], { shouldValidate: true });
        }
      } catch {
        if (!isMounted) return;
        setAvailableTypes(DEFAULT_MODEL_TYPES);
        setPackCreditsByType({});
        setFallbackPackCredits(null);
      } finally {
        if (isMounted) setIsLoadingPackTypes(false);
      }
    };

    fetchPackTypes();

    return () => {
      isMounted = false;
    };
  }, [form, mode, packSlug]);

  const onFormError = (errors: any) => {
    if (errors.name) {
      toast.error(errors.name.message || d("nameRequired"));
    }
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newFiles: File[] =
        acceptedFiles.filter(
          (file: File) => !files.some((f) => f.name === file.name),
        ) || [];

      // if user tries to upload more than 10 files, display a toast
      if (newFiles.length + files.length > 10) {
        toast.error(d("uploadMaxImages"));
        return;
      }

      // display a toast if any duplicate files were found
      if (newFiles.length !== acceptedFiles.length) {
        toast.warning(d("duplicateFilesIgnored"));
      }

      // check that in total images do not exceed a combined 4.5MB
      const totalSize = files.reduce((acc, file) => acc + file.size, 0);
      const newSize = newFiles.reduce((acc, file) => acc + file.size, 0);

      if (totalSize + newSize > 4.5 * 1024 * 1024) {
        toast.error(d("fileSizeExceeded"));
        return;
      }

      setFiles([...files, ...newFiles]);

      toast.success(d("imagesSelectedSuccess"));
    },
    [files],
  );

  const removeFile = useCallback(
    (file: File) => {
      setFiles(files.filter((f) => f.name !== file.name));
    },
    [files],
  );

  const trainModel = useCallback(async () => {
    setIsLoading(true);
    // Upload each file to Supabase Storage and store the resulting URLs
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error(d("pleaseSignIn"));
      setIsLoading(false);
      return;
    }

    const uploadedUrls: string[] = [];

    if (files) {
      for (const file of files) {
        const filePath = `${user.id}/${Date.now()}-${file.name}`;
        const { error } = await supabase.storage
          .from("training-samples")
          .upload(filePath, file, { contentType: file.type, upsert: false });

        if (error) {
          toast.error(error.message);
          setIsLoading(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from("training-samples")
          .getPublicUrl(filePath);

        uploadedUrls.push(urlData.publicUrl);
      }
    }

    const payload = {
      urls: uploadedUrls,
      name: form.getValues("name").trim(),
      type: form.getValues("type"),
      pack: packSlug,
      ...(place && { place }),
      ...(style && { style }),
      ...(color && { color }),
    };

    // Send the JSON payload to the "/api/astria/train-model" endpoint
    const response = await fetch("/api/astria/train-model", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setIsLoading(false);

    if (!response.ok) {
      const responseData = await response.json();
      const responseMessage: string = responseData.message;
      console.error("Something went wrong! ", responseMessage);
      if (responseMessage.includes("Not enough credits")) {
        showLowCreditsToast({
          message: responseMessage || d("lowCreditsMessage"),
          onBuyMore: () => router.push("/dashboard/billing"),
          buyMoreLabel: d("buyMoreCreditsBtn"),
        });
      } else {
        toast.error(responseMessage);
      }
      return;
    }

    toast.success(d("modelQueuedForTraining"));

    router.push("/dashboard");
  }, [color, files, form, packSlug, place, router, style]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
    },
  });

  const modelType = form.watch("type");
  const normalizedTrainCredits = Math.max(1, Math.round(trainCredits || 30));
  const normalizedModelType = normalizeTypeKey(modelType || "");
  const selectedStyleCredits =
    packCreditsByType[normalizedModelType] || fallbackPackCredits;
  const actionCredits =
    mode === "generate" ? selectedStyleCredits : normalizedTrainCredits;
  const creditsLabel =
    actionCredits && actionCredits > 0
      ? `${actionCredits} ${actionCredits === 1 ? d("credit") : d("creditPlural")}`
      : null;
  const actionLabel =
    mode === "generate" ? d("generateHeadshots") : d("trainModel");
  const ctaLabel = creditsLabel
    ? `${actionLabel} (${creditsLabel})`
    : actionLabel;

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, onFormError)}
          className="rounded-md flex flex-col gap-8"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="w-full rounded-md">
                <FormLabel>{d("name")}</FormLabel>
                <FormDescription>{d("nameDesc")}</FormDescription>
                <FormControl>
                  <Input
                    placeholder={d("namePlaceholder")}
                    {...field}
                    className="max-w-screen-sm"
                    autoComplete="off"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="flex flex-col gap-4">
            <FormLabel>{d("type")}</FormLabel>
            <FormDescription>{d("typeDesc")}</FormDescription>
            {isLoadingPackTypes ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="rounded-md border-2 border-muted p-4 space-y-3"
                  >
                    <Skeleton className="h-6 w-6 mx-auto rounded-full" />
                    <Skeleton className="h-3.5 w-16 mx-auto" />
                  </div>
                ))}
              </div>
            ) : (
              <RadioGroup
                className={`grid gap-4 ${availableTypes.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : availableTypes.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}
                value={modelType}
                onValueChange={(value) => {
                  form.setValue("type", value);
                }}
                disabled={isLoadingPackTypes}
              >
                {availableTypes.map((type) => {
                  const normalized = normalizeTypeKey(type);
                  const optionId = `type-${normalized || "option"}`;
                  const Icon =
                    normalized === "man" || normalized === "male"
                      ? FaMale
                      : normalized === "woman" || normalized === "female"
                        ? FaFemale
                        : FaRainbow;

                  return (
                    <div key={type}>
                      <RadioGroupItem
                        value={type}
                        id={optionId}
                        className="peer sr-only"
                        aria-label={type}
                      />
                      <Label
                        htmlFor={optionId}
                        className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                      >
                        <Icon className="mb-3 h-6 w-6" />
                        {getTypeLabel(type, d)}
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            )}
          </div>
          <div
            {...getRootProps()}
            className=" rounded-md justify-center align-middle cursor-pointer flex flex-col gap-4"
          >
            <FormLabel>{d("samples")}</FormLabel>
            <FormDescription>{d("samplesDesc")}</FormDescription>
            <div className="border-2 border-dashed border-gray-200 hover:border-primary/30 w-full rounded-xl p-6 flex justify-center transition-colors">
              <input {...getInputProps()} />
              {isDragActive ? (
                <p className="self-center text-sm text-primary">
                  {d("dropFiles")}
                </p>
              ) : (
                <div className="flex justify-center flex-col items-center gap-2">
                  <FaImages size={28} className="text-gray-400" />
                  <p className="self-center text-sm text-muted-foreground">
                    {d("dragAndDrop")}
                  </p>
                </div>
              )}
            </div>
          </div>
          {files.length > 0 && (
            <div className="flex flex-row gap-4 flex-wrap">
              {files.map((file) => (
                <div key={file.name} className="flex flex-col gap-1">
                  <img
                    src={URL.createObjectURL(file)}
                    className="rounded-md w-24 h-24 object-cover"
                  />
                  <Button
                    variant="outline"
                    size={"sm"}
                    className="w-full"
                    onClick={() => removeFile(file)}
                  >
                    {d("remove")}
                  </Button>
                </div>
              ))}
            </div>
          )}

          <Button
            type="submit"
            className="w-full rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white font-semibold cursor-pointer"
            isLoading={isLoading}
            disabled={astriaTestMode && mode === "generate"}
          >
            {astriaTestMode && mode === "train"
              ? `${ctaLabel} — ${d("testMode")}`
              : ctaLabel}
          </Button>
          {astriaTestMode && mode === "generate" && (
            <p className="text-xs text-amber-600 text-center">
              {d("testModeDisabledStyles")}
            </p>
          )}
        </form>
      </Form>
    </div>
  );
}
