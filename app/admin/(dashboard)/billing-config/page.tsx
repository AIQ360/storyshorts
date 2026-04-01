import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser } from "@/lib/admin";
import { redirect } from "next/navigation";
import { getPlatformConfig } from "@/lib/credits";
import BillingConfigContent from "./billing-config-content";

export const dynamic = "force-dynamic";

export default async function BillingConfigPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  const config = await getPlatformConfig();

  return (
    <BillingConfigContent
      packages={config.billing_packages}
      creditValue={config.credit_value}
      profitMargin={config.profit_margin}
      aiModelCredits={config.ai_model_credits}
      magicEditorCredits={config.magic_editor_credits}
      isTestAdmin={isTestAdminUser(user)}
    />
  );
}
