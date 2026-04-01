"use client";

import { Database } from "@/types/supabase";
import { modelRowWithSamples } from "@/types/utils";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Plus,
  Loader2,
  Trash2,
  ArrowRight,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/animate-ui/components/radix/alert-dialog";

const MAX_VISIBLE = 3;

export default function StylesOverview({
  serverModels,
}: {
  serverModels: modelRowWithSamples[];
}) {
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string,
  );

  const [models, setModels] = useState<modelRowWithSamples[]>(serverModels);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"all" | "selected">("all");
  const d = useTranslations("Dashboard");

  useEffect(() => {
    const channel = supabase
      .channel("realtime-styles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "models" },
        async (payload: any) => {
          if (!payload.new?.pack) return;

          const samples = await supabase
            .from("samples")
            .select("*")
            .eq("modelId", payload.new.id);

          const newModel: modelRowWithSamples = {
            ...payload.new,
            samples: samples.data,
          };

          const dedupedModels = models.filter(
            (model) => model.id !== payload.old?.id,
          );

          setModels([...dedupedModels, newModel]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, models]);

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const url =
        deleteScope === "selected"
          ? `/api/astria/clear-models?ids=${Array.from(selected).join(",")}`
          : "/api/astria/clear-models?type=styles";

      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (deleteScope === "selected") {
          setModels((prev) => prev.filter((m) => !selected.has(m.id)));
          toast.success(d("selectedDeleted"));
        } else {
          setModels([]);
          toast.success(d("stylesCleared"));
        }
        setSelected(new Set());
        setSelectMode(false);
      } else {
        toast.error(d("somethingWentWrong"));
      }
    } catch {
      toast.error(d("somethingWentWrong"));
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const visibleModels = models.slice(0, MAX_VISIBLE);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finished":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
      case "processing":
        return "bg-amber-50 text-amber-700 border-amber-200/60";
      default:
        return "bg-gray-50 text-gray-600 border-gray-200/60";
    }
  };

  const formatPackName = (pack: string | null) => {
    if (!pack) return d("customStyle");
    return pack
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-black">
            {d("stylesGallery")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {models.length > 0
              ? models.length === 1
                ? d("youHaveStyles", { count: models.length })
                : d("youHaveStylesPlural", { count: models.length })
              : d("getStartedStyles")}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {models.length > MAX_VISIBLE && (
            <Link href="/dashboard/my-headshots">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60 hover:bg-gray-50"
              >
                {d("myHeadshots")}
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            </Link>
          )}
          {models.length > 0 && !selectMode && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200/60 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200/60"
              onClick={() => {
                setDeleteScope("all");
                setShowDeleteDialog(true);
              }}
              disabled={isDeleting}
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" />
              {d("removeAll")}
            </Button>
          )}
          {models.length > 0 && !selectMode && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-full border-gray-200/60 hover:bg-gray-50"
              onClick={() => setSelectMode(true)}
            >
              {d("select")}
            </Button>
          )}
          {selectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60 hover:bg-gray-50"
                onClick={() => {
                  setSelectMode(false);
                  setSelected(new Set());
                }}
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                {d("cancel")}
              </Button>
              {selected.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-full border-red-200/60 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => {
                    setDeleteScope("selected");
                    setShowDeleteDialog(true);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  {d("removeSelected", { count: selected.size })}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {/* Create Headshots Card */}
        {!selectMode && (
          <Link
            href="/dashboard/create-headshots"
            className="group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm p-8 text-center transition-all hover:border-primary/30 hover:bg-primary/2 hover:shadow-lg min-h-45"
          >
            <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-colors">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium text-black">
              {d("createHeadshots")}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {d("browseStyles")}
            </p>
          </Link>
        )}

        {/* Style Model Cards */}
        {visibleModels.map((model) => {
          const isSelected = selected.has(model.id);
          return selectMode ? (
            <button
              key={model.id}
              type="button"
              onClick={() => toggleSelect(model.id)}
              className={`rounded-2xl border shadow-sm p-5 transition-all hover:shadow-lg min-h-45 flex flex-col text-left ${
                isSelected
                  ? "bg-primary/5 border-gray-200/60"
                  : "bg-white border-gray-200/60 hover:border-gray-300/60"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-black truncate pr-2">
                  {model.name || d("untitled")}
                </h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium shrink-0 ${getStatusColor(model.status)}`}
                  >
                    {model.status === "finished"
                      ? d("completed")
                      : model.status === "processing"
                        ? d("training")
                        : model.status}
                  </Badge>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary fill-primary stroke-white shrink-0" />
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPackName(model.pack)}
              </p>
              <div className="flex-1" />
              {model.samples && model.samples.length > 0 && (
                <div className="flex items-center justify-end mt-4">
                  <div className="flex -space-x-2">
                    {model.samples.slice(0, 3).map((sample) => (
                      <img
                        key={sample.id}
                        src={sample.uri}
                        alt={d("sampleAlt")}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                    {model.samples.length > 3 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
                        +{model.samples.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </button>
          ) : (
            <Link
              key={model.id}
              href={`/dashboard/create-headshots/ai-models/${model.id}`}
              className="group rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5 transition-all hover:shadow-lg hover:border-gray-300/60 min-h-45 flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-black truncate pr-2">
                  {model.name || d("untitled")}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-medium shrink-0 ${getStatusColor(model.status)}`}
                >
                  {model.status === "finished"
                    ? d("completed")
                    : model.status === "processing"
                      ? d("training")
                      : model.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatPackName(model.pack)}
              </p>
              <div className="flex-1" />
              {model.samples && model.samples.length > 0 && (
                <div className="flex items-center justify-end mt-4">
                  <div className="flex -space-x-2">
                    {model.samples.slice(0, 3).map((sample) => (
                      <img
                        key={sample.id}
                        src={sample.uri}
                        alt={d("sampleAlt")}
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                      />
                    ))}
                    {model.samples.length > 3 && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 ring-2 ring-white">
                        +{model.samples.length - 3}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deleteScope === "all"
                ? d("removeAllTitle")
                : d("removeSelectedTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deleteScope === "all"
                ? d("removeAllStylesDesc")
                : d("removeSelectedDesc", { count: selected.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {d("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Trash2 className="h-4 w-4 mr-1.5" />
              )}
              {deleteScope === "all" ? d("removeAll") : d("remove")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
