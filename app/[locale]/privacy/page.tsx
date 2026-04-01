import React from "react";
import Navbar from "@/app/components/navbar";
import { getTranslations } from "next-intl/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Privacy Policy — Framecast AI",
  description: "Read the Privacy Policy for Framecast AI.",
};

const PrivacyPolicy = async () => {
  const t = await getTranslations("Privacy");

  return (
    <div className="grow pb-16">
      <Navbar />
      <main className="mx-auto mt-20 max-w-3xl px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {t("title")}
        </h1>
        <p className="mt-4 text-sm text-muted-foreground">
          {t("effectiveDate")}
        </p>

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
                {t("section1PersonalInfo")}
              </strong>{" "}
              {t("section1PersonalInfoDesc")}
            </li>
            <li>
              <strong className="text-foreground">
                {t("section1UsageData")}
              </strong>{" "}
              {t("section1UsageDataDesc")}
            </li>
            <li>
              <strong className="text-foreground">
                {t("section1Cookies")}
              </strong>{" "}
              {t("section1CookiesDesc")}
              <ul className="mt-2 list-disc space-y-1 pl-6">
                <li>{t("section1Cookie1")}</li>
                <li>{t("section1Cookie2")}</li>
                <li>{t("section1Cookie3")}</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section2Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section2Intro")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>{t("section2Item1")}</li>
            <li>{t("section2Item2")}</li>
            <li>{t("section2Item3")}</li>
            <li>{t("section2Item4")}</li>
            <li>{t("section2Item5")}</li>
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section3Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section3Intro")}
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-muted-foreground leading-7">
            <li>
              <strong className="text-foreground">{t("section3Item1")}</strong>{" "}
              {t("section3Item1Desc")}
            </li>
            <li>
              <strong className="text-foreground">{t("section3Item2")}</strong>{" "}
              {t("section3Item2Desc")}
            </li>
            <li>
              <strong className="text-foreground">{t("section3Item3")}</strong>{" "}
              {t("section3Item3Desc")}
            </li>
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
            <li>{t("section5Item4")}</li>
            <li>{t("section5Item5")}</li>
          </ul>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section5Outro")}
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

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section9Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section9Text")}
          </p>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold text-foreground">
            {t("section10Title")}
          </h2>
          <p className="mt-3 leading-7 text-muted-foreground">
            {t("section10Text")}
          </p>
        </section>

        <section className="mt-10 border-t border-border pt-8">
          <p className="leading-7 text-muted-foreground">{t("contact")}</p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
