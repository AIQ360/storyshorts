import MagicEditorContent from "./components/magic-editor-content";
import { getPlatformConfig } from "@/lib/credits";

export default async function MagicEditorPage() {
  const config = await getPlatformConfig().catch(() => null);
  return (
    <MagicEditorContent
      requiredCredits={config?.magic_editor_credits ?? 6}
      testMode={config?.astria_test_mode ?? false}
    />
  );
}
