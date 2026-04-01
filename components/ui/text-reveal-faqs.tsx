"use client";

import * as m from "motion/react-client";

export const BlurredStagger = ({ text }: { text: string }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  const letterAnimation = {
    hidden: {
      opacity: 0,
      filter: "blur(10px)",
    },
    show: {
      opacity: 1,
      filter: "blur(0px)",
    },
  };

  return (
    <div className="w-full">
      <m.p
        variants={container}
        initial="hidden"
        animate="show"
        className="text-base leading-relaxed wrap-break-word whitespace-normal"
      >
        {text.split("").map((char, index) => (
          <m.span
            key={index}
            variants={letterAnimation}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            {char === " " ? "\u00A0" : char}
          </m.span>
        ))}
      </m.p>
    </div>
  );
};
