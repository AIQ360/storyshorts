"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Shield, CheckCircle2 } from "lucide-react";
import Logo from "@/app/components/logo";
import AdminLoginShowcase from "./admin-login-showcase";

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [adminExists, setAdminExists] = useState<boolean | null>(null);

  // Check if admin already exists on mount
  useEffect(() => {
    fetch("/api/admin/seed")
      .then((res) => res.json())
      .then((data) => setAdminExists(data.exists ?? false))
      .catch(() => setAdminExists(false));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        return;
      }

      toast.success("Welcome back, Admin");

      setTimeout(() => {
        router.push("/admin");
        router.refresh();
      }, 500);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSeedAdmin = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to create admin");
        return;
      }

      if (data.exists) {
        toast.info("Admin account already exists");
        setAdminExists(true);
      } else {
        toast.success(
          "Default admin created! Email: admin@framecast.local / Password: admin123",
        );
        setEmail("admin@framecast.local");
        setPassword("admin123");
        setAdminExists(true);
      }
    } catch {
      toast.error("Failed to seed admin");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Showcase */}
      <div className="hidden lg:block lg:w-1/2 xl:w-[55%]">
        <AdminLoginShowcase />
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-[45%] flex items-center justify-center bg-white p-4 lg:p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="mb-6">
            <a href="/">
              <Logo variant="black" width={160} height={40} sparkleSize={24} />
            </a>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <Shield className="h-3 w-3" />
                Admin Panel
              </span>
            </div>
          </div>

          {/* Form */}
          <div className="p-2">
            <h2 className="text-xl font-semibold text-black mb-1">
              Admin Login
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Sign in to access the admin dashboard
            </p>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                />
              </div>
              <div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="py-5 px-4 w-full text-black bg-white border-gray-200 rounded-xl text-sm focus:border-primary focus:ring-primary placeholder:text-gray-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
              <Button
                disabled={isSubmitting}
                className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white font-medium border-none cursor-pointer"
                type="submit"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            {/* Seed button */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              {adminExists ? (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <span>Admin account is set up</span>
                </div>
              ) : (
                <>
                  <p className="text-xs text-gray-400 mb-3 text-center">
                    First time? Create the default admin account
                  </p>
                  <Button
                    variant="outline"
                    onClick={handleSeedAdmin}
                    disabled={isSeeding || adminExists === null}
                    className="w-full rounded-full border-gray-200 hover:bg-gray-50 cursor-pointer"
                  >
                    {isSeeding ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Shield className="h-4 w-4 mr-2" />
                    )}
                    {isSeeding ? "Creating..." : "Initialize Admin Account"}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-gray-400 tracking-wide mt-6">
            This is a restricted area for SaaS administrators only.
          </p>
        </div>
      </div>
    </div>
  );
}
