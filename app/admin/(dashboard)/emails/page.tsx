import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";
import EmailsContent from "./emails-content";

export const dynamic = "force-dynamic";

export default async function ManageEmailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  return <EmailsContent isTestAdmin={isTestAdminUser(user)} />;
}
