import { createClient } from "@/lib/supabase/server";
import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Login } from "./components/login-form";
import { NextIntlClientProvider } from "next-intl";
import { routing } from "@/i18n/routing";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const headersList = await headers();
  const host = headersList.get("host");

  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  // Detect locale from cookie or default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale =
    localeCookie && routing.locales.includes(localeCookie as any)
      ? localeCookie
      : routing.defaultLocale;

  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col flex-1 w-full">
        <Login host={host} searchParams={resolvedSearchParams} />
      </div>
    </NextIntlClientProvider>
  );
}
