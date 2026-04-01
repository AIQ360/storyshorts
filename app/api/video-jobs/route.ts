export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const limitValue = Number(url.searchParams.get("limit") || 20);
    const limit = Math.max(1, Math.min(100, Number.isFinite(limitValue) ? limitValue : 20));

    const { data, error } = await supabase
      .from("video_jobs")
      .select(
        "id,status,progress,error,required_credits,consumed_credits,created_at,updated_at,trigger_run_id,engine_job_id,output_json",
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ jobs: data || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 },
    );
  }
}
