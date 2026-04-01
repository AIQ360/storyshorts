import Login from "@/app/login/page";
import { Icons } from "@/components/icons";
import ClientSideModel from "../../components/client-model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function Index({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return <Login />;
  }

  const { data: model } = await supabase
    .from("models")
    .select("*")
    .eq("id", Number(id))
    .eq("user_id", user.id)
    .single();

  if (!model) {
    redirect("/dashboard");
  }

  const d = await getTranslations("Dashboard");

  const { data: images } = await supabase
    .from("images")
    .select("*")
    .eq("modelId", model.id);

  const { data: samples } = await supabase
    .from("samples")
    .select("*")
    .eq("modelId", model.id);

  return (
    <div id="train-model-container" className="w-full h-full">
      <div className="flex flex-row items-center gap-4 pb-4">
        <Link href="/dashboard">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-gray-200/60 hover:bg-gray-50"
          >
            <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
            {d("back")}
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-black">{model.name}</h1>
        <Badge
          variant={model.status === "finished" ? "default" : "secondary"}
          className="text-xs font-medium"
        >
          {model.status === "processing" ? (
            <>
              {capitalize(d("training"))}
              <Icons.spinner className="h-4 w-4 animate-spin ml-2 inline-block" />
            </>
          ) : (
            capitalize(model.status)
          )}
        </Badge>
      </div>

      <ClientSideModel
        samples={samples ?? []}
        serverModel={model}
        serverImages={images ?? []}
      />
    </div>
  );
}
