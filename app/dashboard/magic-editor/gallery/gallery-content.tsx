"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import {
  EditedImage,
  getEditedImages,
  deleteMultipleEditedImages,
} from "../lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Download,
  Eye,
  Trash2,
  Wand2,
  Loader2,
  Search,
  CheckSquare,
  Square,
  X,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { motion } from "motion/react";

const ITEMS_PER_PAGE = 12;

const DATE_FILTERS = ["all", "today", "week", "month"] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

function filterByDate(
  images: EditedImage[],
  filter: DateFilter,
): EditedImage[] {
  if (filter === "all") return images;
  const now = new Date();
  const cutoff = new Date();
  if (filter === "today") cutoff.setHours(0, 0, 0, 0);
  else if (filter === "week") cutoff.setDate(now.getDate() - 7);
  else if (filter === "month") cutoff.setMonth(now.getMonth() - 1);
  return images.filter((img) => new Date(img.created_at) >= cutoff);
}

export default function GalleryContent() {
  const d = useTranslations("Dashboard");
  const supabase = createClient();

  const [images, setImages] = useState<EditedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<EditedImage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // Selection mode
  const [isSelectMode, setIsSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchImages = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      const offset = (currentPage - 1) * ITEMS_PER_PAGE;
      const { images: fetched, total } = await getEditedImages(
        supabase,
        user.id,
        ITEMS_PER_PAGE,
        offset,
        searchQuery || undefined,
      );
      setImages(fetched);
      setTotalImages(total);
    } catch {
      toast.error(d("meLoadError"));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, supabase, d]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleSearch = () => {
    setSearchQuery(search);
    setCurrentPage(1);
  };

  const displayedImages = filterByDate(images, dateFilter);

  const handleDownload = async (image: EditedImage) => {
    try {
      const response = await fetch(image.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `magic-edit-${image.id.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(d("meDownloaded"));
    } catch {
      toast.error(d("meDownloadFailed"));
    }
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(displayedImages.map((img) => img.id)));
  };

  const deselectAll = () => {
    setSelectedIds(new Set());
  };

  const exitSelectMode = () => {
    setIsSelectMode(false);
    setSelectedIds(new Set());
  };

  const handleBulkDeleteConfirm = async () => {
    if (selectedIds.size === 0) return;
    setIsDeleting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      await deleteMultipleEditedImages(
        supabase,
        user.id,
        Array.from(selectedIds),
      );

      setImages((prev) => prev.filter((img) => !selectedIds.has(img.id)));
      setTotalImages((prev) => prev - selectedIds.size);

      if (selectedImage && selectedIds.has(selectedImage.id)) {
        setIsDialogOpen(false);
        setSelectedImage(null);
      }

      toast.success(
        selectedIds.size === 1
          ? d("meImagesDeleted", { count: selectedIds.size })
          : d("meImagesDeletedPlural", { count: selectedIds.size }),
      );
      setSelectedIds(new Set());
      setIsSelectMode(false);
    } catch {
      toast.error(d("meDeleteFailed"));
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const totalPages = Math.ceil(totalImages / ITEMS_PER_PAGE);

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
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/magic-editor">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-gray-200/60 h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-semibold text-black">
              {d("meGalleryTitle")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {d("meGalleryDescription")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!isSelectMode ? (
            <>
              {displayedImages.length > 0 && (
                <Button
                  variant="outline"
                  className="rounded-full border-gray-200/60"
                  onClick={() => setIsSelectMode(true)}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {d("meSelect")}
                </Button>
              )}
              <Link href="/dashboard/magic-editor">
                <Button className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white">
                  <Wand2 className="h-4 w-4 mr-2" />
                  {d("meCreateNew")}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                {d("meSelected", { count: selectedIds.size })}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-gray-200/60"
                onClick={
                  selectedIds.size === displayedImages.length
                    ? deselectAll
                    : selectAll
                }
              >
                {selectedIds.size === displayedImages.length
                  ? d("meDeselectAll")
                  : d("meSelectAll")}
              </Button>
              {selectedIds.size > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="rounded-full"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  {d("meDeleteCount", { count: selectedIds.size })}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={exitSelectMode}
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={d("meSearchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            className="pl-9 rounded-full border-gray-200/60 h-9"
          />
        </div>
        <div className="flex items-center gap-2">
          {DATE_FILTERS.map((f) => (
            <Button
              key={f}
              variant={dateFilter === f ? "default" : "outline"}
              size="sm"
              className="rounded-full text-xs capitalize"
              onClick={() => setDateFilter(f)}
            >
              {f === "all"
                ? d("all")
                : f === "today"
                  ? d("meToday")
                  : f === "week"
                    ? d("meThisWeek")
                    : d("meThisMonth")}
            </Button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-100 animate-pulse rounded-xl"
            />
          ))}
        </div>
      ) : displayedImages.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {displayedImages.map((image, idx) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`group relative aspect-square overflow-hidden rounded-xl border bg-gray-50 transition-all duration-300 hover:shadow-lg ${
                  isSelectMode && selectedIds.has(image.id)
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-gray-200/60 hover:border-gray-300/60"
                }`}
                onClick={
                  isSelectMode ? () => toggleSelect(image.id) : undefined
                }
              >
                <img
                  src={image.image_url}
                  alt={image.prompt || d("meAiEditedImageAlt")}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Selection checkbox */}
                {isSelectMode && (
                  <div className="absolute top-2 left-2 z-10">
                    {selectedIds.has(image.id) ? (
                      <CheckSquare className="h-5 w-5 text-primary drop-shadow-sm" />
                    ) : (
                      <Square className="h-5 w-5 text-white drop-shadow-sm" />
                    )}
                  </div>
                )}

                {/* Hover Overlay — only in non-select mode */}
                {!isSelectMode && (
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsDialogOpen(true);
                      }}
                      className="bg-white/90 hover:bg-white text-black border-0 shadow-lg cursor-pointer"
                    >
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      {d("meView")}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleDownload(image)}
                      className="bg-[#0025cc] hover:bg-[#0025cc]/90 text-white shadow-lg cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5 mr-1" />
                      {d("meSave")}
                    </Button>
                  </div>
                )}

                {/* Date Badge */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                  {new Date(image.created_at).toLocaleDateString()}
                </div>
              </motion.div>
            ))}
          </div>

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
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                          onClick={() => setCurrentPage(p)}
                          className="cursor-pointer"
                        >
                          {p}
                        </PaginationLink>
                      </PaginationItem>
                    ),
                  )}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
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
        </>
      ) : (
        <div className="text-center py-20 rounded-2xl border border-dashed border-gray-200/60 bg-gray-50/30">
          <Wand2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? d("noResults") : d("meNoImages")}
          </h3>
          <p className="text-muted-foreground mb-6">
            {searchQuery ? d("meTryDifferentSearch") : d("meNoImagesDesc")}
          </p>
          {!searchQuery && (
            <Link href="/dashboard/magic-editor">
              <Button className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white">
                <Wand2 className="h-4 w-4 mr-2" />
                {d("meOpenEditor")}
              </Button>
            </Link>
          )}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[95vh] p-0 overflow-hidden border-gray-200/60">
          <DialogTitle className="sr-only">{d("imagePreview")}</DialogTitle>
          {selectedImage && (
            <div className="flex flex-col">
              <div className="flex-1 flex items-center justify-center bg-gray-50/50 p-6">
                <img
                  src={selectedImage.image_url}
                  alt={selectedImage.prompt || d("meAiEditedImageAlt")}
                  className="max-w-full max-h-[70vh] object-contain rounded-lg"
                />
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-white">
                {selectedImage.prompt && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    <span className="font-medium text-gray-700">
                      {d("mePromptLabel")}:
                    </span>{" "}
                    {selectedImage.prompt}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full border-gray-200/60"
                    onClick={() => handleDownload(selectedImage)}
                  >
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    {d("meDownload")}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{d("meDeleteTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {selectedIds.size === 1
                ? d("meDeleteConfirm")
                : d("meBulkDeleteConfirm", { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {d("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {d("deleting")}
                </>
              ) : selectedIds.size === 1 ? (
                d("meDeleteImages", { count: selectedIds.size })
              ) : (
                d("meDeleteImagesPlural", { count: selectedIds.size })
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
