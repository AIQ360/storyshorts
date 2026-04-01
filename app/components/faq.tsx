"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BlurredStagger } from "@/components/ui/text-reveal-faqs";
import * as m from "motion/react-client";
import { useTranslations } from "next-intl";

const FifthSection = () => {
  const t = useTranslations("FAQ");
  return (
    <>
      <section
        id="faqs"
        className="py-8 md:py-16 flex flex-col items-center justify-center bg-gray-50/50"
      >
        <div className="max-w-2xl px-5 w-full flex flex-col items-center justify-center mb-12">
          {/* Headings */}
          <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center">
            <m.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-sm font-bold uppercase tracking-widest text-muted-foreground"
            >
              {t("tag")}
            </m.p>
            <m.h2
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl font-bold tracking-tight md:text-[52px] md:leading-[1.1]"
            >
              {t("title")}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0025cc] to-[#2b5fff]">
                {t("titleHighlight")}
              </span>
            </m.h2>
            <m.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg px-4"
            >
              {t("subtitle")}
            </m.p>
          </div>

          {/* Right Section: Accordion */}
          <div className="w-full">
            <Accordion type="single" collapsible>
              <AccordionItem
                value="item-1"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q1")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a1")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-2"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q2")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a2")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-3"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q3")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a3")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-4"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q4")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a4")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-5"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q5")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a5")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-6"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q6")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a6")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-7"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q7")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a7")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-8"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q8")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a8")} />
                </AccordionContent>
              </AccordionItem>
              <AccordionItem
                value="item-9"
                className="border-b border-gray-200"
              >
                <AccordionTrigger className="text-[17px] font-medium hover:no-underline text-left text-gray-800 cursor-pointer">
                  {t("q9")}
                </AccordionTrigger>
                <AccordionContent className="text-gray-500">
                  <BlurredStagger text={t("a9")} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </section>
    </>
  );
};

export default FifthSection;
