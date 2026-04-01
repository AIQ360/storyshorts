export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, context: Params) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    const { data: job, error: jobError } = await supabase
      .from("video_jobs")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (jobError) {
      return NextResponse.json({ error: jobError.message }, { status: 404 });
    }

    const { data: events, error: eventsError } = await supabase
      .from("video_job_events")
      .select("id,event_type,payload,created_at")
      .eq("job_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: true });

    if (eventsError) {
      return NextResponse.json({ error: eventsError.message }, { status: 500 });
    }

    return NextResponse.json({
      job,
      events: events || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal error" },
      { status: 500 },
    );
  }
}
