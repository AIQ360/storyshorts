"use client";

import Image from "next/image";
import { Sparkles } from "@/components/animate-ui/icons/sparkles";

interface LogoProps {
  variant?: "black" | "white";
  width?: number;
  height?: number;
  sparkleSize?: number;
  className?: string;
}

const Logo = ({
  variant = "black",
  width = 160,
  height = 160,
  sparkleSize = 28,
  className = "",
}: LogoProps = {}) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Sparkles
        className={variant === "white" ? "text-white" : "text-primary"}
        size={sparkleSize}
        animate
        loop
        loopDelay={1500}
      />
      <Image
        src={
          variant === "white"
            ? "/assets/logo-white.svg"
            : "/assets/logo-black.svg"
        }
        height={height}
        width={width}
        alt="logo"
        loading="eager"
      />
    </div>
  );
};

export default Logo;
