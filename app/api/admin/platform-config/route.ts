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
  const { data, error } = await adminSupabase
    .from("platform_config")
    .select("key, value")
    .order("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const config: Record<string, any> = {};
  for (const row of data || []) {
    config[row.key] = row.value;
  }

  return NextResponse.json(config);
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
  const { updates } = body;

  if (!updates || typeof updates !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  if (updates.profit_margin !== undefined) {
    const margin = parseFloat(updates.profit_margin);
    if (isNaN(margin) || margin < 0 || margin >= 1) {
      return NextResponse.json(
        { error: "Profit margin must be between 0% and 99%" },
        { status: 400 },
      );
    }
  }

  if (updates.credit_value !== undefined) {
    const cv = parseFloat(updates.credit_value);
    if (isNaN(cv) || cv <= 0) {
      return NextResponse.json(
        { error: "Credit value must be greater than $0" },
        { status: 400 },
      );
    }
  }

  const sanitizedUpdates = { ...updates };
  delete sanitizedUpdates.ai_model_api_cost;
  delete sanitizedUpdates.magic_editor_api_cost;

  if (sanitizedUpdates.billing_packages !== undefined) {
    const allowedBadges = ["", "82% Choose This", "Best Value"];
    const packages = sanitizedUpdates.billing_packages as Array<{
      badge?: string;
    }>;

    const badgeCounts = packages.reduce(
      (acc, pkg) => {
        const badge = pkg.badge || "";
        if (!allowedBadges.includes(badge)) acc.invalid = true;
        if (badge === "82% Choose This") acc.popular += 1;
        if (badge === "Best Value") acc.best += 1;
        return acc;
      },
      { popular: 0, best: 0, invalid: false },
    );

    if (badgeCounts.invalid) {
      return NextResponse.json(
        { error: "Badges must be either 82% Choose This or Best Value" },
        { status: 400 },
      );
    }

    if (badgeCounts.popular > 1 || badgeCounts.best > 1) {
      return NextResponse.json(
        { error: "Only one package can use each badge" },
        { status: 400 },
      );
    }
  }

  const adminSupabase = getAdminSupabase();

  for (const [key, value] of Object.entries(sanitizedUpdates)) {
    const { error } = await adminSupabase.from("platform_config").upsert(
      {
        key,
        value: JSON.parse(JSON.stringify(value)),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "key" },
    );

    if (error) {
      return NextResponse.json(
        { error: `Failed to update ${key}: ${error.message}` },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
