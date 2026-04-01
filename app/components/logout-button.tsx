"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useTranslations } from "next-intl";

function submitLogout() {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = "/api/auth/sign-out";
  document.body.appendChild(form);
  form.submit();
}

export function LogoutDropdownItem() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Navbar");

  return (
    <DropdownMenuItem
      disabled={loading}
      onSelect={(e) => {
        e.preventDefault();
        setLoading(true);
        submitLogout();
      }}
      className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      <span>{t("logOut")}</span>
    </DropdownMenuItem>
  );
}

export function LogoutMobileButton() {
  const [loading, setLoading] = useState(false);
  const t = useTranslations("Navbar");

  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => {
        setLoading(true);
        submitLogout();
      }}
      className="w-full h-10 rounded-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <LogOut className="h-4 w-4" />
      )}
      {t("logOut")}
    </button>
  );
}
