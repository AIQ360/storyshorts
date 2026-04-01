"use client";

import { modelRowWithSamples } from "@/types/utils";
import Link from "next/link";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Search,
  Trash2,
  Loader2,
  X,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from "@/components/ui/pagination";
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

const PER_PAGE = 24;

function getStatusColor(status: string) {
  switch (status) {
    case "finished":
      return "bg-emerald-50 text-emerald-700 border-emerald-200/60";
    case "processing":
      return "bg-amber-50 text-amber-700 border-amber-200/60";
    default:
      return "bg-gray-50 text-gray-600 border-gray-200/60";
  }
}

function formatPackName(pack: string | null, fallback: string) {
  if (!pack) return fallback;
  return pack
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type GalleryListProps = {
  models: modelRowWithSamples[];
  type: "ai-models" | "styles";
};

export default function GalleryList({
  models: initialModels,
  type,
}: GalleryListProps) {
  const d = useTranslations("Dashboard");
  const [models, setModels] = useState(initialModels);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteScope, setDeleteScope] = useState<"all" | "selected">("all");

  const filtered = useMemo(() => {
    return models.filter((m) => {
      const matchSearch =
        !search ||
        (m.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
        (type === "styles" &&
          formatPackName(m.pack, d("customStyle"))
            .toLowerCase()
            .includes(search.toLowerCase()));
      const matchStatus = statusFilter === "all" || m.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [models, search, statusFilter, type]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * PER_PAGE,
    currentPage * PER_PAGE,
  );

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
          : `/api/astria/clear-models?type=${type}`;

      const res = await fetch(url, { method: "DELETE" });
      if (res.ok) {
        if (deleteScope === "selected") {
          setModels((prev) => prev.filter((m) => !selected.has(m.id)));
          toast.success(d("selectedDeleted"));
        } else {
          setModels([]);
          toast.success(
            type === "ai-models" ? d("allModelsCleared") : d("stylesCleared"),
          );
        }
        setSelected(new Set());
        setSelectMode(false);
        setPage(1);
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

  const statuses = ["all", "finished", "processing"];

  const getPaginationPages = () => {
    const pages: (number | "ellipsis")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis");
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-gray-200/60 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <h2 className="text-2xl font-semibold text-black">
            {type === "ai-models" ? d("myAiModels") : d("myHeadshots")}
          </h2>
          <p className="text-muted-foreground mt-1">
            {models.length === 1
              ? type === "ai-models"
                ? d("youHaveModels", { count: models.length })
                : d("youHaveStyles", { count: models.length })
              : type === "ai-models"
                ? d("youHaveModelsPlural", { count: models.length })
                : d("youHaveStylesPlural", { count: models.length })}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={d("searchPlaceholder")}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9 rounded-full border-gray-200/60 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {statuses.map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs capitalize"
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
            >
              {s === "all"
                ? d("all")
                : s === "finished"
                  ? d("completed")
                  : d("training")}
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:ml-auto">
          {models.length > 0 && !selectMode && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60 text-red-500 hover:text-red-600 hover:bg-red-50 hover:border-red-200/60"
                onClick={() => {
                  setDeleteScope("all");
                  setShowDeleteDialog(true);
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                {d("removeAll")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60 hover:bg-gray-50"
                onClick={() => setSelectMode(true)}
              >
                {d("select")}
              </Button>
            </>
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

      {/* Grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground text-sm">
          {d("noResults")}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map((model) => {
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
                <p className="text-xs text-muted-foreground capitalize">
                  {type === "styles"
                    ? formatPackName(model.pack, d("customStyle"))
                    : model.type || d("person")}
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
                <p className="text-xs text-muted-foreground capitalize">
                  {type === "styles"
                    ? formatPackName(model.pack, d("customStyle"))
                    : model.type || d("person")}
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
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {d("pageOf", { current: currentPage, total: totalPages })}
          </p>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
              {getPaginationPages().map((p, i) =>
                p === "ellipsis" ? (
                  <PaginationItem key={`e-${i}`}>
                    <PaginationEllipsis />
                  </PaginationItem>
                ) : (
                  <PaginationItem key={p}>
                    <PaginationLink
                      isActive={p === currentPage}
                      onClick={() => setPage(p)}
                      className="cursor-pointer"
                    >
                      {p}
                    </PaginationLink>
                  </PaginationItem>
                ),
              )}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

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
                ? type === "ai-models"
                  ? d("removeAllModelsDesc")
                  : d("removeAllStylesDesc")
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
