import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser, getAdminSupabase } from "@/lib/admin";
import { redirect } from "next/navigation";
import AdminOverview from "./components/admin-overview";
import {
  FAKE_STATS,
  FAKE_RECENT_MODELS,
  FAKE_RECENT_PAYMENTS,
} from "./components/fake-data";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    redirect("/admin/login");
  }

  if (isTestAdminUser(user)) {
    return (
      <AdminOverview
        stats={FAKE_STATS}
        recentModels={FAKE_RECENT_MODELS}
        recentPayments={FAKE_RECENT_PAYMENTS}
      />
    );
  }

  const adminSupabase = getAdminSupabase();

  const [
    { count: totalUsers },
    { count: totalModels },
    { count: totalImages },
    { count: totalEdits },
    { data: paymentsData },
    { data: recentModels },
    { data: recentPayments },
    { data: creditsData },
  ] = await Promise.all([
    adminSupabase.from("credits").select("*", { count: "exact", head: true }),
    adminSupabase.from("models").select("*", { count: "exact", head: true }),
    adminSupabase.from("images").select("*", { count: "exact", head: true }),
    adminSupabase
      .from("ai_edited_images")
      .select("*", { count: "exact", head: true }),
    adminSupabase.from("payments").select("amount, currency"),
    adminSupabase
      .from("models")
      .select("id, name, status, type, pack, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
    adminSupabase
      .from("payments")
      .select("id, amount, currency, created_at, user_id")
      .order("created_at", { ascending: false })
      .limit(5),
    adminSupabase.from("credits").select("credits"),
  ]);

  const totalRevenue =
    paymentsData?.reduce((sum, p) => sum + (p.amount || 0), 0) ?? 0;
  const totalCreditsInCirculation =
    creditsData?.reduce((sum, c) => sum + (c.credits || 0), 0) ?? 0;

  return (
    <AdminOverview
      stats={{
        totalUsers: totalUsers ?? 0,
        totalModels: totalModels ?? 0,
        totalImages: totalImages ?? 0,
        totalEdits: totalEdits ?? 0,
        totalRevenue,
        totalCreditsInCirculation,
      }}
      recentModels={recentModels ?? []}
      recentPayments={recentPayments ?? []}
    />
  );
}
