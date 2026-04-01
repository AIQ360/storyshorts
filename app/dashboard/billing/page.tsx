import { createClient } from "@/lib/supabase/server";
import { getPlatformConfig } from "@/lib/credits";
import BillingContent from "./billing-content";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const supabase = await createClient();
  const d = await getTranslations("Dashboard");

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <div className="text-muted-foreground">{d("userNotFound")}</div>;
  }

  const [{ data: credits }, config] = await Promise.all([
    supabase.from("credits").select("credits").eq("user_id", user.id).single(),
    getPlatformConfig(),
  ]);

  return (
    <BillingContent
      userId={user.id}
      userEmail={user.email || ""}
      userName={user.user_metadata?.full_name || ""}
      currentCredits={credits?.credits ?? 0}
      packages={config.billing_packages}
      creditValue={config.credit_value}
      profitMargin={config.profit_margin}
      aiModelCredits={config.ai_model_credits}
      testMode={config.astria_test_mode}
    />
  );
}
