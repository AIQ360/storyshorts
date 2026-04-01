"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import * as m from "motion/react-client";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";
import { useTranslations } from "next-intl";

const STEP_TIMESTAMPS = [0, 37, 65];

const EditingToolsSection = () => {
  const t = useTranslations("EditingTools");
  const [activeStep, setActiveStep] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);

  const steps = [
    {
      id: 1,
      title: t("step1Title"),
      description: t("step1Desc"),
    },
    {
      id: 2,
      title: t("step2Title"),
      description: t("step2Desc"),
    },
    {
      id: 3,
      title: t("step3Title"),
      description: t("step3Desc"),
    },
  ];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      const currentTime = video.currentTime;
      if (currentTime >= STEP_TIMESTAMPS[2]) {
        setActiveStep(3);
      } else if (currentTime >= STEP_TIMESTAMPS[1]) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => video.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleStepClick = (stepId: number) => {
    setActiveStep(stepId);
    const video = videoRef.current;
    if (video) {
      video.currentTime = STEP_TIMESTAMPS[stepId - 1];
      video.play();
    }
  };

  return (
    <section id="editing-tools" className="py-8 md:py-16">
      <div className="flex flex-col justify-center items-center">
        {/* Section header synced with others */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center md:mb-16 px-4">
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
            className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {t("subtitle")}
          </m.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center px-5 max-w-7xl mx-auto w-full">
          {/* Left Side: Video */}
          <div className="order-1">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200/30 w-full mx-auto shadow-md">
              <video
                ref={videoRef}
                src="/framecast-ai.mp4"
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-auto block"
              />
            </div>
          </div>

          {/* Right Side: Steps */}
          <div className="order-2 lg:pl-10">
            <div className="space-y-8">
              <div className="relative">
                {/* Connecting Line */}
                <div
                  className="absolute left-6 top-0 bottom-0 w-px bg-gray-200/80"
                  aria-hidden="true"
                ></div>

                <ol role="list" className="space-y-8">
                  {steps.map((step) => {
                    const isActive = activeStep === step.id;
                    return (
                      <li
                        key={step.id}
                        className="relative pl-16 cursor-pointer"
                        onClick={() => handleStepClick(step.id)}
                      >
                        <span
                          className={`absolute left-2 top-1 flex h-8 w-8 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition-all duration-300 ${
                            isActive
                              ? "bg-linear-to-r from-[#0025cc] to-[#2b5fff] text-white border-transparent ring-4 ring-blue-100"
                              : "bg-white text-gray-400 border-gray-200"
                          }`}
                        >
                          {step.id}
                        </span>
                        <div>
                          <div
                            className={`text-left text-xl font-bold mb-1 transition-colors duration-300 ${
                              isActive ? "text-blue-600" : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </div>
                          <p
                            className={`leading-relaxed transition-colors duration-300 ${isActive ? "text-gray-600" : "text-gray-400"}`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              {/* Call to Action */}
              <div className="pt-4 lg:pl-16">
                <Link
                  href="/login"
                  className="h-12 px-6 rounded-full font-semibold text-base text-white bg-primary hover:brightness-110 transition-all inline-flex items-center gap-2"
                >
                  {t("cta")}
                  <Sparkles className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default EditingToolsSection;
