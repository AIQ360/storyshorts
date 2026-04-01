import Login from "../login/page";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser } from "@/lib/admin";
import DashboardShell from "./components/dashboard-shell";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";
import { getPlatformConfig } from "@/lib/credits";

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Login />;
  }

  if (isAdminUser(user)) {
    redirect("/admin");
  }

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale =
    localeCookie && routing.locales.includes(localeCookie as any)
      ? localeCookie
      : routing.defaultLocale;

  const messages = (await import(`@/messages/${locale}.json`)).default;

  const dashboardUser = {
    email: user.email || "",
    fullName:
      user.user_metadata?.full_name ||
      [user.user_metadata?.first_name, user.user_metadata?.last_name]
        .filter(Boolean)
        .join(" ") ||
      "",
    avatarUrl: user.user_metadata?.avatar_url || undefined,
  };

  const config = await getPlatformConfig().catch(() => null);
  const testMode = config?.astria_test_mode ?? false;

  const { data: creditData } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  const credits = creditData?.credits ?? 0;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DashboardShell
        user={dashboardUser}
        testMode={testMode}
        credits={credits}
      >
        {children}
      </DashboardShell>
    </NextIntlClientProvider>
  );
}
