import { Toaster as SonnerToaster } from "sonner";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/react";
import { Plus_Jakarta_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NextTopLoader from "nextjs-toploader";
import Script from "next/script";
import { InspectLock } from "@/components/ui/inspect-lock";
import { getLocale } from "next-intl/server";
import { RootProvider } from "fumadocs-ui/provider/next";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = {
  title: "Framecast AI — Professional AI Headshots",
  description:
    "Generate studio-quality AI headshots in minutes. Perfect for LinkedIn, resumes, and professional profiles.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://framecastai.com",
  ),
  openGraph: {
    title: "Framecast AI — Professional AI Headshots",
    description:
      "Generate studio-quality AI headshots in minutes. Perfect for LinkedIn, resumes, and professional profiles.",
    siteName: "Framecast AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Framecast AI — Professional AI Headshots",
    description:
      "Generate studio-quality AI headshots in minutes. Perfect for LinkedIn, resumes, and professional profiles.",
  },
};

const googleAnalyticsId = process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID;
const googleAnalyticsIdValue =
  process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID_VALUE;

export default async function RootLayout({ children }: any) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={jakarta.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== "undefined" && window.location.hostname === "localhost") {
                const originalError = console.error;
                console.error = function() {
                  if (typeof arguments[0] === "string" && arguments[0].includes("Encountered a script tag while rendering React component")) {
                    return;
                  }
                  originalError.apply(console, arguments);
                };
              }
            `,
          }}
        />
        {/* <!-- Google tag (gtag.js) --> */}
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="flex flex-col min-h-screen">
        <Script
          async
          src={googleAnalyticsId}
          strategy="afterInteractive"
        ></Script>
        <Script id="google-analytics" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${googleAnalyticsIdValue}');`}
        </Script>
        <RootProvider theme={{ defaultTheme: "light", forcedTheme: "light" }}>
          <InspectLock />
          <NextTopLoader color="#0025cc" height={5} showSpinner={false} />
          <Suspense
            fallback={
              <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between h-17.25" />
            }
          ></Suspense>
          <main className="grow items-center">
            {children}
            <SpeedInsights />
          </main>
          <SonnerToaster position="bottom-right" richColors />
          <Analytics />
        </RootProvider>
      </body>
    </html>
  );
}
