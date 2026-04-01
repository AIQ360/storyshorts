import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";
import UsersContent from "./users-content";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return <UsersContent isTestAdmin={isTestAdminUser(user)} />;
}
