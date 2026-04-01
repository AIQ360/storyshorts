import { defineConfig } from "@trigger.dev/sdk/v3";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_ID ?? "",
  runtime: "node",
  maxDuration: 3600,
  dirs: ["./trigger"],
});
