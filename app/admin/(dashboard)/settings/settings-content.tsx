"use client";

import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  Mail,
  Shield,
  Calendar,
  AlertTriangle,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Check,
  X,
  RotateCcw,
  FlaskConical,
  UserPlus,
  Trash2,
  Copy,
} from "lucide-react";
import {
  PASSWORD_RULES,
  getPasswordStrength,
  validatePassword,
} from "@/lib/password";

type AdminData = {
  email: string;
  fullName: string;
  isDefaultCredentials: boolean;
  createdAt: string;
};

export default function AdminSettingsContent({
  admin,
  testModeEnabled,
  isTestAdmin = false,
}: {
  admin: AdminData;
  testModeEnabled: boolean;
  isTestAdmin?: boolean;
}) {
  const router = useRouter();
  const [testMode, setTestMode] = useState(testModeEnabled);
  const [isTogglingTestMode, setIsTogglingTestMode] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restorePassword, setRestorePassword] = useState("");
  const [showRestorePassword, setShowRestorePassword] = useState(false);

  // Test admin management state (only for real admin)
  const [testAdminExists, setTestAdminExists] = useState(false);
  const [testAdminLoading, setTestAdminLoading] = useState(!isTestAdmin);
  const [testAdminCreating, setTestAdminCreating] = useState(false);
  const [testAdminDeleting, setTestAdminDeleting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const strength = useMemo(
    () => getPasswordStrength(newPassword),
    [newPassword],
  );

  // Fetch test admin status (real admin only)
  useEffect(() => {
    if (isTestAdmin) return;
    (async () => {
      try {
        const res = await fetch("/api/admin/test-admin");
        if (res.ok) {
          const data = await res.json();
          setTestAdminExists(data.exists);
        }
      } catch {
        // Ignore fetch errors
      } finally {
        setTestAdminLoading(false);
      }
    })();
  }, [isTestAdmin]);

  const handleCreateTestAdmin = async () => {
    setTestAdminCreating(true);
    try {
      const res = await fetch("/api/admin/test-admin", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");
      setTestAdminExists(true);
      toast.success("Test admin created successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create test admin",
      );
    } finally {
      setTestAdminCreating(false);
    }
  };

  const handleDeleteTestAdmin = async () => {
    setTestAdminDeleting(true);
    try {
      const res = await fetch("/api/admin/test-admin", { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setTestAdminExists(false);
      toast.success("Test admin deleted");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete test admin",
      );
    } finally {
      setTestAdminDeleting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleToggleTestMode = async () => {
    setIsTogglingTestMode(true);
    try {
      const res = await fetch("/api/admin/platform-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: { astria_test_mode: !testMode },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }

      setTestMode(!testMode);
      toast.success(!testMode ? "Test mode enabled" : "Test mode disabled");
      router.refresh();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to toggle test mode",
      );
    } finally {
      setIsTogglingTestMode(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!newEmail && !newPassword) {
      toast.error("Enter a new email or password to update");
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword) {
      const result = validatePassword(newPassword);
      if (result !== true) {
        toast.error(result);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newEmail, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to update");
        return;
      }

      toast.success("Credentials updated successfully");

      // Clear form
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");

      // Refresh to pick up new metadata
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold text-black">Settings</h2>
        <p className="text-muted-foreground mt-1">
          Manage your admin credentials and platform settings
        </p>
      </div>

      {/* Test Mode Zone */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
          Test Mode
        </h3>
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6">
          <div className="flex items-start gap-4">
            <div
              className={`h-10 w-10 rounded-xl ${testMode ? "bg-amber-50" : "bg-gray-50"} flex items-center justify-center shrink-0 transition-colors`}
            >
              <FlaskConical
                className={`h-5 w-5 ${testMode ? "text-amber-600" : "text-gray-400"} transition-colors`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-black">
                    Astria Test Mode
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1 max-w-md">
                    When enabled, the Astria AI API runs in test mode — model
                    training uses the{" "}
                    <span className="font-medium text-gray-700">fast</span>{" "}
                    branch which returns mock results instantly without charging
                    your Astria account.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={testMode}
                  disabled={isTogglingTestMode || isTestAdmin}
                  onClick={handleToggleTestMode}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${testMode ? "bg-amber-500" : "bg-gray-200"}`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform ${testMode ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
              </div>

              {/* What it does */}
              <div className="mt-4 rounded-xl bg-gray-50/80 border border-gray-200/40 p-3.5 space-y-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  What changes in test mode
                </p>
                <ul className="space-y-1.5 text-xs text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    AI model training uses the{" "}
                    <span className="font-medium text-gray-700">fast</span>{" "}
                    branch — models finish in seconds with dummy outputs
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    Styles gallery is disabled for users — only raw AI model
                    training is available
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    Magic Editor is disabled for users
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    An amber &ldquo;Test Mode&rdquo; badge is shown on every
                    user&apos;s dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                    No real Astria API costs are incurred — safe for development
                    and testing
                  </li>
                </ul>
              </div>

              {testMode && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[11px] font-medium text-amber-700">
                    Test mode is currently active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Default credentials warning */}
      {admin.isDefaultCredentials && (
        <div className="rounded-2xl bg-amber-50/80 border border-amber-200/60 p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Default credentials detected
            </p>
            <p className="text-xs text-amber-700 mt-1">
              You are using the default admin email and password. Please update
              them below to secure your admin panel.
            </p>
          </div>
        </div>
      )}

      {/* Account Overview */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
          Account Overview
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center">
                <Mail className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-black truncate">
                  {admin.email}
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="text-sm font-medium text-black">Administrator</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-primary/5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="text-sm font-medium text-black">
                  {new Date(admin.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Update Credentials */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
          Update Credentials
        </h3>
        <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6">
          <form onSubmit={handleUpdate} className="space-y-5">
            {/* Current Password */}
            <div className="space-y-2">
              <Label
                htmlFor="currentPassword"
                className="flex items-center gap-1.5"
              >
                <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                Current Password
              </Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-5">
              {/* New Email */}
              <div className="space-y-2">
                <Label htmlFor="newEmail" className="flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  New Email (optional)
                </Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={admin.email}
                />
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label
                  htmlFor="newPassword"
                  className="flex items-center gap-1.5"
                >
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  New Password (optional)
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showNewPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {newPassword && (
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
                        {strength.label}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 gap-0.5">
                      {PASSWORD_RULES.map((rule) => {
                        const passed = rule.test(newPassword);
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
                              className={`text-[11px] ${passed ? "text-gray-700" : "text-gray-400"}`}
                            >
                              {rule.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              {newPassword && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                  {confirmPassword && newPassword !== confirmPassword && (
                    <p className="text-xs text-red-500">
                      Passwords don&apos;t match
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                isTestAdmin ||
                isSubmitting ||
                !currentPassword ||
                (!!newPassword && validatePassword(newPassword) !== true) ||
                (!!newPassword && newPassword !== confirmPassword)
              }
              className="rounded-full bg-primary hover:bg-primary/90 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {isSubmitting ? "Updating..." : "Update Credentials"}
            </Button>
          </form>
        </div>
      </section>

      {/* Restore Defaults */}
      {!admin.isDefaultCredentials && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
            Restore Defaults
          </h3>
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <RotateCcw className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-black">
                    Reset to Default Credentials
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will reset your email to{" "}
                    <span className="font-medium">admin@framecast.local</span>{" "}
                    and password to{" "}
                    <span className="font-medium">admin123</span>. You will be
                    logged out and need to sign in again.
                  </p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="restorePassword"
                      className="text-xs text-gray-600"
                    >
                      Confirm current password to restore
                    </Label>
                    <div className="relative max-w-xs">
                      <Input
                        id="restorePassword"
                        type={showRestorePassword ? "text" : "password"}
                        value={restorePassword}
                        onChange={(e) => setRestorePassword(e.target.value)}
                        placeholder="Enter current password"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowRestorePassword(!showRestorePassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showRestorePassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    disabled={isTestAdmin || isRestoring || !restorePassword}
                    onClick={async () => {
                      setIsRestoring(true);
                      try {
                        const res = await fetch("/api/admin/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            currentPassword: restorePassword,
                          }),
                        });
                        const data = await res.json();
                        if (!res.ok) {
                          toast.error(data.message || "Failed to restore");
                          return;
                        }
                        toast.success(
                          "Credentials restored to defaults. Please sign in again.",
                        );
                        setTimeout(() => {
                          window.location.href = "/admin/login";
                        }, 1500);
                      } catch {
                        toast.error("Something went wrong");
                      } finally {
                        setIsRestoring(false);
                      }
                    }}
                    className="border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 cursor-pointer rounded-full"
                    size="sm"
                  >
                    {isRestoring ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <RotateCcw className="h-4 w-4 mr-1.5" />
                    )}
                    {isRestoring ? "Restoring..." : "Restore Defaults"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Test Admin Management — only for real admin */}
      {!isTestAdmin && (
        <section className="space-y-4">
          <h3 className="text-sm font-semibold text-black uppercase tracking-wider">
            Demo Account
          </h3>
          <div className="rounded-2xl bg-white border border-gray-200/60 shadow-sm p-6">
            {testAdminLoading ? (
              <div className="flex items-center gap-3 py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  Checking demo account status...
                </span>
              </div>
            ) : testAdminExists ? (
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-black">
                      Demo Account Active
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      A read-only demo admin account is available. Share these
                      credentials with potential customers to preview the admin
                      panel.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-medium text-emerald-700">
                      Active
                    </span>
                  </span>
                </div>

                {/* Credentials display */}
                <div className="rounded-xl bg-gray-50/80 border border-gray-200/40 p-4 space-y-3">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Demo Credentials
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium text-black font-mono">
                          demo@framecast.local
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 cursor-pointer"
                        onClick={() =>
                          copyToClipboard("demo@framecast.local", "email")
                        }
                      >
                        {copiedField === "email" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">
                          Password
                        </p>
                        <p className="text-sm font-medium text-black font-mono">
                          demo123
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0 cursor-pointer"
                        onClick={() => copyToClipboard("demo123", "password")}
                      >
                        {copiedField === "password" ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Delete button */}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={testAdminDeleting}
                  onClick={handleDeleteTestAdmin}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer rounded-full"
                >
                  {testAdminDeleting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-1.5" />
                  )}
                  {testAdminDeleting ? "Removing..." : "Remove Demo Account"}
                </Button>
              </div>
            ) : (
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <UserPlus className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-black">
                      Create Demo Account
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 max-w-md">
                      Create a read-only demo admin account that potential
                      customers can use to preview the admin panel. All data
                      shown will be simulated and no real changes can be made.
                    </p>
                  </div>
                  <div className="rounded-xl bg-gray-50/80 border border-gray-200/40 p-3.5 space-y-2">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      What the demo account includes
                    </p>
                    <ul className="space-y-1.5 text-xs text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        Full admin dashboard with simulated user data and
                        statistics
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        All pages are visible but every button and form is
                        disabled
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        A persistent &ldquo;Demo Mode&rdquo; banner is shown at
                        the top
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1 w-1 rounded-full bg-gray-400 mt-1.5 shrink-0" />
                        Credentials:{" "}
                        <span className="font-medium text-gray-700 font-mono">
                          demo@framecast.local
                        </span>{" "}
                        /{" "}
                        <span className="font-medium text-gray-700 font-mono">
                          demo123
                        </span>
                      </li>
                    </ul>
                  </div>
                  <Button
                    size="sm"
                    disabled={testAdminCreating}
                    onClick={handleCreateTestAdmin}
                    className="rounded-full bg-primary hover:bg-primary/90 cursor-pointer"
                  >
                    {testAdminCreating ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    ) : (
                      <UserPlus className="h-4 w-4 mr-1.5" />
                    )}
                    {testAdminCreating ? "Creating..." : "Create Demo Account"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
