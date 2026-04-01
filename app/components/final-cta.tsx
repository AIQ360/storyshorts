"use client";

import { Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import * as m from "motion/react-client";
import { useTranslations } from "next-intl";

const FinalCTA = () => {
  const t = useTranslations("FinalCTA");
  return (
    <section className="py-2 md:pt-0 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl sm:rounded-[2.5rem] bg-gray-50/50 border border-gray-100 p-5 sm:p-8 md:p-12 lg:p-16 shadow-[0_10px_30px_-12px_rgba(0,37,204,0.30)] flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden">
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[#0025cc]/5 rounded-full blur-3xl opacity-50"></div>

          {/* Left Section: Heading and Call-to-Action */}
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left z-10 w-full">
            <m.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl md:text-[44px] font-bold tracking-tight text-gray-900 mb-6 leading-[1.15]"
            >
              {t("title1")}{" "}
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#0025cc] to-[#2b5fff]">
                {t("titleHighlight")}{" "}
              </span>
              {t("title2")}
            </m.h2>

            <m.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed"
            >
              {t("subtitle")}
            </m.p>

            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                href="/login"
                className="h-12 px-8 rounded-full font-semibold text-base text-white bg-primary hover:brightness-110 shadow-lg shadow-primary/25 transition-all inline-flex items-center gap-2"
              >
                {t("cta")}
                <Sparkles className="h-4 w-4" />
              </Link>
            </m.div>

            <m.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-sm text-gray-500 font-medium"
            >
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0025cc]" />
                {t("feature1")}
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0025cc]" />
                {t("feature2")}
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#0025cc]" />
                {t("feature3")}
              </div>
            </m.div>
          </div>

          {/* Right Section: Creative Floating Images */}
          <div className="w-full lg:w-1/2 justify-center items-center relative min-h-87.5 z-10 hidden md:flex">
            {/* Image 1: Top Left - floats slower */}
            <m.div
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-4 left-4 lg:left-12 w-32 h-32 md:w-37.5 md:h-37.5 rounded-full overflow-hidden border-3 border-white shadow-xl -rotate-6"
            >
              <Image
                src="/headshots/human10.png"
                alt="AI Headshot Example 1"
                width={150}
                height={150}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </m.div>

            {/* Image 2: Middle Right - floats medium */}
            <m.div
              animate={{ y: [0, -18, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
              className="absolute top-1/2 -translate-y-1/2 right-4 lg:right-8 w-40 h-40 md:w-47.5 md:h-47.5 rounded-full overflow-hidden border-3 border-white shadow-xl rotate-3"
            >
              <Image
                src="/headshots/human12.png"
                alt="AI Headshot Example 2"
                width={190}
                height={190}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </m.div>

            {/* Image 3: Bottom Left - floats faster */}
            <m.div
              animate={{ y: [0, -10, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
              className="absolute bottom-0 left-20 lg:left-32 w-28 h-28 md:w-32.5 md:h-32.5 rounded-full overflow-hidden border-3 border-white shadow-lg -rotate-[8deg]"
            >
              <Image
                src="/headshots/human14.png"
                alt="AI Headshot Example 3"
                width={130}
                height={130}
                className="object-cover w-full h-full"
                loading="lazy"
              />
            </m.div>

            {/* Decorative Background Element for images */}
            <div className="absolute inset-0 m-auto w-[60%] h-[60%] bg-[#0025cc]/5 rounded-full blur-3xl -z-10"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
