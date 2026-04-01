"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import {
  Building2,
  Briefcase,
  Stethoscope,
  HomeIcon,
  ShoppingBag,
  GraduationCap,
  LandmarkIcon,
  TreesIcon,
  ArrowRight,
  Loader2,
  PencilLine,
  Palette,
} from "lucide-react";
import { useTranslations } from "next-intl";

const places = [
  { id: "studio", labelKey: "placeStudio" as const, icon: Building2 },
  { id: "office", labelKey: "placeOffice" as const, icon: Briefcase },
  { id: "medical", labelKey: "placeMedical" as const, icon: Stethoscope },
  { id: "home-office", labelKey: "placeHomeOffice" as const, icon: HomeIcon },
  { id: "retail", labelKey: "placeRetail" as const, icon: ShoppingBag },
  { id: "education", labelKey: "placeEducation" as const, icon: GraduationCap },
  {
    id: "real-estate",
    labelKey: "placeRealEstate" as const,
    icon: LandmarkIcon,
  },
  { id: "outdoors", labelKey: "placeOutdoors" as const, icon: TreesIcon },
  { id: "custom", labelKey: "placeCustom" as const, icon: PencilLine },
];

const styles = [
  { id: "casual", labelKey: "styleCasual" as const },
  { id: "business", labelKey: "styleBusiness" as const },
  { id: "smart-casual", labelKey: "styleSmartCasual" as const },
  { id: "medical", labelKey: "styleMedical" as const },
  { id: "formal", labelKey: "styleFormal" as const },
  { id: "custom", labelKey: "styleCustom" as const },
];

const colors = [
  {
    id: "charcoal-grey",
    labelKey: "colorCharcoalGrey" as const,
    hex: "#36454F",
  },
  { id: "navy-blue", labelKey: "colorNavyBlue" as const, hex: "#000080" },
  { id: "black", labelKey: "colorBlack" as const, hex: "#1a1a1a" },
  { id: "brown", labelKey: "colorBrown" as const, hex: "#8B4513" },
  { id: "white", labelKey: "colorWhite" as const, hex: "#f5f5f5" },
  { id: "light-grey", labelKey: "colorLightGrey" as const, hex: "#D3D3D3" },
  { id: "burgundy", labelKey: "colorBurgundy" as const, hex: "#800020" },
  { id: "beige", labelKey: "colorBeige" as const, hex: "#F5F5DC" },
  { id: "custom", labelKey: "colorCustom" as const, hex: undefined },
];

