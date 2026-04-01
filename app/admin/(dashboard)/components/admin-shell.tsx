"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  PanelLeft,
  LogOut,
  Loader2,
  Settings,
  Shield,
  ChevronRight,
  AlertTriangle,
  DollarSign,
  CreditCard,
  Users,
  Mail,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Logo from "@/app/components/logo";
import { Suspense } from "react";

type AdminUser = {
  email: string;
  fullName: string;
  isDefaultCredentials: boolean;
  isTestAdmin: boolean;
};

type AdminShellProps = {
  children: React.ReactNode;
  admin: AdminUser;
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

export default function AdminShell({ children, admin }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [openSections, setOpenSections] = useState<string[]>([
    "overview",
    "platform",
    "account",
  ]);
  const [hasShownDefaultWarning, setHasShownDefaultWarning] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const toggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId],
    );
  };

  // Show default credentials warning toast
  useEffect(() => {
    if (
      admin.isDefaultCredentials &&
      !admin.isTestAdmin &&
      !hasShownDefaultWarning
    ) {
      setHasShownDefaultWarning(true);
      toast.warning(
        "You're using default credentials. Please change them from Settings for security.",
        {
          duration: 8000,
          action: {
            label: "Go to Settings",
            onClick: () => router.push("/admin/settings"),
          },
        },
      );
    }
  }, [admin.isDefaultCredentials, hasShownDefaultWarning, router]);

  const initials = (() => {
    const parts = admin.fullName?.split(" ");
    if (parts && parts.length >= 2)
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return (admin.email?.[0] || "A").toUpperCase();
  })();

  const isActivePath = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const AdminLoader = () => (
    <div className="flex min-h-screen w-full items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full border-3 border-gray-200 animate-spin border-t-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-black">Loading...</p>
          <p className="text-xs text-muted-foreground mt-1">Please wait</p>
        </div>
      </div>
    </div>
  );

  const sidebarContent = (
    <>
      <CollapsibleSection
        id="overview"
        title="Overview"
        isOpen={openSections.includes("overview")}
        onToggle={toggleSection}
      >
        <SidebarNavLink
          href="/admin"
          label="Dashboard"
          icon={Home}
          isActive={isActivePath("/admin")}
        />
      </CollapsibleSection>

      <div className="mt-4">
        <CollapsibleSection
          id="platform"
          title="Platform"
          isOpen={openSections.includes("platform")}
          onToggle={toggleSection}
        >
          <SidebarNavLink
            href="/admin/users"
            label="Manage Users"
            icon={Users}
            isActive={isActivePath("/admin/users")}
          />
          <SidebarNavLink
            href="/admin/emails"
            label="Manage Emails"
            icon={Mail}
            isActive={isActivePath("/admin/emails")}
          />
          <SidebarNavLink
            href="/admin/billing-config"
            label="Billing Packages"
            icon={CreditCard}
            isActive={isActivePath("/admin/billing-config")}
          />
          <SidebarNavLink
            href="/admin/api-costs"
            label="API & Pricing"
            icon={DollarSign}
            isActive={isActivePath("/admin/api-costs")}
          />
        </CollapsibleSection>
      </div>

      <div className="mt-4">
        <CollapsibleSection
          id="account"
          title="Account"
          isOpen={openSections.includes("account")}
          onToggle={toggleSection}
        >
          <SidebarNavLink
            href="/admin/settings"
            label="Settings"
            icon={Settings}
            isActive={isActivePath("/admin/settings")}
          />
        </CollapsibleSection>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen w-full flex-col">
      {/* Demo Mode Banner */}
      {admin.isTestAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary/95 text-white text-center py-2 px-4">
          <div className="flex items-center justify-center gap-2 text-sm font-medium">
            <Eye className="h-4 w-4" />
            <span>
              Demo Mode — You are previewing the admin panel. All changes are
              disabled.
            </span>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 hidden w-65 flex-col border-r border-gray-200/60 bg-white sm:flex",
          admin.isTestAdmin && "top-10",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-gray-200/60 px-4 shrink-0">
          <Link href="/admin" className="flex items-center gap-2.5">
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

        {/* Bottom */}
        <div className="p-3 border-t border-gray-200/60 space-y-2">
          {admin.isDefaultCredentials && !admin.isTestAdmin && (
            <Link href="/admin/settings">
              <div className="flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2 my-2 cursor-pointer hover:bg-amber-50 transition-colors">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-xs font-medium text-amber-700">
                  Change default credentials
                </span>
              </div>
            </Link>
          )}
          <div className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 bg-white shadow-sm px-3 py-2.5">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-black truncate">
                {admin.fullName}
              </span>
              <span className="text-xs text-muted-foreground truncate -mt-0.5">
                {admin.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loggingOut ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
            Sign Out
          </button>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            &copy; {new Date().getFullYear()} Framecast AI
          </p>
        </div>
      </aside>

      <div
        className={cn("flex flex-col sm:pl-65", admin.isTestAdmin && "pt-10")}
      >
        {/* Top header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-gray-200/60 bg-white/80 backdrop-blur-md px-4 sm:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="sm:hidden cursor-pointer rounded-full"
              >
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-65 p-0 flex flex-col">
              <SheetTitle className="sr-only">Admin Menu</SheetTitle>
              <div className="flex h-16 items-center border-b border-gray-200/60 px-4 shrink-0">
                <Link href="/admin" className="flex items-center gap-2.5">
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
                {admin.isDefaultCredentials && !admin.isTestAdmin && (
                  <Link href="/admin/settings">
                    <div className="flex items-center gap-2 rounded-xl border border-amber-200/60 bg-amber-50/80 px-3 py-2 cursor-pointer hover:bg-amber-50 transition-colors">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                      <span className="text-xs font-medium text-amber-700">
                        Change default credentials
                      </span>
                    </div>
                  </Link>
                )}
                <div className="flex items-center gap-2.5 rounded-xl border border-gray-200/60 bg-white shadow-sm px-3 py-2.5">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium text-black truncate">
                      {admin.fullName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate -mt-0.5">
                      {admin.email}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loggingOut ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LogOut className="h-4 w-4" />
                  )}
                  Sign Out
                </button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  &copy; {new Date().getFullYear()} Framecast AI
                </p>
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-semibold md:text-xl text-black truncate">
                Admin Panel
              </h1>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 shrink-0">
                <Shield className="h-3 w-3 text-primary" />
                <span className="text-[11px] font-medium text-primary">
                  {admin.isTestAdmin ? "Demo" : "Admin"}
                </span>
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-8 bg-gray-50/50 min-h-[calc(100vh-4rem)]">
          <Suspense fallback={<AdminLoader />}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}
