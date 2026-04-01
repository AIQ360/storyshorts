import React from "react";
import Navbar from "@/app/components/navbar";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Refund Policy — Framecast AI",
  description: "Read the Refund Policy for Framecast AI.",
};

const Refund = async () => {
  const t = await getTranslations("Refund");

  return (
    <div className="grow pb-16">
      <Navbar />
      <main className="mx-auto mt-20 max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-6 leading-7 text-muted-foreground">{t("intro")}</p>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section1Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section1Intro")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>
              <strong className="text-foreground">
                {t("section1Item1Title")}
              </strong>{" "}
              {t("section1Item1Text")}
            </li>
            <li>
              <strong className="text-foreground">
                {t("section1Item2Title")}
              </strong>{" "}
              {t("section1Item2Text")}
            </li>
            <li>
              <strong className="text-foreground">
                {t("section1Item3Title")}
              </strong>{" "}
              {t("section1Item3Text")}
            </li>
          </ul>
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
            {t("section3Intro")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>{t("section3Item1")}</li>
            <li>{t("section3Item2")}</li>
            <li>{t("section3Item3")}</li>
            <li>{t("section3Item4")}</li>
          </ul>
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
            {t("section5Intro")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>{t("section5Item1")}</li>
            <li>{t("section5Item2")}</li>
            <li>{t("section5Item3")}</li>
          </ul>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <p className="leading-7 text-muted-foreground">{t("contact")}</p>
        </section>
      </main>
    </div>
  );
};

export default Refund;
