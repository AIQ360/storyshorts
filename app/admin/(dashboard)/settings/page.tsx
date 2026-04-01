import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser, getAdminSupabase } from "@/lib/admin";
import { redirect } from "next/navigation";
import { getPlatformConfig } from "@/lib/credits";
import AdminSettingsContent from "./settings-content";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  const isTestAdmin = isTestAdminUser(user);

  // Read directly from DB (not cached JWT) for accurate metadata
  const adminSupabase = getAdminSupabase();
  const { data: dbUser } = await adminSupabase.auth.admin.getUserById(user.id);
  const metadata = dbUser?.user?.user_metadata;

  const config = await getPlatformConfig().catch(() => null);

  const adminData = {
    email: dbUser?.user?.email || user.email || "",
    fullName: metadata?.full_name || "Admin",
    isDefaultCredentials: metadata?.is_default_credentials === true,
    createdAt: dbUser?.user?.created_at || user.created_at,
  };

  return (
    <AdminSettingsContent
      admin={adminData}
      testModeEnabled={config?.astria_test_mode ?? false}
      isTestAdmin={isTestAdmin}
    />
  );
}
