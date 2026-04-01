"use client";
import Image from "next/image";
import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";

interface CardProps {
  image: string;
  reverse?: boolean;
}

const Card: React.FC<CardProps> = ({ image }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const t = useTranslations("Card");

  return (
    <motion.div
      onHoverStart={() => setShowOverlay(true)}
      onHoverEnd={() => setShowOverlay(false)}
      className="relative overflow-hidden h-50 min-w-50 bg-slate-400 rounded-xl flex justify-center
     items-center"
    >
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex justify-center items-center"
          >
            <div className="absolute bg-black pointer-events-none opacity-50 h-full w-full" />
            <motion.h1
              className="bg-transparent font-semibold text-white text-sm z-10 px-3 py-2 rounded-full flex
               items-center gap-[0.5ch]"
              initial={{ y: 10 }}
              animate={{ y: 0 }}
              exit={{ y: 10 }}
            >
              <span>{t("hoverText")}</span>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
      <Image
        src={image}
        alt="AI generated headshot"
        fill
        style={{ objectFit: "cover" }}
      />
    </motion.div>
  );
};

export default Card;
