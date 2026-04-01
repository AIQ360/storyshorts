import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { isAdminUser } from "@/lib/admin";
import AdminLoginForm from "./components/admin-login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If already logged in as admin, redirect to admin dashboard
  if (user && isAdminUser(user)) {
    redirect("/admin");
  }

  return (
    <div className="flex flex-col flex-1 w-full">
      <AdminLoginForm />
    </div>
  );
}
