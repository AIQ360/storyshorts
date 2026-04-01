import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminUser, isTestAdminUser, getAdminSupabase } from "@/lib/admin";
import AdminShell from "./components/admin-shell";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  // Read directly from DB (not cached JWT) for accurate metadata
  const adminSupabase = getAdminSupabase();
  const { data: dbUser } = await adminSupabase.auth.admin.getUserById(user.id);
  const metadata = dbUser?.user?.user_metadata;

  const adminUser = {
    email: dbUser?.user?.email || user.email || "",
    fullName: metadata?.full_name || "Admin",
    isDefaultCredentials: metadata?.is_default_credentials === true,
    isTestAdmin: isTestAdminUser(user),
  };

  return <AdminShell admin={adminUser}>{children}</AdminShell>;
}
