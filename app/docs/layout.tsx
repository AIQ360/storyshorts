import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { ReactNode } from "react";
import { source } from "@/lib/source";
import { baseOptions } from "@/lib/layout.shared";

export const metadata = {
  title: {
    default: "Framecast AI Documentation",
    template: "%s | Framecast AI",
  },
  description:
    "Documentation for Framecast AI - Generate awesome headshots in minutes using AI",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      {...baseOptions()}
      sidebar={{
        defaultOpenLevel: 0,
        footer: (
          <p className="text-[11px] text-fd-muted-foreground text-center">
            &copy; {new Date().getFullYear()} Framecast AI
          </p>
        ),
      }}
      themeSwitch={{ enabled: false }}
    >
      {children}
    </DocsLayout>
  );
}
