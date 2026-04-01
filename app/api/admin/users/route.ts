import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isAdminUser, isTestAdminUser, getAdminSupabase } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = getAdminSupabase();

  // Fetch auth users
  const {
    data: { users },
    error: usersError,
  } = await adminSupabase.auth.admin.listUsers({ perPage: 1000 });

  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  // Filter out admin and test_admin users
  const regularUsers = users.filter(
    (u) =>
      u.user_metadata?.role !== "admin" &&
      u.user_metadata?.role !== "test_admin",
  );

  // Fetch credits for all users
  const { data: allCredits } = await adminSupabase
    .from("credits")
    .select("user_id, credits");

  // Fetch model counts per user
  const { data: allModels } = await adminSupabase
    .from("models")
    .select("user_id");

  // Fetch image counts per user
  const { data: allImages } = await adminSupabase
    .from("images")
    .select("modelId, models!inner(user_id)");

  // Fetch payments per user
  const { data: allPayments } = await adminSupabase
    .from("payments")
    .select("user_id, amount");

  const creditsMap = new Map<string, number>();
  for (const c of allCredits || []) {
    creditsMap.set(c.user_id, c.credits);
  }

  const modelCountMap = new Map<string, number>();
  for (const m of allModels || []) {
    if (m.user_id) {
      modelCountMap.set(m.user_id, (modelCountMap.get(m.user_id) || 0) + 1);
    }
  }

  const imageCountMap = new Map<string, number>();
  for (const img of allImages || []) {
    const userId = (img as any).models?.user_id;
    if (userId) {
      imageCountMap.set(userId, (imageCountMap.get(userId) || 0) + 1);
    }
  }

  const spendMap = new Map<string, number>();
  for (const payment of allPayments || []) {
    if (!payment.user_id) continue;
    const amount =
      typeof payment.amount === "number"
        ? payment.amount
        : parseFloat(String(payment.amount || 0));
    spendMap.set(
      payment.user_id,
      (spendMap.get(payment.user_id) || 0) + (isNaN(amount) ? 0 : amount),
    );
  }

  const result = regularUsers.map((u) => ({
    id: u.id,
    email: u.email || "",
    full_name:
      u.user_metadata?.full_name ||
      [u.user_metadata?.first_name, u.user_metadata?.last_name]
        .filter(Boolean)
        .join(" ") ||
      "",
    credits: creditsMap.get(u.id) ?? 0,
    spent: spendMap.get(u.id) ?? 0,
    models: modelCountMap.get(u.id) ?? 0,
    images: imageCountMap.get(u.id) ?? 0,
    created_at: u.created_at,
  }));

  return NextResponse.json(result);
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isTestAdminUser(user)) {
    return NextResponse.json(
      { error: "Demo mode — changes are disabled" },
      { status: 403 },
    );
  }

  const body = await req.json();
  const { userId, credits } = body;

  if (!userId || credits === undefined) {
    return NextResponse.json(
      { error: "Missing userId or credits" },
      { status: 400 },
    );
  }

  if (typeof credits !== "number" || credits < 0) {
    return NextResponse.json(
      { error: "Credits must be a non-negative number" },
      { status: 400 },
    );
  }

  const adminSupabase = getAdminSupabase();

  const { error } = await adminSupabase
    .from("credits")
    .update({ credits })
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminUser(user)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isTestAdminUser(user)) {
    return NextResponse.json(
      { error: "Demo mode — changes are disabled" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Missing userId" }, { status: 400 });
  }

  const adminSupabase = getAdminSupabase();

  // Delete user data in order (foreign key constraints)
  await adminSupabase.from("ai_edited_images").delete().eq("user_id", userId);
  await adminSupabase.from("credits").delete().eq("user_id", userId);

  // Get user's models to delete images and samples
  const { data: userModels } = await adminSupabase
    .from("models")
    .select("id")
    .eq("user_id", userId);

  if (userModels && userModels.length > 0) {
    const modelIds = userModels.map((m) => m.id);
    await adminSupabase.from("images").delete().in("modelId", modelIds);
    await adminSupabase.from("samples").delete().in("modelId", modelIds);
    await adminSupabase.from("models").delete().eq("user_id", userId);
  }

  // Delete auth user
  const { error } = await adminSupabase.auth.admin.deleteUser(userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
