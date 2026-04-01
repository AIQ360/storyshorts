import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import type { NextRequest } from "next/server";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  
  // Skip i18n for API, dashboard, admin, login, documentation, and static assets
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/docs") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname.startsWith("/avatars") ||
    pathname.startsWith("/headshots") ||
    pathname.startsWith("/images") ||
    pathname.startsWith("/content") ||
    pathname.startsWith("/_pagefind") ||
    pathname.includes(".")
  ) {
    return await updateSession(request);
  }

  // Run Supabase session update to refresh auth cookies
  const supabaseResponse = await updateSession(request);

  // Run i18n middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // Copy Supabase auth cookies onto the i18n response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}
