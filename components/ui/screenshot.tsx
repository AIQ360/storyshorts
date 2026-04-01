"use client";

import { Safari } from "@/components/ui/safari";

interface ScreenshotProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export function Screenshot({ src, alt, width, height }: ScreenshotProps) {
  return (
    <Safari
      imageSrc={src}
      url={alt}
      mode="simple"
      className="my-4 w-full"
      imageWidth={width}
      imageHeight={height}
    />
  );
}
