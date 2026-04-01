import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlignJustify,
  Sparkles,
  LayoutDashboard,
  CreditCard,
} from "lucide-react";
import Logo from "./logo";
import LanguageSelector from "./language-selector";
import { LogoutDropdownItem, LogoutMobileButton } from "./logout-button";
import { getLocale, getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";
const showDocs = process.env.NEXT_PUBLIC_SHOW_DOCS === "true";

export default async function Navbar() {
  const supabase = await createClient();
  const t = await getTranslations("Navbar");
  const locale = await getLocale();
  const pricingHref = `/${locale}#pricing`;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdmin = user?.user_metadata?.role === "admin";

  return (
    <nav className="sticky top-0 z-50 bg-white/70 backdrop-blur-md border-b border-gray-100">
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between px-4 lg:px-6 min-h-16">
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Logo />
        </Link>

        {/* Desktop nav links — same for both states */}
        <div className="hidden lg:flex items-center gap-1 ml-6">
          {showDocs && <NavLink href="/docs" label={t("documentation")} />}
          <NavLink href="/reviews" label={t("reviews")} />
          <NavLink href={pricingHref} label={t("pricing")} />
          <NavLink href="/refund" label={t("refunds")} />
        </div>

        <div className="flex-1" />

        {user ? (
          <>
            {/* Right side — logged in */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:block">
                <LanguageSelector />
              </div>
              <div className="hidden lg:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="relative h-9 w-9 rounded-full cursor-pointer focus:outline-none"
                      aria-label="Open user menu"
                    >
                      <Avatar className="h-9 w-9 bg-primary/10">
                        <AvatarImage
                          src={user.user_metadata.avatar_url}
                          alt={user.email || ""}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {user.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-64 rounded-xl p-0 overflow-hidden"
                    align="end"
                    forceMount
                  >
                    <DropdownMenuLabel className="font-normal px-4 py-3 bg-gray-50/80">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 shrink-0">
                          <AvatarImage
                            src={user.user_metadata.avatar_url}
                            alt={user.email || ""}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium leading-none text-black truncate">
                            {user.user_metadata.full_name ||
                              user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground mt-1 truncate">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="p-1">
                      <DropdownMenuItem asChild>
                        <Link
                          href={isAdmin ? "/admin" : "/dashboard"}
                          className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                        >
                          <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {isAdmin ? t("adminDashboard") : t("dashboard")}
                          </span>
                        </Link>
                      </DropdownMenuItem>
                      {stripeIsConfigured && !isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link
                            href="/dashboard/billing"
                            className="flex items-center gap-2.5 px-3 py-2 cursor-pointer"
                          >
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>{t("billing")}</span>
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </div>
                    <DropdownMenuSeparator className="m-0" />
                    <div className="p-1">
                      <LogoutDropdownItem />
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Mobile hamburger — logged in */}
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="p-1.5 cursor-pointer"
                      aria-label="Open navigation menu"
                    >
                      <AlignJustify className="h-6 w-6 text-gray-600" />
                    </button>
                  </SheetTrigger>
                  <SheetContent className="flex flex-col">
                    <SheetTitle className="sr-only">
                      {t("navigationMenu")}
                    </SheetTitle>
                    <SheetHeader>
                      {/* User info */}
                      <div className="flex items-center gap-3 mt-8 pb-5 border-b border-gray-100 w-full">
                        <Avatar className="h-10 w-10 shrink-0">
                          <AvatarImage
                            src={user.user_metadata.avatar_url}
                            alt={user.email || ""}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {user.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <p className="text-sm font-medium text-black truncate text-left">
                            {user.user_metadata.full_name ||
                              user.email?.split("@")[0]}
                          </p>
                          <p className="text-xs text-muted-foreground truncate text-left">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </SheetHeader>

                    {/* Nav links */}
                    <nav className="flex flex-col w-full text-[15px] flex-1">
                      <MobileSheetLink
                        href={isAdmin ? "/admin" : "/dashboard"}
                        label={isAdmin ? t("adminDashboard") : t("dashboard")}
                      />
                      {stripeIsConfigured && !isAdmin && (
                        <MobileSheetLink
                          href="/dashboard/billing"
                          label={t("billing")}
                        />
                      )}
                      {showDocs && (
                        <MobileSheetLink
                          href="/docs"
                          label={t("documentation")}
                        />
                      )}
                      <MobileSheetLink href="/reviews" label={t("reviews")} />
                      <MobileSheetLink
                        href={pricingHref}
                        label={t("pricing")}
                      />
                      <MobileSheetLink href="/refund" label={t("refunds")} />
                    </nav>

                    {/* Bottom section */}
                    <div className="border-t border-gray-100 pt-4 pb-2 space-y-3">
                      <LanguageSelector mode="inline" />
                      <LogoutMobileButton />
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Right side — logged out (desktop) */}
            <div className="hidden lg:flex items-center gap-3">
              <LanguageSelector />
              <Link
                href="/login"
                className="h-10 px-5 rounded-full font-semibold text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors inline-flex items-center"
              >
                {t("login")}
              </Link>
              <Link
                href="/login"
                className="h-10 px-5 rounded-full font-semibold text-sm text-white bg-primary hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                {t("getYourHeadshots")}
                <Sparkles className="h-4 w-4" />
              </Link>
            </div>

            {/* Mobile — logged out */}
            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/login"
                className="h-9 px-4 rounded-full font-semibold text-sm text-white bg-primary hover:brightness-110 transition-all inline-flex items-center gap-1.5"
              >
                {t("start")}
                <Sparkles className="h-3.5 w-3.5" />
              </Link>
              <Sheet>
                <SheetTrigger asChild>
                  <button
                    className="p-1.5 cursor-pointer"
                    aria-label="Open navigation menu"
                  >
                    <AlignJustify className="h-6 w-6 text-gray-400" />
                  </button>
                </SheetTrigger>
                <SheetContent className="flex flex-col">
                  <SheetTitle className="sr-only">
                    {t("navigationMenu")}
                  </SheetTitle>
                  <SheetHeader className="mt-8 pb-0" />

                  {/* Nav links */}
                  <nav className="flex flex-col w-full text-[15px] flex-1">
                    {showDocs && (
                      <MobileSheetLink
                        href="/docs"
                        label={t("documentation")}
                      />
                    )}
                    <MobileSheetLink href="/reviews" label={t("reviews")} />
                    <MobileSheetLink href={pricingHref} label={t("pricing")} />
                    <MobileSheetLink href="/refund" label={t("refunds")} />
                  </nav>

                  {/* Bottom section */}
                  <div className="border-t border-gray-100 pt-4 pb-2 space-y-3">
                    <LanguageSelector mode="inline" />
                    <Link
                      href="/login"
                      className="w-full h-10 rounded-full flex items-center justify-center gap-2 text-sm font-semibold text-white bg-primary hover:brightness-110 transition-all"
                    >
                      {t("getYourHeadshots")}
                      <Sparkles className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="h-10 px-4 inline-flex items-center justify-center rounded-full text-sm font-semibold text-black hover:bg-gray-100 cursor-pointer transition-colors"
    >
      {label}
    </Link>
  );
}

function MobileSheetLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 py-3.5 border-b border-gray-100 text-black hover:text-primary transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
