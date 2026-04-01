"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  User,
  Mail,
  Shield,
  Coins,
  Calendar,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

type SettingsUser = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  provider: string;
  createdAt: string;
  credits: number;
};

export default function SettingsContent({ user }: { user: SettingsUser }) {
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const d = useTranslations("Dashboard");
  const locale = useLocale();

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success(d("accountDeletedSuccess"));
        window.location.href = "/";
      } else {
        toast.error(d("failedToDeleteAccount"));
      }
    } catch {
      toast.error(d("somethingWentWrong"));
    } finally {
      setIsDeleting(false);
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="w-full max-w-3xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-black">{d("settings")}</h2>
        <p className="text-muted-foreground mt-1">{d("managePreferences")}</p>
      </div>

      {/* Account Overview */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
          {d("accountOverview")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {d("authMethod")}
              </span>
            </div>
            <p className="text-sm font-medium text-black capitalize">
              {user.provider === "google"
                ? d("googleProvider")
                : d("emailPassword")}
            </p>
          </div>

          <div className="sm:col-span-2 lg:col-span-2 rounded-2xl bg-white border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {d("email")}
              </span>
            </div>
            <p className="text-sm font-medium text-black break-all">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {d("credits")}
              </span>
            </div>
            <p className="text-sm font-medium text-black">{user.credits}</p>
          </div>

          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-primary/5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <span className="text-xs text-muted-foreground">
                {d("memberSince")}
              </span>
            </div>
            <p className="text-sm font-medium text-black">{memberSince}</p>
          </div>
        </div>
      </section>

      {/* Profile Settings */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
          {d("profile")}
        </h3>
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-sm text-gray-700">
                {d("fullName")}
              </Label>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <Input
                  id="fullName"
                  value={user.fullName || "—"}
                  disabled
                  className="bg-gray-50/50 border-gray-200/60"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-700">
                {d("emailAddress")}
              </Label>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center shrink-0">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="bg-gray-50/50 border-gray-200/60"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {d("profileManagedBy", {
                provider:
                  user.provider === "google"
                    ? d("googleAccount")
                    : d("loginProvider"),
              })}
            </p>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-red-600 uppercase tracking-wider">
          {d("dangerZone")}
        </h3>
        <div className="rounded-2xl bg-white border border-red-200/60 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-500" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-black">
                {d("deleteAccount")}
              </h4>
              <p className="text-xs text-muted-foreground mt-1 mb-4">
                {d("deleteAccountDesc")}
              </p>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-full"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    {d("deleteAccount")}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{d("areYouSure")}</AlertDialogTitle>
                    <AlertDialogDescription>
                      {d("deleteAccountWarning")}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <div className="space-y-2 py-2">
                    <Label
                      htmlFor="delete-confirm"
                      className="text-sm text-gray-700"
                    >
                      {d.rich("typeDeleteToConfirm", {
                        strong: (chunks) => <strong>{chunks}</strong>,
                      })}
                    </Label>
                    <Input
                      id="delete-confirm"
                      value={deleteConfirmation}
                      onChange={(e) => setDeleteConfirmation(e.target.value)}
                      placeholder="DELETE"
                      autoComplete="off"
                    />
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel
                      onClick={() => setDeleteConfirmation("")}
                    >
                      {d("cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={deleteConfirmation !== "DELETE" || isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      {isDeleting ? d("deleting") : d("deleteAccount")}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
