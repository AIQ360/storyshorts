import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import GalleryList from "../components/gallery-list";

export const dynamic = "force-dynamic";

export default async function MyModelsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: models } = await supabase
    .from("models")
    .select("*, samples (*)")
    .eq("user_id", user.id)
    .is("pack", null)
    .order("created_at", { ascending: false });

  return <GalleryList models={models ?? []} type="ai-models" />;
}
