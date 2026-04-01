import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Database } from "@/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY!;

export async function DELETE(request: Request) {
  const supabaseAuth = await createServerClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient<Database>(supabaseUrl, supabaseSecretKey);

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type"); // "ai-models" | "styles" | null (all)
  const ids = searchParams.get("ids"); // comma-separated model IDs for selective delete

  if (ids) {
    const idArray = ids.split(",").map(Number).filter(Boolean);
    if (idArray.length === 0) {
      return NextResponse.json({ error: "No valid IDs" }, { status: 400 });
    }
    const { error } = await supabase
      .from("models")
      .delete()
      .eq("user_id", user.id)
      .in("id", idArray);

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete models" },
        { status: 500 },
      );
    }
    return NextResponse.json({ message: `${idArray.length} models deleted` });
  }

  let query = supabase.from("models").delete().eq("user_id", user.id);

  if (type === "ai-models") {
    query = query.is("pack", null);
  } else if (type === "styles") {
    query = query.not("pack", "is", null);
  }

  const { error } = await query;

  if (error) {
    return NextResponse.json(
      { error: "Failed to delete models" },
      { status: 500 },
    );
  }

  return NextResponse.json({ message: "All models deleted" });
}
