import Logo from "@/app/components/logo";
import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: <Logo width={130} height={130} sparkleSize={22} />,
      url: "/",
    },
    links: [],
  };
}
