import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";
import { getPlatformConfig } from "@/lib/credits";
import ApiCostsContent from "./api-costs-content";

export const dynamic = "force-dynamic";

export default async function ApiCostsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  const config = await getPlatformConfig();

  return (
    <ApiCostsContent config={config} isTestAdmin={isTestAdminUser(user)} />
  );
}
