import React from "react";
import Navbar from "@/app/components/navbar";
import Footer from "@/app/components/footer";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Blog — Framecast AI",
  description:
    "Stay tuned for the latest updates, tips, and insights from Framecast AI.",
};

const Blog = async () => {
  const t = await getTranslations("Blog");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1 flex justify-center items-center my-24 sm:my-36 md:my-52">
        <h2 className="text-4xl sm:text-5xl md:text-6xl text-center font-bold text-black tracking-tight">
          {t("comingSoon")}
        </h2>
      </div>
      <Footer />
    </div>
  );
};

export default Blog;
