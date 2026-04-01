"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  PanelLeft,
  LogOut,
  Loader2,
  Sparkles,
  MoreVertical,
  Wand2,
  CoinsIcon,
  ChevronRight,
  Settings,
  CreditCard,
  LifeBuoy,
  FlaskConical,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Logo from "../../components/logo";
import LanguageSelector from "../../components/language-selector";
import { Suspense } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type DashboardUser = {
  email: string;
  fullName: string;
  avatarUrl?: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  user: DashboardUser;
  testMode?: boolean;
  credits?: number;
};

function SidebarNavLink({
  href,
  label,
  icon: Icon,
  isActive,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-primary/5",
        isActive && "bg-primary/5 text-primary font-medium",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

function CollapsibleSection({
  id,
  title,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  title: string;
  isOpen: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex items-center w-full mb-1 px-3 py-1 text-xs font-semibold uppercase text-muted-foreground/80 tracking-wider hover:text-muted-foreground transition-colors cursor-pointer"
      >
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="mr-1.5"
        >
          <ChevronRight className="h-3 w-3" />
        </motion.span>
        {title}
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key={id}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <div className="space-y-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DashboardShell({
  children,
  user,
  testMode = false,
  credits = 0,
}: DashboardShellProps) {
  const pathname = usePathname();
  const t = useTranslations("Navbar");
  const d = useTranslations("Dashboard");
  const [liveCredits, setLiveCredits] = useState(credits);
  const [showTestModeDialog, setShowTestModeDialog] = useState(testMode);
  const [loggingOut, setLoggingOut] = useState(false);

  // Keep sidebar credits in sync via Supabase realtime
  useEffect(() => {
    setLiveCredits(credits);
  }, [credits]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("sidebar-credits")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "credits" },
        (payload: any) => {
          if (typeof payload.new?.credits === "number") {
            setLiveCredits(payload.new.credits);
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const DashboardLoader = () => (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-3 border-gray-200 animate-spin border-t-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-black">{d("loading")}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {d("pleaseWait")}
          </p>
        </div>
      </div>
    </div>
  );

  const [greeting, setGreeting] = useState("");
  const [openSections, setOpenSections] = useState<string[]>([
    "home",
    "ai-tools",
    "account",
  ]);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  useEffect(() => {
    const firstName =
      user.fullName?.split(" ")[0] || user.email?.split("@")[0] || "there";
    const hour = new Date().getHours();
    if (hour < 5) setGreeting(`${d("greetingNight")}, ${firstName}`);
    else if (hour < 12) setGreeting(`${d("greetingMorning")}, ${firstName}`);
    else if (hour < 18) setGreeting(`${d("greetingAfternoon")}, ${firstName}`);
    else setGreeting(`${d("greetingEvening")}, ${firstName}`);
  }, [user]);

  const initials = (() => {
    const parts = user.fullName?.split(" ");
    if (parts && parts.length >= 2)
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (user.email?.[0] || "U").toUpperCase();
  })();

  const isActivePath = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      <CollapsibleSection
        id="home"
        title={d("sectionHome")}
        isOpen={openSections.includes("home")}
        onToggle={toggleSection}
      >
        <SidebarNavLink
          href="/dashboard"
          label={d("overview")}
          icon={Home}
          isActive={isActivePath("/dashboard")}
        />
        <SidebarNavLink
          href="/dashboard/create-headshots"
          label={d("createHeadshots")}
          icon={Sparkles}
          isActive={isActivePath("/dashboard/create-headshots")}
        />
      </CollapsibleSection>

      <div className="mt-4">
        <CollapsibleSection
          id="ai-tools"
          title={d("sectionAiTools")}
          isOpen={openSections.includes("ai-tools")}
          onToggle={toggleSection}
        >
          <SidebarNavLink
            href="/dashboard/magic-editor"
            label={d("magicEditor")}
            icon={Wand2}
            isActive={isActivePath("/dashboard/magic-editor")}
          />
        </CollapsibleSection>
      </div>

      <div className="mt-4">
        <CollapsibleSection
          id="account"
          title={d("sectionAccount")}
          isOpen={openSections.includes("account")}
          onToggle={toggleSection}
        >
          <SidebarNavLink
            href="/dashboard/settings"
            label={d("settings")}
            icon={Settings}
            isActive={isActivePath("/dashboard/settings")}
          />
          <a
            href="mailto:hello@jerrizz.com"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-all hover:text-primary hover:bg-primary/5"
          >
            <LifeBuoy className="h-4 w-4" />
            {d("getHelp")}
          </a>
        </CollapsibleSection>
      </div>
    </>
  );

  const UserDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto px-2 py-2.5 text-left hover:bg-gray-50 cursor-pointer"
        >
          <div className="flex items-center min-w-0">
            <Avatar className="h-8 w-8 mr-2.5 shrink-0">
              <AvatarImage src={user.avatarUrl} alt={user.fullName || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-black truncate">
                {user.fullName || user.email?.split("@")[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate -mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side="right"
        className="w-56 mb-2 border-gray-200/60"
      >
        <DropdownMenuLabel className="px-2 py-2 font-normal">
          <div className="flex items-center gap-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={user.avatarUrl} alt={user.fullName || "User"} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-medium text-black truncate">
                {user.fullName || user.email?.split("@")[0]}
              </span>
              <span className="text-xs text-muted-foreground truncate -mt-0.5">
                {user.email}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/settings"
            className="flex items-center w-full cursor-pointer"
          >
            <Settings className="mr-2 h-4 w-4" /> {d("settings")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href="/dashboard/billing"
            className="flex items-center w-full cursor-pointer"
          >
            <CreditCard className="mr-2 h-4 w-4" /> {d("billing")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={loggingOut}
          onSelect={(e) => {
            e.preventDefault();
            setLoggingOut(true);
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "/api/auth/sign-out";
            document.body.appendChild(form);
            form.submit();
          }}
          className="cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-700"
        >
          {loggingOut ? (
            <Loader2 className="mr-0.5 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-0.5 h-4 w-4" />
          )}
          {t("logOut")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const astriaTestMode = testMode;

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-10 hidden w-65 flex-col border-r border-gray-200/60 bg-white md:flex">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200/60 px-4 shrink-0">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo width={130} height={130} sparkleSize={22} />
          </Link>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          <div className="flex-1 overflow-y-auto">
            <nav className="px-3 py-4 space-y-1 pb-6">{sidebarContent}</nav>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none z-10" />
        </div>

        {/* User dropdown at bottom */}
        <div className="p-3 border-t border-gray-200/60 space-y-2">
          <LanguageSelector variant="light" showLabel />
          <div className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white shadow-sm px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <CoinsIcon className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="text-xs font-medium text-muted-foreground">
                {d("credits")}
              </span>
            </div>
            <span className="text-sm font-semibold text-black">
              {liveCredits}
            </span>
          </div>
          <UserDropdown />
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            &copy; {new Date().getFullYear()} Framecast AI
          </p>
        </div>
      </aside>

      <div className="flex flex-col md:pl-65">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200/60 bg-white/80 backdrop-blur-md px-4 md:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="md:hidden cursor-pointer rounded-full"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">{d("toggleMenu")}</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-65 p-0 flex flex-col">
              <SheetTitle className="sr-only">{d("dashboardMenu")}</SheetTitle>
              <div className="flex h-16 items-center border-b border-gray-200/60 px-4 shrink-0">
                <Link href="/" className="flex items-center gap-2.5">
                  <Logo width={130} height={130} sparkleSize={22} />
                </Link>
              </div>
              <div className="flex-1 overflow-hidden flex flex-col relative">
                <div className="flex-1 overflow-y-auto">
                  <nav className="px-3 py-4 space-y-1 pb-6">
                    {sidebarContent}
                  </nav>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-linear-to-t from-white to-transparent pointer-events-none z-10" />
              </div>
              <div className="p-3 border-t border-gray-200/60 space-y-2">
                <LanguageSelector mode="inline" />
                <div className="flex items-center justify-between rounded-xl border border-gray-200/60 bg-white shadow-sm px-3 py-2.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <CoinsIcon className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="text-xs font-medium text-muted-foreground">
                      {d("credits")}
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-black">
                    {liveCredits}
                  </span>
                </div>
                <UserDropdown />
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  &copy; {new Date().getFullYear()} Framecast AI
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold md:text-xl text-black truncate">
                {greeting}
              </h1>
              {astriaTestMode && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-0.5 shrink-0">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span className="text-[11px] font-medium text-amber-700">
                    {d("testMode")}
                  </span>
                </span>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/dashboard/billing">
            <Button className="rounded-full bg-[#0025cc] hover:bg-[#0025cc]/90 text-white font-semibold text-sm px-3 md:px-5 gap-2 cursor-pointer">
              <CoinsIcon className="h-4 w-4" />
              <span className="hidden md:inline">{d("buyMoreCredits")}</span>
            </Button>
          </Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
          <Suspense fallback={<DashboardLoader />}>{children}</Suspense>
        </main>
      </div>

      {/* Test Mode Alert Dialog */}
      <AlertDialog
        open={showTestModeDialog}
        onOpenChange={setShowTestModeDialog}
      >
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                <FlaskConical className="h-5 w-5 text-amber-600" />
              </div>
              <AlertDialogTitle className="text-lg">
                {d("testModeDialogTitle")}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {d("testModeDialogDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="rounded-xl bg-amber-50/60 border border-amber-200/40 p-4 space-y-2">
            <p className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">
              {d("testModeDialogWhatChanges")}
            </p>
            <ul className="space-y-1.5 text-xs text-amber-800/80">
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {d("testModeDialogBullet1")}
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {d("testModeDialogBullet2")}
              </li>
              <li className="flex items-start gap-2">
                <span className="h-1 w-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                {d("testModeDialogBullet3")}
              </li>
            </ul>
          </div>
          <AlertDialogFooter>
            <Button
              onClick={() => setShowTestModeDialog(false)}
              className="rounded-full bg-amber-500 hover:bg-amber-600 text-white font-semibold cursor-pointer"
            >
              {d("testModeDialogDismiss")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
