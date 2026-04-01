import HeroSection from "../components/hero";
import Carousel from "@/components/ui/carousel";
import Examples from "../components/examples";
import HowItWorksSection from "../components/how-it-works";
import EditingToolsSection from "../components/editing-tools";
import PricingSection from "../components/pricing";
import FaqSection from "../components/faq";
import FinalCTA from "../components/final-cta";
import Navbar from "../components/navbar";
import Footer from "../components/footer";
import { getPlatformConfig } from "@/lib/credits";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export default async function Index() {
  const config = await getPlatformConfig();
  const t = await getTranslations("Examples");

  return (
    <>
      <Navbar />
      <HeroSection />
      <Carousel
        text={
          <p className="text-sm text-muted-foreground">
            {t.rich("carouselSocialProof", {
              headshots: t("statsHeadshots"),
              customers: t("statsCustomers"),
              bold: (chunks) => <span className="font-bold">{chunks}</span>,
            })}
          </p>
        }
      />
      <Examples />
      <HowItWorksSection />
      <EditingToolsSection />
      <PricingSection
        packages={config.billing_packages}
        creditValue={config.credit_value}
        profitMargin={config.profit_margin}
      />
      <FaqSection />
      <FinalCTA />
      <Footer />
    </>
  );
}
