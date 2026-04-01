import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import FinalCTA from "@/app/components/final-cta";
import Carousel from "@/components/ui/carousel";
import ReviewsHero from "./components/reviews-hero";
import ReviewList from "./components/review-list";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Reviews — Framecast AI",
  description:
    "See what our customers say about their AI-generated professional headshots.",
};

export default async function ReviewsPage() {
  const t = await getTranslations("ReviewsPage");

  return (
    <>
      <Navbar />
      <div className="flex min-h-screen flex-col pt-8">
        <ReviewsHero />
        <Carousel
          text={
            <p className="text-sm text-muted-foreground text-center">
              {t("trustedBadge")}
            </p>
          }
        />
        <ReviewList />
      </div>
      <FinalCTA />
      <Footer />
    </>
  );
}
