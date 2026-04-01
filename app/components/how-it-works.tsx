"use client";

import React from "react";
import Image from "next/image";
import * as m from "motion/react-client";
import Carousel from "./carousel";
import Logo from "./logo";
import { useTranslations } from "next-intl";

const humans = [
  "/headshots/human1.png",
  "/assets/examples/ex-1.jpg",
  "/headshots/human3.png",
  "/assets/examples/ex-3.jpg",
  "/headshots/human5.png",
  "/assets/examples/ex-5.jpg",
  "/headshots/human7.png",
  "/assets/examples/ex-7.jpg",
  "/headshots/human2.png",
  "/assets/examples/ex-9.jpg",
  "/headshots/human4.png",
  "/assets/examples/ex-11.jpg",
];

const humans2 = [
  "/headshots/human9.png",
  "/assets/examples/ex-2.jpg",
  "/headshots/human11.png",
  "/assets/examples/ex-4.jpg",
  "/headshots/human13.png",
  "/assets/examples/ex-6.jpg",
  "/headshots/human15.png",
  "/assets/examples/ex-8.jpg",
  "/headshots/human10.png",
  "/assets/examples/ex-10.jpg",
  "/headshots/human12.png",
  "/assets/examples/ex-12.jpg",
];

const SecondSection = () => {
  const t = useTranslations("HowItWorks");

  return (
    <section id="how-it-works" className="py-8 md:py-16">
      <div className="flex flex-col justify-center items-center">
        {/* Section header */}
        <div className="mx-auto mb-12 flex max-w-2xl flex-col items-center text-center md:mb-16">
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
            </span>{" "}
            {t("titleEnd")}
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

        {/* First step */}
        <div className="relative flex flex-col items-center">
          <div className="bg-linear-to-r from-[#0025cc] to-[#2b5fff] text-white rounded-full h-12 w-12 flex items-center justify-center font-bold z-10">
            1
          </div>
          <div className="-mt-0.5 w-1 h-10 rounded-lg bg-linear-to-b from-[#0025cc] to-transparent"></div>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-2">
          {t("step1Title")}
        </div>
        <div
          className="items-center justify-center flex text-base md:text-lg px-10 text-muted-foreground mt-4 
        max-w-3xl text-center"
        >
          {t("step1Desc")}
        </div>
        {/* Graphic element */}
        <div className="px-2 min-w-fit flex justify-center items-center mt-8">
          <div className="flex flex-row items-center">
            {/* Row with images on left, center, and right */}
            <div className="flex justify-between w-full max-w-7xl">
              {/* Left side */}
              <div className="flex flex-col items-center justify-center">
                <div className="hidden sm:flex-col lg:flex-row sm:flex gap-6 mb-1">
                  {/* Three images up */}
                  <Image
                    src="/avatars/7.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 1"
                  />
                  <Image
                    src="/avatars/1.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 2"
                  />
                  <Image
                    src="/avatars/8.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 3"
                  />
                </div>
                <div className="hidden lg:flex gap-6 mt-6">
                  {/* Three images down */}
                  <Image
                    src="/avatars/4.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 4"
                  />
                  <Image
                    src="/avatars/9.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 5"
                  />
                  <Image
                    src="/avatars/3.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 6"
                  />
                </div>
              </div>

              {/* Center image */}
              <div className="relative mx-8 w-62.5 h-120">
                {/* Image */}
                <Image
                  src="/avatars/phone.svg"
                  fill
                  className="rounded-2xl drop-shadow-2xl object-cover"
                  alt="Center image"
                  loading="eager"
                />

                {/* Video positioned on top of the image */}
                <video
                  src="/avatars/tutorial.mp4"
                  autoPlay
                  loop
                  muted
                  className="absolute top-6 left-1/2 transform -translate-x-1/2 -translate-y-3 w-53 rounded-3xl"
                />
              </div>

              {/* Right side */}
              <div className="flex flex-col items-center justify-center">
                <div className="hidden lg:flex gap-6 mb-1">
                  {/* Three images up */}
                  <Image
                    src="/avatars/5.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 7"
                  />
                  <Image
                    src="/avatars/10.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 8"
                  />
                  <Image
                    src="/avatars/6.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 9"
                  />
                </div>
                <div className="hidden sm:flex-col lg:flex-row sm:flex flex-col gap-6 lg:mt-6">
                  {/* Three images down */}
                  <Image
                    src="/avatars/12.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 10"
                  />
                  <Image
                    src="/avatars/2.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 11"
                  />
                  <Image
                    src="/avatars/11.png"
                    width={105}
                    height={105}
                    className="rounded-2xl shadow-custom-shadow"
                    alt="image 12"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Second step */}
        <div className="relative flex flex-col items-center mt-8">
          <div className="bg-linear-to-r from-[#0025cc] to-[#2b5fff] text-white rounded-full h-12 w-12 flex items-center justify-center font-bold z-10">
            2
          </div>
          <div className="-mt-18.75 w-1 h-28 rounded-lg bg-linear-to-b from-transparent via-[#0025cc] to-transparent bg-size-[100%_100%]"></div>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-2">
          {t("step2Title")}
        </div>
        <div className="items-center justify-center flex text-base md:text-lg px-10 text-muted-foreground mt-4 max-w-3xl text-center">
          {t("step2Desc")}
        </div>
        {/* Second Step Animated Graphic */}
        <div className="w-full max-w-xl mx-auto mt-12 mb-8 px-4">
          <div className="border border-gray-200 rounded-3xl bg-gray-50/50 p-2 shadow-xs">
            <div className="rounded-2xl bg-gray-100/50 relative overflow-hidden flex items-center justify-center border border-gray-100 min-h-105 sm:min-h-125">
              {/* Grid pattern - math notebook style */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Vertical lines */}
                {Array.from({ length: 7 }).map((_, i) => (
                  <div
                    key={`v-${i}`}
                    className="absolute top-0 bottom-0 w-px bg-gray-200/60"
                    style={{ left: `${((i + 1) * 100) / 8}%` }}
                  ></div>
                ))}
                {/* Horizontal lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`h-${i}`}
                    className="absolute left-0 right-0 h-px bg-gray-200/60"
                    style={{ top: `${((i + 1) * 100) / 6}%` }}
                  ></div>
                ))}
              </div>

              {/* Animated processing effect on a single image */}
              <div className="relative flex items-center justify-center w-65 h-80 sm:w-85 sm:h-105 bg-white rounded-2xl z-10 shadow-2xl ring-1 ring-black/10 overflow-hidden">
                {/* High Quality (Base) - Note: also animating to create the white flash between cycles */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden animate-hide-one-third-loop bg-white"
                  style={{ animationDelay: "-2.6s" }}
                >
                  <Image
                    src="/assets/examples/ex-6.jpg"
                    alt="AI processing final"
                    fill
                    className="absolute inset-0 w-full h-full object-cover shrink-0 rounded-2xl"
                  />
                </div>

                {/* Medium Pixelation */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden animate-hide-one-third-loop bg-white"
                  style={{ animationDelay: "-1.3s" }}
                >
                  <Image
                    src="/assets/examples/ex-6.jpg"
                    alt="AI processing step 2"
                    width={48}
                    height={60}
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>

                {/* Heavy Pixelation */}
                <div
                  className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden animate-hide-one-third-loop bg-white"
                  style={{ animationDelay: "0s" }}
                >
                  <Image
                    src="/assets/examples/ex-6.jpg"
                    alt="AI processing step 1"
                    width={16}
                    height={20}
                    className="w-full h-full object-cover rounded-2xl"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Third step */}
        <div className="relative flex flex-col items-center mt-6">
          <div className="bg-linear-to-r from-[#0025cc] to-[#2b5fff] text-white rounded-full h-12 w-12 flex items-center justify-center font-bold z-10">
            3
          </div>
          <div className="-mt-22.5 w-1 h-14 rounded-lg bg-linear-to-b from-transparent to-[#0025cc]"></div>
        </div>
        <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-10">
          {t("step3Title")}
        </div>
        <div className="items-center justify-center flex text-base md:text-lg px-10 text-muted-foreground mt-4 max-w-3xl text-center">
          {t("step3Desc")}
        </div>
        <div className="animate-fadeIn container mx-auto pt-10">
          <Carousel images={humans} />
          <Carousel images={humans2} reverse={true} />
        </div>
        <div className="items-center justify-center flex text-sm px-10 pb-6 leading-relaxed uppercase text-muted-foreground">
          {t("resultsAlt")}
        </div>

        {/* Comparison Cards */}
        <div className="relative flex w-full max-w-6xl px-5 pt-14 text-black items-stretch justify-center mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full relative">
            {/* Framecast AI Card */}
            <div className="w-full h-full rounded-2xl border border-blue-200/70 bg-white p-6 md:p-8 shadow-[0_10px_30px_-12px_rgba(0,37,204,0.30)] transition-shadow duration-300">
              <div className="inline-flex items-center rounded-lg bg-linear-to-r from-[#0025cc] to-[#2b5fff] pr-4 pl-3 py-1.5 text-white">
                <div className="flex items-center">
                  <Logo
                    variant="white"
                    width={110}
                    height={20}
                    sparkleSize={18}
                  />
                </div>
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900">
                {t("comparisonTitle")}
              </p>
              <ul className="mt-5 space-y-3 text-base font-normal text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 ring-1 ring-green-200 text-green-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.42 0L3.29 9.847a1 1 0 1 1 1.42-1.414l3.09 3.09 6.36-6.36a1 1 0 0 1 1.544.127z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span>{t("comparisonItem1")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 ring-1 ring-green-200 text-green-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.42 0L3.29 9.847a1 1 0 1 1 1.42-1.414l3.09 3.09 6.36-6.36a1 1 0 0 1 1.544.127z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span>{t("comparisonItem2")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 ring-1 ring-green-200 text-green-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.42 0L3.29 9.847a1 1 0 1 1 1.42-1.414l3.09 3.09 6.36-6.36a1 1 0 0 1 1.544.127z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span>{t("comparisonItem3")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-50 ring-1 ring-green-200 text-green-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.07 7.07a1 1 0 0 1-1.42 0L3.29 9.847a1 1 0 1 1 1.42-1.414l3.09 3.09 6.36-6.36a1 1 0 0 1 1.544.127z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                  </span>
                  <span>{t("comparisonItem4")}</span>
                </li>
              </ul>
              <div className="mt-6 flex flex-wrap gap-2">
                <span className="bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {t("badgeNoScheduling")}
                </span>
                <span className="bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {t("badgeNoStudio")}
                </span>
                <span className="bg-blue-50 text-blue-800 text-sm font-medium px-3 py-1.5 rounded-full">
                  {t("badgeFaster")}
                </span>
              </div>
            </div>

            {/* Traditional Photoshoot Card */}
            <div className="w-full h-full rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-[0_8px_28px_-12px_rgba(0,0,0,0.15)] transition-shadow duration-300">
              <p className="text-xl font-bold text-gray-900 mt-1">
                {t("traditionalTitle")}
              </p>
              <ul className="mt-5 space-y-3 text-base font-normal text-gray-700">
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem1")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem2")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem3")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem4")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem5")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem6")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem7")}</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-50 ring-1 ring-gray-200 text-gray-600 shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z"></path>
                    </svg>
                  </span>
                  <span>{t("traditionalItem8")}</span>
                </li>
              </ul>
            </div>

            {/* VS Badge */}
            <div className="pointer-events-none hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 items-center justify-center">
              <div className="relative h-full">
                <div className="absolute inset-0 w-px bg-linear-to-b from-transparent via-gray-200 to-transparent"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="rounded-full bg-white/90 backdrop-blur-sm px-2 py-1 text-[10px] font-bold tracking-wider text-gray-600 border border-gray-200/80 shadow-sm">
                    {t("vs")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="flex w-full max-w-6xl px-5 pt-16 pb-16 text-black items-start justify-center mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10 w-full px-2">
            {/* Review 1 */}
            <div className="flex items-start gap-4">
              <div className="relative aspect-square w-12 h-12 shrink-0">
                <Image
                  alt={t("testimonialAlt")}
                  className="rounded-full object-cover object-top"
                  sizes="48px"
                  src="/assets/examples/ex-4.jpg"
                  fill
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <div className="inline-flex px-1.5 py-0.5 rounded-sm items-center gap-0.5 bg-[#FFFCF2] border border-[#FFEDB7]">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#FBBC05"
                          className="w-4 h-4"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic text-[15px] leading-relaxed">
                  &quot;{t("testimonial1Text")}&quot;
                </p>
                <div className="text-left mt-1">
                  <div className="font-bold text-gray-800 text-[13px]">
                    {t("testimonial1Name")}
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("testimonial1Role")}
                  </p>
                </div>
              </div>
            </div>

            {/* Review 2 */}
            <div className="flex items-start gap-4">
              <div className="relative aspect-square w-12 h-12 shrink-0">
                <Image
                  alt={t("testimonialAlt")}
                  className="rounded-full object-cover object-top"
                  sizes="48px"
                  src="/assets/examples/ex-9.jpg"
                  fill
                />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center">
                  <div className="inline-flex px-1.5 py-0.5 rounded-sm items-center gap-0.5 bg-[#FFFCF2] border border-[#FFEDB7]">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="#FBBC05"
                          className="w-4 h-4"
                        >
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 italic text-[15px] leading-relaxed">
                  &quot;{t("testimonial2Text")}&quot;
                </p>
                <div className="text-left mt-1">
                  <div className="font-bold text-gray-800 text-[13px]">
                    {t("testimonial2Name")}
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {t("testimonial2Role")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SecondSection;
