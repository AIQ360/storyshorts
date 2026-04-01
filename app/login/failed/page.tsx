import { LoginFail } from "./components/login-fail";
import { NextIntlClientProvider } from "next-intl";
import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

export default async function Page({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const errorCode = searchParams?.err;

  const cookieStore = await cookies();
  const localeCookie = cookieStore.get("NEXT_LOCALE")?.value;
  const locale =
    localeCookie && routing.locales.includes(localeCookie as any)
      ? localeCookie
      : routing.defaultLocale;
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex flex-col flex-1 w-full h-[calc(100vh-73px)]">
        <LoginFail
          errorCode={typeof errorCode === "string" ? errorCode : undefined}
        />
      </div>
    </NextIntlClientProvider>
  );
}
