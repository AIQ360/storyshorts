"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import axios from "axios";
import Script from "next/script";
import { toast } from "sonner";
import { useFlutterwave, closePaymentModal } from "flutterwave-react-v3";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTranslations } from "next-intl";
import type { BillingPackage } from "@/lib/credits";

type PendingPayment = {
  gateway: "flutterwave" | "razorpay";
  pkg: BillingPackage;
};

type StylePackClass = {
  credits_per_image?: number;
};

type StylePack = {
  classes?: StylePackClass[];
};

const ACCENT_COLORS = [
  { accent: "text-gray-500", checkColor: "text-gray-500" },
  { accent: "text-[#2b5fff]", checkColor: "text-[#2b5fff]" },
  { accent: "text-sky-500", checkColor: "text-sky-500" },
];

const CheckIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={`w-5 h-5 shrink-0 ${className}`}
  >
    <path
      fillRule="evenodd"
      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
      clipRule="evenodd"
    />
  </svg>
);

export default function BillingContent({
  userId,
  userEmail,
  userName,
  currentCredits,
  packages,
  creditValue,
  profitMargin,
  aiModelCredits,
  testMode = false,
}: {
  userId: string;
  userEmail: string;
  userName: string;
  currentCredits: number;
  packages: BillingPackage[];
  creditValue: number;
  profitMargin: number;
  aiModelCredits: number;
  testMode?: boolean;
}) {
  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [styleImageCreditRange, setStyleImageCreditRange] = useState<{
    min: number;
    max: number;
  } | null>(null);
  const [pendingPayment, setPendingPayment] = useState<PendingPayment | null>(
    null,
  );
  const d = useTranslations("Dashboard");

  const selectedPkg = selectedIndex !== null ? packages[selectedIndex] : null;

  useEffect(() => {
    let isMounted = true;

    const fetchStyleRange = async () => {
      try {
        const response = await fetch("/api/astria/packs");
        if (!response.ok) return;

        const data = (await response.json()) as StylePack[];
        if (!Array.isArray(data)) return;

        const values = data
          .flatMap((pack) => pack.classes || [])
          .map((cls) => Number(cls.credits_per_image || 0))
          .filter((value) => Number.isFinite(value) && value > 0);

        if (!isMounted || values.length === 0) return;

        setStyleImageCreditRange({
          min: Math.min(...values),
          max: Math.max(...values),
        });
      } catch {
        // Keep fallback values if pack data fails to load.
      }
    };

    fetchStyleRange();

    return () => {
      isMounted = false;
    };
  }, []);

  const margin = Math.min(Math.max(profitMargin || 0, 0), 0.99);
  const cv = Math.max(creditValue || 0.1, 0.000001);

  const editCreditsPerActionRange = useMemo(() => {
    const minApiCost = 0.045;
    const maxApiCost = 0.24;
    const minCredits = Math.max(1, Math.ceil(minApiCost / (1 - margin) / cv));
    const maxCredits = Math.max(1, Math.ceil(maxApiCost / (1 - margin) / cv));
    return { min: minCredits, max: maxCredits };
  }, [cv, margin]);

  const estimateStyleHeadshots = (credits: number) => {
    if (!styleImageCreditRange) return null;
    return {
      min: Math.floor(credits / styleImageCreditRange.max),
      max: Math.floor(credits / styleImageCreditRange.min),
    };
  };

  const estimateEdits = (credits: number) => ({
    min: Math.floor(credits / editCreditsPerActionRange.max),
    max: Math.floor(credits / editCreditsPerActionRange.min),
  });

  const normalizeBadge = (value?: string) =>
    (value || "").trim().toLowerCase().replace(/\s+/g, " ");

  // Stripe checkout
  const handleStripe = async (pkg: BillingPackage) => {
    setLoadingMethod("stripe");
    try {
      const res = await axios.post("/api/payment-gateways/stripe", {
        amount: pkg.price,
        credits: pkg.credits,
        planName: pkg.name,
        userId,
      });
      window.location.href = res.data.url;
    } catch {
      toast.error(d("failedCheckoutStripe"));
    } finally {
      setLoadingMethod(null);
    }
  };

  // PayPal checkout
  const handlePaypal = async (pkg: BillingPackage) => {
    setLoadingMethod("paypal");
    try {
      const res = await axios.post(
        "/api/payment-gateways/paypal/create-order",
        {
          amount: pkg.price,
          credits: pkg.credits,
          userId,
          planName: pkg.name,
        },
      );
      window.location.href = res.data.url;
    } catch {
      toast.error(d("failedCheckoutPaypal"));
    } finally {
      setLoadingMethod(null);
    }
  };

  // ─── Flutterwave (useFlutterwave hook) ───
  // Config updates reactively when pendingPayment changes so the hook
  // returns a fresh payment function with the correct amount/description.
  const flutterwaveConfig = {
    public_key: process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY || "",
    tx_ref: `FW_${Date.now()}`,
    amount:
      pendingPayment?.gateway === "flutterwave" ? pendingPayment.pkg.price : 1,
    currency: "USD",
    payment_options: "card,mobilemoney,ussd",
    customer: {
      email: userEmail,
      name: userName,
      phone_number: "",
    },
    customizations: {
      title: "Framecast AI",
      description:
        pendingPayment?.gateway === "flutterwave"
          ? `${pendingPayment.pkg.credits} credit(s) — ${pendingPayment.pkg.name}`
          : "Credit purchase",
      logo: "",
    },
  };

  const handleFlutterwavePayment = useFlutterwave(flutterwaveConfig);
  const flutterwavePaymentRef = useRef(handleFlutterwavePayment);
  flutterwavePaymentRef.current = handleFlutterwavePayment;

  const handleFlutterwaveVerify = useCallback(
    async (transactionId: number, pkg: BillingPackage) => {
      try {
        const verification = await axios.post(
          "/api/payment-gateways/flutterwave/verify",
          {
            transactionId: String(transactionId),
            userId,
            credits: pkg.credits,
            amount: pkg.price,
            currency: "usd",
          },
        );
        if (verification.data.isOk) {
          toast.success(d("paymentSuccess"));
          setTimeout(() => window.location.reload(), 1500);
        } else {
          toast.error(d("verificationFailed"));
        }
      } catch {
        toast.error(d("verificationFailed"));
      } finally {
        setLoadingMethod(null);
      }
    },
    [userId, d],
  );

  // ─── Razorpay ───
  const handleRazorpay = useCallback(
    async (pkg: BillingPackage) => {
      setLoadingMethod("razorpay");
      try {
        const { data } = await axios.post(
          "/api/payment-gateways/razorpay/order",
          { amount: pkg.price, currency: "USD", credits: pkg.credits, userId },
        );
        if (!data?.orderId) {
          toast.error(d("failedCreateOrder"));
          setLoadingMethod(null);
          return;
        }

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: pkg.price * 100,
          currency: "USD",
          name: d("razorpayName"),
          description:
            pkg.credits !== 1
              ? d("razorpayDescriptionPlural", { credits: pkg.credits })
              : d("razorpayDescription", { credits: pkg.credits }),
          order_id: data.orderId,
          handler: async (response: any) => {
            try {
              const verification = await axios.post(
                "/api/payment-gateways/razorpay/verify",
                {
                  orderCreationId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  userId,
                  credits: pkg.credits,
                  amount: pkg.price,
                  currency: "usd",
                },
              );
              if (verification.data.isOk) {
                toast.success(d("paymentSuccess"));
                setTimeout(() => window.location.reload(), 1500);
              } else {
                toast.error(d("verificationFailed"));
              }
            } catch {
              toast.error(d("verificationFailed"));
            }
          },
          prefill: { name: userName, email: userEmail },
          theme: { color: "#0025cc" },
        };

        const paymentObject = new (window as any).Razorpay(options);
        paymentObject.on("payment.failed", (res: any) =>
          toast.error(res.error?.description || "Payment failed."),
        );
        paymentObject.open();
        setLoadingMethod(null);
      } catch {
        toast.error(d("failedProcessPayment"));
        setLoadingMethod(null);
      }
    },
    [userId, userName, userEmail, d],
  );

  // ─── Deferred modal payments ───
  // Close our AlertDialog FIRST, then open the 3rd-party modal after a
  // brief delay so Radix's focus-trap is fully unmounted and won't block it.
  useEffect(() => {
    if (!pendingPayment) return;

    const timer = setTimeout(() => {
      const { gateway, pkg } = pendingPayment;

      if (gateway === "flutterwave") {
        setLoadingMethod("flutterwave");
        flutterwavePaymentRef.current({
          callback: (response) => {
            closePaymentModal();
            if (
              response.status === "successful" ||
              response.status === "completed"
            ) {
              handleFlutterwaveVerify(response.transaction_id, pkg);
            } else {
              toast.error(d("failedProcessPayment"));
              setLoadingMethod(null);
            }
          },
          onClose: () => {
            setLoadingMethod(null);
          },
        });
      } else if (gateway === "razorpay") {
        handleRazorpay(pkg);
      }

      setPendingPayment(null);
    }, 250);

    return () => clearTimeout(timer);
  }, [pendingPayment, handleFlutterwaveVerify, handleRazorpay, d]);

  // When user clicks Flutterwave / Razorpay in the dialog we close our
  // dialog first and queue the 3rd-party modal via pendingPayment state.
  const handleDeferredPayment = (
    gateway: "flutterwave" | "razorpay",
    pkg: BillingPackage,
  ) => {
    setSelectedIndex(null); // close our AlertDialog
    setPendingPayment({ gateway, pkg }); // queue 3rd-party modal
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black">
              {d("billingTitle")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {d("youCurrentlyHave")}{" "}
              <span className="font-semibold text-black">{currentCredits}</span>{" "}
              {currentCredits !== 1 ? d("creditPlural") : d("credit")}
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div
          className={`grid grid-cols-1 gap-6 max-w-5xl ${
            packages.length === 1
              ? "md:grid-cols-1 max-w-sm"
              : packages.length === 2
                ? "sm:grid-cols-2 max-w-2xl"
                : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {packages.map((pkg, index) => {
            const colors = ACCENT_COLORS[index % ACCENT_COLORS.length];
            const badgeText = pkg.badge || "";
            const normalizedBadge = normalizeBadge(badgeText);
            const isPopular =
              pkg.featured ||
              normalizedBadge === "82% choose this" ||
              normalizedBadge === "most popular";

            const aiModels =
              aiModelCredits > 0 ? Math.floor(pkg.credits / aiModelCredits) : 0;
            const modelHeadshotsMin = aiModels * 8;
            const modelHeadshotsMax = aiModels * 16;
            const styleHeadshots = estimateStyleHeadshots(pkg.credits);
            const edits = estimateEdits(pkg.credits);
            const turnaround =
              index < 2 ? d("oneHourTurnaround") : d("thirtyMinTurnaround");

            const cardSubtitle = d("billingGetHeadshotsSubtitle", {
              min: modelHeadshotsMin,
              max: modelHeadshotsMax,
            });
            return (
              <div
                key={pkg.id}
                className={`relative bg-white rounded-xl ${
                  isPopular
                    ? "border-2 border-[#2b5fff]/30 shadow-lg"
                    : "shadow-[0_0px_75px_0px_rgba(0,0,0,0.07)] border-2 border-sky-200"
                }`}
              >
                {/* Badge */}
                {(badgeText || isPopular) && (
                  <div className="absolute inset-x-0 top-0 translate-y-px transform">
                    <div className="flex -translate-y-1/2 transform justify-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide text-white ${
                          isPopular
                            ? "bg-linear-to-r from-[#0025cc] to-[#2b5fff]"
                            : "bg-linear-to-r from-sky-400 to-blue-500"
                        }`}
                      >
                        {badgeText || d("billingMostPopular")}
                      </span>
                    </div>
                  </div>
                )}

                <div className="px-5 pb-2 pt-5">
                  <h3 className="text-sm font-medium leading-6 tracking-[-0.2px] text-gray-600">
                    {pkg.name}
                  </h3>
                  <p className="mt-4 flex items-end gap-2 text-[32px] sm:text-[40px] leading-6 tracking-[-0.2px] text-gray-800">
                    <span className="font-bold">${pkg.price.toFixed(2)}</span>
                    <span className="text-sm font-medium text-gray-600 leading-none">
                      {d("billingOneTime")}
                    </span>
                  </p>
                  <p className="mt-6 text-sm font-medium leading-5 tracking-[-0.3px] text-gray-600">
                    {cardSubtitle}
                  </p>
                </div>

                <div className="space-y-4 px-5 pb-5 pt-4">
                  <h4 className="text-sm font-semibold text-gray-800 mb-3">
                    {d("everyPhotoshootIncludes")}
                  </h4>
                  <ul className="space-y-2.5 text-sm font-medium leading-4 text-gray-700">
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <div className="inline-flex items-center gap-1 group relative">
                        <span>
                          <span className="font-semibold">{pkg.credits}</span>{" "}
                          {pkg.credits !== 1 ? d("creditPlural") : d("credit")}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="w-4 h-4 text-gray-500 cursor-help shrink-0"
                        >
                          <path
                            fillRule="evenodd"
                            d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-6 3.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM7.293 5.293a1 1 0 1 1 .99 1.667c-.459.134-1.033.566-1.033 1.29v.25a.75.75 0 1 0 1.5 0v-.115a2.5 2.5 0 1 0-2.518-4.153.75.75 0 1 0 1.061 1.06Z"
                            clipRule="evenodd"
                          ></path>
                        </svg>
                        <div className="absolute text-xs bottom-full left-0 mb-3 w-48 sm:w-64 px-3 sm:px-4 py-2.5 sm:py-3 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-normal z-50">
                          {d("billingCreditsTooltip")}
                        </div>
                      </div>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <span>
                        <span className="font-semibold">{aiModels}</span>{" "}
                        {d("billingAiModels")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      {styleHeadshots ? (
                        <span>
                          <span className="font-semibold">
                            {styleHeadshots.min}-{styleHeadshots.max}
                          </span>{" "}
                          {d("billingEstimatedStyleHeadshots")}
                        </span>
                      ) : (
                        <span>{d("billingEstimatedStyleHeadshots")}</span>
                      )}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <span>
                        <span className="font-semibold">
                          {edits.min}-{edits.max}
                        </span>{" "}
                        {d("billingEstimatedAiEdits")}
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <span>{d("billingCustomizedBackgrounds")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <span>{d("billingCustomizedOutfits")}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckIcon className={colors.checkColor} />
                      <span>{turnaround}</span>
                    </li>
                  </ul>

                  <div className="pt-2">
                    <button
                      className={`flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 cursor-pointer gap-2 ${
                        isPopular
                          ? "bg-[#0025cc] hover:bg-[#0025cc]/90 text-white"
                          : "bg-white hover:bg-gray-50 text-gray-700 shadow-sm ring-1 ring-gray-200"
                      }`}
                      onClick={() => setSelectedIndex(index)}
                    >
                      {d("buyNow")}
                      {isPopular && <Sparkles className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Payment Method AlertDialog */}
        <AlertDialog
          open={selectedIndex !== null}
          onOpenChange={(open) => {
            if (!open) setSelectedIndex(null);
          }}
        >
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>{d("choosePaymentMethod")}</AlertDialogTitle>
              <AlertDialogDescription>
                {selectedPkg && (
                  <>
                    <span className="font-semibold text-black">
                      {selectedPkg.name}
                    </span>{" "}
                    — ${selectedPkg.price.toFixed(2)} for {selectedPkg.credits}{" "}
                    {selectedPkg.credits !== 1
                      ? d("creditPlural")
                      : d("credit")}
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex flex-col gap-3 py-2">
              {/* Stripe */}
              <button
                className="flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 cursor-pointer gap-2 bg-[#0025cc] hover:bg-[#0025cc]/90 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => selectedPkg && handleStripe(selectedPkg)}
                disabled={loadingMethod === "stripe"}
              >
                {loadingMethod === "stripe" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {d("processing")}
                  </>
                ) : (
                  d("payWithStripe")
                )}
              </button>

              {/* PayPal */}
              {process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID && (
                <button
                  className="flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 cursor-pointer bg-[#ffc439] hover:bg-[#f0b929] text-[#003087] disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => selectedPkg && handlePaypal(selectedPkg)}
                  disabled={loadingMethod === "paypal"}
                >
                  {loadingMethod === "paypal" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {d("processing")}
                    </>
                  ) : (
                    d("payWithPayPal")
                  )}
                </button>
              )}

              {/* Flutterwave */}
              {process.env.NEXT_PUBLIC_FLUTTERWAVE_PUBLIC_KEY && (
                <button
                  className="flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 cursor-pointer bg-[#F5A623] hover:bg-[#e6991a] text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    selectedPkg &&
                    handleDeferredPayment("flutterwave", selectedPkg)
                  }
                  disabled={loadingMethod === "flutterwave"}
                >
                  {loadingMethod === "flutterwave" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {d("processing")}
                    </>
                  ) : (
                    d("payWithFlutterwave")
                  )}
                </button>
              )}

              {/* Razorpay */}
              {process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID && (
                <button
                  className="flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all duration-150 cursor-pointer bg-white hover:bg-gray-50 text-gray-700 shadow-sm ring-1 ring-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() =>
                    testMode
                      ? toast.info(d("razorpayDisabledToast"))
                      : selectedPkg &&
                        handleDeferredPayment("razorpay", selectedPkg)
                  }
                  disabled={!testMode && loadingMethod === "razorpay"}
                >
                  {!testMode && loadingMethod === "razorpay" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {d("processing")}
                    </>
                  ) : (
                    d("payWithRazorpay")
                  )}
                </button>
              )}
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-full">
                {d("cancel")}
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
