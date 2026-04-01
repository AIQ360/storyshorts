import React from "react";
import Navbar from "@/app/components/navbar";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terms of Service — Framecast AI",
  description: "Read the Terms of Service for Framecast AI.",
};

const TermsOfService = async () => {
  const t = await getTranslations("Terms");

  return (
    <div className="grow pb-16">
      <Navbar />
      <main className="mx-auto mt-20 max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section1Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section1Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section2Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section2Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section3Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section3Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section4Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section4Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section5Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section5Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section6Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section6Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section7Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section7Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section8Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section8Text")}
          </p>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section9Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section9Text")}
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsOfService;
