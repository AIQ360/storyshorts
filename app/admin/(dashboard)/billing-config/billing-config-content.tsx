"use client";

import { useMemo, useState } from "react";
import {
  CreditCard,
  Save,
  Loader2,
  Zap,
  Wand2,
  Package,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { toast } from "sonner";

type BillingPackage = {
  id: string;
  name: string;
  price: number;
  credits: number;
  featured?: boolean;
  badge?: string;
};

const BADGE_OPTIONS = ["", "82% Choose This", "Best Value"] as const;

type Props = {
  packages: BillingPackage[];
  creditValue: number;
  profitMargin: number;
  aiModelCredits: number;
  magicEditorCredits: number;
  isTestAdmin?: boolean;
};

export default function BillingConfigContent({
  packages: initialPackages,
  creditValue,
  aiModelCredits,
  magicEditorCredits,
  isTestAdmin = false,
}: Props) {
  const [packages, setPackages] = useState<BillingPackage[]>(initialPackages);
  const [isSaving, setIsSaving] = useState(false);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<BillingPackage | null>(null);

  const usedBadges = useMemo(() => {
    return new Set(packages.map((pkg) => pkg.badge || "").filter(Boolean));
  }, [packages]);

  const openEdit = (index: number) => {
    setEditingIndex(index);
    setDraft({ ...packages[index] });
  };

  const closeEdit = () => {
    setEditingIndex(null);
    setDraft(null);
  };

  const saveEdit = () => {
    if (editingIndex === null || !draft) return;

    if (!draft.name.trim()) {
      toast.error("Package name cannot be empty");
      return;
    }
    if (draft.price <= 0) {
      toast.error("Package price must be greater than $0");
      return;
    }
    if (draft.credits <= 0) {
      toast.error("Package credits must be greater than 0");
      return;
    }

    if (
      !BADGE_OPTIONS.includes(
        (draft.badge || "") as (typeof BADGE_OPTIONS)[number],
      )
    ) {
      toast.error("Badges must be either 82% Choose This or Best Value");
      return;
    }

    setPackages((prev) => {
      const next = [...prev];
      next[editingIndex] = {
        ...next[editingIndex],
        ...draft,
        badge: draft.badge || "",
      };
      return next;
    });

    closeEdit();
  };

  const handleSave = async () => {
    for (const pkg of packages) {
      if (!pkg.name.trim()) {
        toast.error("Package names cannot be empty");
        return;
      }
      if (pkg.price <= 0) {
        toast.error("Package prices must be greater than $0");
        return;
      }
      if (pkg.credits <= 0) {
        toast.error("Package credits must be greater than 0");
        return;
      }
      if (
        pkg.badge &&
        !BADGE_OPTIONS.includes(pkg.badge as (typeof BADGE_OPTIONS)[number])
      ) {
        toast.error("Badges must be either 82% Choose This or Best Value");
        return;
      }
    }

    const badgeCounts = packages.reduce(
      (acc, pkg) => {
        if (pkg.badge === "82% Choose This") acc.popular += 1;
        if (pkg.badge === "Best Value") acc.best += 1;
        return acc;
      },
      { popular: 0, best: 0 },
    );

    if (badgeCounts.popular > 1 || badgeCounts.best > 1) {
      toast.error("Only one package can use each badge");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: { billing_packages: packages },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save");
        return;
      }

      toast.success("Billing packages saved");
    } catch {
      toast.error("Failed to save packages");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-4xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-black">Billing Packages</h2>
        <p className="text-muted-foreground mt-1">
          Edit package pricing and badges. One package can use each special
          badge.
        </p>
      </div>

      <div className="rounded-2xl bg-blue-50/50 border border-blue-200/40 p-4">
        <p className="text-xs font-medium text-blue-700 mb-2">
          Credit Usage Reference
        </p>
        <div className="flex flex-wrap gap-4 text-xs text-blue-600">
          <div className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" />
            AI Model: {aiModelCredits} credits
          </div>
          <div className="flex items-center gap-1.5">
            <Wand2 className="h-3.5 w-3.5" />
            Magic Edit: {magicEditorCredits} credits
          </div>
          <div className="flex items-center gap-1.5">
            <CreditCard className="h-3.5 w-3.5" />
            Credit value: ${creditValue.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {packages.map((pkg, index) => (
          <div
            key={pkg.id}
            className={`rounded-2xl bg-white border shadow-sm p-4 sm:p-6 transition-all ${
              pkg.badge === "82% Choose This"
                ? "border-primary/30 ring-1 ring-primary/10"
                : "border-gray-200/60"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">{pkg.name}</p>
                  {pkg.badge && (
                    <span className="text-[10px] text-primary font-medium">
                      {pkg.badge}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-black hover:bg-gray-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                disabled={isTestAdmin}
                onClick={() => openEdit(index)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Price ($)
                </label>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm text-black">
                  ${pkg.price.toFixed(2)}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Credits
                </label>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm text-black">
                  {pkg.credits}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Badge
                </label>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm text-black">
                  {pkg.badge || "None"}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Value / Credit
                </label>
                <div className="h-9 rounded-lg bg-gray-50 border border-gray-200/60 flex items-center px-3 text-sm text-muted-foreground">
                  $
                  {pkg.credits > 0 ? (pkg.price / pkg.credits).toFixed(4) : "—"}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span>
                ≈ {Math.floor(pkg.credits / aiModelCredits)} AI models
              </span>
              <span className="text-gray-300">•</span>
              <span>
                ≈ {Math.floor(pkg.credits / magicEditorCredits)} magic edits
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving || isTestAdmin}
          className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white px-6"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Save Packages
            </>
          )}
        </Button>
      </div>

      <AlertDialog
        open={editingIndex !== null}
        onOpenChange={(open) => !open && closeEdit()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Package</AlertDialogTitle>
            <AlertDialogDescription>
              Update title, pricing, credits, and badge for this package.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {draft && (
            <div className="space-y-4 py-1">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Title
                </label>
                <Input
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="h-10 rounded-lg border-gray-200/60"
                  placeholder="Package name"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Price ($)
                  </label>
                  <Input
                    value={draft.price}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="h-10 rounded-lg border-gray-200/60"
                    type="number"
                    step="0.01"
                    min="0.01"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    Credits
                  </label>
                  <Input
                    value={draft.credits}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        credits: parseInt(e.target.value) || 0,
                      })
                    }
                    className="h-10 rounded-lg border-gray-200/60"
                    type="number"
                    min="1"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  Badge (optional)
                </label>
                <select
                  value={draft.badge || ""}
                  onChange={(e) =>
                    setDraft({ ...draft, badge: e.target.value || "" })
                  }
                  className="h-10 w-full rounded-lg border border-gray-200/60 bg-white px-3 text-sm"
                >
                  <option value="">No badge</option>
                  <option
                    value="82% Choose This"
                    disabled={
                      draft.badge !== "82% Choose This" &&
                      usedBadges.has("82% Choose This")
                    }
                  >
                    82% Choose This
                  </option>
                  <option
                    value="Best Value"
                    disabled={
                      draft.badge !== "Best Value" &&
                      usedBadges.has("Best Value")
                    }
                  >
                    Best Value
                  </option>
                </select>
              </div>

              <div className="rounded-lg bg-gray-50 border border-gray-200/60 px-3 py-2 text-xs text-muted-foreground">
                Value / Credit:{" "}
                {draft.credits > 0
                  ? `$${(draft.price / draft.credits).toFixed(4)}`
                  : "—"}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={saveEdit}
              className="bg-[#0025cc] hover:bg-[#0025cc]/90"
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