export default function StyleSelectionZone() {
  const router = useRouter();
  const d = useTranslations("Dashboard");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [customPlace, setCustomPlace] = useState("");
  const [customStyle, setCustomStyle] = useState("");
  const [customColor, setCustomColor] = useState("");
  const [isNavigating, setIsNavigating] = useState(false);
  const [customDialog, setCustomDialog] = useState<{
    type: "place" | "style" | "color";
    open: boolean;
  }>({ type: "place", open: false });
  const [customDialogValue, setCustomDialogValue] = useState("");

  const placeValue =
    selectedPlace === "custom" ? customPlace.trim() : selectedPlace;
  const styleValue =
    selectedStyle === "custom" ? customStyle.trim() : selectedStyle;
  const colorValue =
    selectedColor === "custom" ? customColor.trim() : selectedColor;
  const isComplete = placeValue && styleValue && colorValue;

  const handleContinue = () => {
    if (!isComplete) return;
    setIsNavigating(true);
    const params = new URLSearchParams({
      place: placeValue!,
      style: styleValue!,
      color: colorValue!,
    });
    router.push(
      `/dashboard/create-headshots/ai-models/train/raw-tune?${params.toString()}`,
    );
  };

  const openCustomDialog = (type: "place" | "style" | "color") => {
    const currentValue =
      type === "place"
        ? customPlace
        : type === "style"
          ? customStyle
          : customColor;
    setCustomDialogValue(currentValue);
    setCustomDialog({ type, open: true });
  };

  const confirmCustomDialog = () => {
    const value = customDialogValue.trim();
    if (!value) return;
    if (customDialog.type === "place") {
      setSelectedPlace("custom");
      setCustomPlace(value);
    } else if (customDialog.type === "style") {
      setSelectedStyle("custom");
      setCustomStyle(value);
    } else {
      setSelectedColor("custom");
      setCustomColor(value);
    }
    setCustomDialog({ ...customDialog, open: false });
  };

  const customDialogLabels = {
    place: {
      title: d("customSetting"),
      description: d("customSettingDesc"),
      placeholder: d("customSettingPlaceholder"),
    },
    style: {
      title: d("customClothingStyle"),
      description: d("customClothingStyleDesc"),
      placeholder: d("customClothingStylePlaceholder"),
    },
    color: {
      title: d("customOutfitColor"),
      description: d("customOutfitColorDesc"),
      placeholder: d("customOutfitColorPlaceholder"),
    },
  };

  return (
    <div className="space-y-10">
      {/* Place/Setting */}
      <section>
        <h3 className="text-sm font-semibold text-black mb-1">
          {d("chooseSetting")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {d("chooseSettingDesc")}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {places.map((place) => {
            const Icon = place.icon;
            const isSelected = selectedPlace === place.id;
            const isCustomWithValue =
              place.id === "custom" &&
              selectedPlace === "custom" &&
              customPlace;
            return (
              <button
                key={place.id}
                type="button"
                onClick={() =>
                  place.id === "custom"
                    ? openCustomDialog("place")
                    : setSelectedPlace(place.id)
                }
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border p-4 transition-all cursor-pointer shadow-sm",
                  "hover:border-primary/30 hover:bg-primary/2",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-gray-200/60 bg-white",
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-gray-700",
                  )}
                >
                  {isCustomWithValue ? customPlace : d(place.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Clothing Style */}
      <section>
        <h3 className="text-sm font-semibold text-black mb-1">
          {d("clothingStyle")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {d("clothingStyleDesc")}
        </p>
        <div className="flex flex-wrap gap-2">
          {styles.map((style) => {
            const isSelected = selectedStyle === style.id;
            const isCustomWithValue =
              style.id === "custom" &&
              selectedStyle === "custom" &&
              customStyle;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() =>
                  style.id === "custom"
                    ? openCustomDialog("style")
                    : setSelectedStyle(style.id)
                }
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-medium transition-all cursor-pointer shadow-sm",
                  "hover:border-primary/30 hover:bg-primary/2",
                  isSelected
                    ? "border-primary bg-primary/5 text-primary ring-1 ring-primary/20"
                    : "border-gray-200/60 bg-white text-gray-700",
                )}
              >
                {isCustomWithValue ? customStyle : d(style.labelKey)}
              </button>
            );
          })}
        </div>
      </section>

      {/* Color */}
      <section>
        <h3 className="text-sm font-semibold text-black mb-1">
          {d("outfitColor")}
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          {d("outfitColorDesc")}
        </p>
        <div className="flex flex-wrap gap-3">
          {colors.map((color) => {
            const isSelected = selectedColor === color.id;
            const isCustomWithValue =
              color.id === "custom" &&
              selectedColor === "custom" &&
              customColor;
            return (
              <button
                key={color.id}
                type="button"
                onClick={() =>
                  color.id === "custom"
                    ? openCustomDialog("color")
                    : setSelectedColor(color.id)
                }
                className={cn(
                  "flex items-center gap-2.5 rounded-full border px-3.5 py-2 transition-all cursor-pointer shadow-sm",
                  "hover:border-primary/30 hover:bg-primary/2",
                  isSelected
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-gray-200/60 bg-white",
                )}
              >
                {color.hex ? (
                  <span
                    className={cn(
                      "h-4 w-4 rounded-full border shrink-0",
                      isSelected ? "border-primary/30" : "border-gray-300",
                    )}
                    style={{ backgroundColor: color.hex }}
                  />
                ) : (
                  <Palette
                    className={cn(
                      "h-4 w-4 shrink-0",
                      isSelected ? "text-primary" : "text-muted-foreground",
                    )}
                  />
                )}
                <span
                  className={cn(
                    "text-xs font-medium",
                    isSelected ? "text-primary" : "text-gray-700",
                  )}
                >
                  {isCustomWithValue ? customColor : d(color.labelKey)}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Continue Button */}
      <div className="pt-2">
        <Button
          onClick={handleContinue}
          disabled={!isComplete || isNavigating}
          className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white font-semibold text-sm px-8 gap-2 cursor-pointer"
        >
          {isNavigating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {d("loading")}
            </>
          ) : (
            <>
              {d("continue")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
        {!isComplete && (
          <p className="text-xs text-muted-foreground mt-2">
            {d("selectAllToContinue")}
          </p>
        )}
      </div>

      {/* Custom Option Dialog */}
      <AlertDialog
        open={customDialog.open}
        onOpenChange={(open) => setCustomDialog({ ...customDialog, open })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {customDialogLabels[customDialog.type].title}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {customDialogLabels[customDialog.type].description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            autoFocus
            placeholder={customDialogLabels[customDialog.type].placeholder}
            value={customDialogValue}
            onChange={(e) => setCustomDialogValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") confirmCustomDialog();
            }}
            className="bg-white border-gray-200/60 shadow-sm"
          />
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {d("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCustomDialog}
              disabled={!customDialogValue.trim()}
              className="bg-[#0025cc] hover:bg-[#0025cc]/90 cursor-pointer"
            >
              {d("confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
