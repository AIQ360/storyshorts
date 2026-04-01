import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SettingsContent from "./settings-content";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: creditData } = await supabase
    .from("credits")
    .select("credits")
    .eq("user_id", user.id)
    .single();

  const userData = {
    id: user.id,
    email: user.email || "",
    fullName: user.user_metadata?.full_name || "",
    avatarUrl: user.user_metadata?.avatar_url || "",
    provider: user.app_metadata?.provider || "email",
    createdAt: user.created_at,
    credits: creditData?.credits ?? 0,
  };

  return <SettingsContent user={userData} />;
}
