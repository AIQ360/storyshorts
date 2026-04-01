"use client";
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useForm, SubmitHandler } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff, Check, X, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import LoginShowcase from "../components/login-showcase";
import Logo from "@/app/components/logo";
import {
  PASSWORD_RULES,
  getPasswordStrength,
  validatePassword,
} from "@/lib/password";

type Inputs = { password: string; confirmPassword: string };

function ResetPasswordForm() {
  const t = useTranslations("Login");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<Inputs>();
  const strength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      setResetSuccess(true);
    } catch (error: any) {
      toast.error(error.message || t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
        <LoginShowcase />
      </div>
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-white p-4 lg:p-8">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <a href="/">
              <Logo variant="black" width={160} height={40} sparkleSize={24} />
            </a>
          </div>

          {!resetSuccess && (
            <div className="mb-6">
              <h2 className="text-xl font-medium text-black">
                {t("resetPasswordTitle")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("enterNewPassword")}
              </p>
            </div>
          )}

          <div className="p-2">
            {resetSuccess ? (
              <div className="space-y-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-xl font-medium tracking-wide text-black">
                    {t("passwordResetSuccess")}
                  </h2>
                </div>
                <p className="text-sm text-gray-500 text-center">
                  {t("passwordResetSuccessSubtitle")}
                </p>
                <Button
                  className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                  onClick={() => {
                    router.push("/login");
                    router.refresh();
                  }}
                >
                  {t("continueToSignIn")}
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder={t("newPasswordPlaceholder")}
                      className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                      {...register("password", {
                        required: t("passwordRequired"),
                        validate: validatePassword,
                        onChange: (e) => setNewPassword(e.target.value),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-1 flex-1 rounded-full transition-colors ${
                                level <= strength.score
                                  ? strength.color
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span
                          className={`text-xs font-medium ${
                            strength.score <= 1
                              ? "text-red-500"
                              : strength.score <= 2
                                ? "text-orange-500"
                                : strength.score <= 3
                                  ? "text-yellow-500"
                                  : "text-primary"
                          }`}
                        >
                          {t(strength.labelKey as any)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 gap-0.5">
                        {PASSWORD_RULES.map((rule) => {
                          const passed = rule.test(newPassword);
                          return (
                            <div
                              key={rule.key}
                              className="flex items-center gap-1.5"
                            >
                              {passed ? (
                                <Check className="h-3 w-3 text-primary" />
                              ) : (
                                <X className="h-3 w-3 text-gray-300" />
                              )}
                              <span
                                className={`text-[11px] ${passed ? "text-gray-700" : "text-gray-400"}`}
                              >
                                {t(rule.labelKey as any)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {isSubmitted && errors.password && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder={t("confirmPasswordPlaceholder")}
                      className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                      {...register("confirmPassword", {
                        required: t("confirmPasswordRequired"),
                        validate: (val) =>
                          val === watch("password") || t("passwordsMustMatch"),
                      })}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {isSubmitted && errors.confirmPassword && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>

                <Button
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                  type="submit"
                >
                  {t("resetPasswordButton")}
                </Button>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-50 rounded-full transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>{t("backToSignIn")}</span>
                </button>
              </form>
            )}
          </div>

          <p className="text-xs text-gray-400 tracking-wide mt-6">
            {t("termsPrefix")}{" "}
            <a href="/terms" className="text-primary hover:underline">
              {t("termsOfService")}
            </a>{" "}
            &{" "}
            <a href="/privacy" className="text-primary hover:underline">
              {t("privacyPolicy")}
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordForm;
