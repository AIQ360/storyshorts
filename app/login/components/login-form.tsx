"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { SubmitHandler, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Check,
  X,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useTranslations } from "next-intl";
import LoginShowcase from "./login-showcase";
import Logo from "@/app/components/logo";
import {
  PASSWORD_RULES,
  getPasswordStrength,
  validatePassword,
} from "@/lib/password";

type Inputs = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type LoginStep =
  | "initial"
  | "email-options"
  | "sign-in"
  | "register"
  | "forgot-password"
  | "check-email"
  | "email-confirmed"
  | "confirming-email";

export const Login = ({
  host,
  searchParams,
}: {
  host: string | null;
  searchParams?: { [key: string]: string | string[] | undefined };
}) => {
  const t = useTranslations("Login");
  const router = useRouter();
  const supabase = createClient();
  const [step, setStep] = useState<LoginStep>("initial");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmedEmail, setConfirmedEmail] = useState("");

  // Handle hash fragment from Supabase email confirmation link
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes("access_token")) {
      setStep("confirming-email");
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const type = params.get("type");

      if (accessToken && refreshToken) {
        supabase.auth
          .setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          })
          .then(({ data, error }) => {
            window.history.replaceState(null, "", window.location.pathname);

            if (error) {
              console.error("Session error:", error);
              toast.error(t("emailVerifyFailed"));
              setStep("initial");
              return;
            }

            if (data?.user) {
              setConfirmedEmail(data.user.email || "");

              if (type === "signup") {
                setStep("email-confirmed");
              } else {
                router.push("/login");
                router.refresh();
              }
            }
          });
      } else {
        setStep("initial");
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    reset,
    watch,
  } = useForm<Inputs>();

  const strength = useMemo(
    () => getPasswordStrength(registerPassword),
    [registerPassword],
  );

  const onSignIn: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) throw error;

      toast.success(t("signInSuccess"));

      setTimeout(() => {
        router.push("/dashboard");
        router.refresh();
      }, 1000);
    } catch (error) {
      toast.error(t("invalidCredentials"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRegister: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const protocol = host?.includes("localhost") ? "http" : "https";
      const redirectUrl = `${protocol}://${host}/api/auth/callback`;

      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          firstName: data.firstName,
          lastName: data.lastName,
          redirectTo: redirectUrl,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || t("signupFailed"));
      }

      reset();
      setStep("check-email");
    } catch (error: any) {
      toast.error(error?.message || t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const onForgotPassword: SubmitHandler<Inputs> = async (data) => {
    setIsSubmitting(true);
    try {
      const protocol = host?.includes("localhost") ? "http" : "https";
      const resetUrl = `${protocol}://${host}/login/reset-password`;

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          redirectTo: resetUrl,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.message || t("failedToSendResetLink"));
      }

      toast.success(t("resetLinkSent"));
      reset();
      setStep("sign-in");
    } catch (error: any) {
      toast.error(error?.message || t("genericError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const protocol = host?.includes("localhost") ? "http" : "https";
  const redirectUrl = `${protocol}://${host}/api/auth/callback`;

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (error) {
        toast.error(t("googleSignInError"));
      }
    } catch (error) {
      toast.error(t("googleSignInError"));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleBack = () => {
    reset();
    if (step === "sign-in" || step === "register") {
      setStep("email-options");
    } else if (step === "email-options") {
      setStep("initial");
    } else if (step === "forgot-password") {
      setStep("sign-in");
    }
  };

  const renderContent = () => {
    switch (step) {
      case "initial":
        return (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 inline-flex justify-center items-center gap-3 rounded-full bg-primary hover:bg-primary/90 hover:text-white text-white cursor-pointer border-none transition-colors"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading}
            >
              {isGoogleLoading ? (
                <div className="w-5 h-5 border-t-2 border-current rounded-full animate-spin" />
              ) : (
                <>
                  <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  </div>
                  <span>{t("continueWithGoogle")}</span>
                </>
              )}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center justify-center py-2">
              <div className="border-t border-gray-200 w-full"></div>
              <div className="absolute bg-white px-4">
                <span className="text-sm text-gray-400">{t("or")}</span>
              </div>
            </div>

            {/* Continue with Email */}
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 inline-flex justify-center items-center gap-3 rounded-full border border-gray-200 hover:bg-gray-100 bg-white text-black cursor-pointer transition-colors"
              onClick={() => setStep("email-options")}
            >
              <Mail className="w-5 h-5" />
              <span>{t("continueWithEmail")}</span>
            </Button>
          </div>
        );

      case "email-options":
        return (
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full py-6 inline-flex justify-center items-center gap-3 rounded-full border border-gray-200 hover:bg-gray-100 bg-white text-black font-medium cursor-pointer transition-colors"
              onClick={() => setStep("sign-in")}
            >
              {t("signIn")}
            </Button>
            <Button
              type="button"
              className="w-full py-6 inline-flex justify-center items-center gap-3 rounded-full bg-primary hover:bg-primary/90 text-white font-medium cursor-pointer"
              onClick={() => setStep("register")}
            >
              {t("register")}
            </Button>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("back")}</span>
            </button>
          </div>
        );

      case "sign-in":
        return (
          <>
            <form onSubmit={handleSubmit(onSignIn)} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                  {...register("email", {
                    required: t("emailRequired"),
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: t("emailInvalid"),
                    },
                  })}
                />
                {isSubmitted && errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                    {...register("password", {
                      required: t("passwordRequired"),
                      minLength: {
                        value: 6,
                        message: t("passwordMinLength"),
                      },
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
                {isSubmitted && errors.password && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.password.message}
                  </span>
                )}
              </div>
              <Button
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                type="submit"
              >
                {t("signInWithEmail")}
              </Button>
              <button
                type="button"
                onClick={() => {
                  reset();
                  setStep("forgot-password");
                }}
                className="block w-full text-center text-sm text-gray-500 hover:text-black transition-colors cursor-pointer"
              >
                {t("forgotPassword")}
              </button>
            </form>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors mt-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("back")}</span>
            </button>
          </>
        );

      case "register":
        return (
          <>
            <form onSubmit={handleSubmit(onRegister)} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={t("firstNamePlaceholder")}
                    className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                    {...register("firstName", {
                      required: t("firstNameRequired"),
                    })}
                  />
                  {isSubmitted && errors.firstName && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="text"
                    placeholder={t("lastNamePlaceholder")}
                    className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                    {...register("lastName", {
                      required: t("lastNameRequired"),
                    })}
                  />
                  {isSubmitted && errors.lastName && (
                    <span className="text-xs text-red-500 mt-1 block">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                  {...register("email", {
                    required: t("emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("emailInvalid"),
                    },
                  })}
                />
                {isSubmitted && errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder={t("passwordPlaceholder")}
                    className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                    {...register("password", {
                      required: t("passwordRequired"),
                      validate: validatePassword,
                      onChange: (e) => setRegisterPassword(e.target.value),
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
                {registerPassword && (
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
                        const passed = rule.test(registerPassword);
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
                              className={`text-[11px] ${
                                passed ? "text-gray-700" : "text-gray-400"
                              }`}
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
              <Button
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                type="submit"
              >
                {t("createAccount")}
              </Button>
            </form>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors mt-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("back")}</span>
            </button>
          </>
        );

      case "forgot-password":
        return (
          <>
            <div className="mb-4">
              <h2 className="text-lg font-medium text-black">
                {t("resetPasswordTitle")}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {t("resetPasswordSubtitle")}
              </p>
            </div>
            <form
              onSubmit={handleSubmit(onForgotPassword)}
              className="space-y-4"
            >
              <div>
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                  {...register("email", {
                    required: t("emailRequired"),
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: t("emailInvalid"),
                    },
                  })}
                />
                {isSubmitted && errors.email && (
                  <span className="text-xs text-red-500 mt-1 block">
                    {errors.email.message}
                  </span>
                )}
              </div>
              <Button
                isLoading={isSubmitting}
                disabled={isSubmitting}
                className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                type="submit"
              >
                {t("sendResetLink")}
              </Button>
            </form>
            <button
              type="button"
              onClick={handleBack}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors mt-4 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("back")}</span>
            </button>
          </>
        );

      case "check-email":
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-medium tracking-wide text-black">
                {t("confirmEmailTitle")}
              </h2>
            </div>
            <p className="text-sm text-gray-500 text-center">
              {t("confirmEmailSubtitle")}
            </p>
            <button
              type="button"
              onClick={() => setStep("sign-in")}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("backToSignIn")}</span>
            </button>
          </div>
        );

      case "confirming-email":
        return (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-gray-500 text-sm">{t("verifyingEmail")}</p>
          </div>
        );

      case "email-confirmed":
        return (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-medium tracking-wide text-black">
                {t("emailConfirmedTitle")}
              </h2>
            </div>
            <p className="text-sm text-gray-500 text-center">
              {t("emailConfirmedSubtitle")}
            </p>
            <Button
              className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
              onClick={() => {
                router.push("/dashboard");
                router.refresh();
              }}
            >
              {t("continueToDashboard")}
            </Button>
            <button
              type="button"
              onClick={() => setStep("sign-in")}
              className="w-full flex items-center justify-center gap-2 py-3 text-gray-600 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t("signInDifferentAccount")}</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Showcase (hidden on mobile) */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
        <LoginShowcase />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-white p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6">
            <a href="/">
              <Logo variant="black" width={160} height={40} sparkleSize={24} />
            </a>
            <p className="text-gray-500 text-sm mt-2 tracking-wide">
              {t("subtitle")}
            </p>
          </div>

          {/* Dynamic Content */}
          <div className="p-2">{renderContent()}</div>

          {/* Terms */}
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

          {/* Trust badges */}
          <div className="flex flex-col items-start gap-2 mt-6 text-gray-500 tracking-wide text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>{t("trustBadge1")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>{t("trustBadge2")}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-primary"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <span>{t("trustBadge3")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
