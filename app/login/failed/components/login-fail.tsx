"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export const LoginFail = ({ errorCode }: { errorCode?: string }) => {
  const t = useTranslations("Login");

  const errorMessage =
    errorCode === "AuthApiError"
      ? t("failedAuthError")
      : t("failedGenericError");

  return (
    <div className="mt-16 sm:mt-24 md:mt-32 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="mt-16 sm:mt-24 md:mt-32 -mb-12.5">
        <a href="./">
          <Image
            src="/images/logo/logo-1.svg"
            alt={t("logoAlt")}
            width={192}
            height={48}
            className="w-48 h-auto"
          />
        </a>
      </div>
      <div className="flex flex-col gap-4 bg-gray-50 p-4 rounded-md max-w-sm w-full mt-10">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-gray-900">{errorMessage}</p>
        </div>
        <div>
          <Link href={"/login"}>
            <div className="max-w-sm mx-auto flex gap-2 text-xs items-center justify-center hover:underline">
              <p>{t("failedLoginLink")}</p>
              <ExternalLink size={16} />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
