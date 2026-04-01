import Image from "next/image";

const logos = [
  { src: "/images/company-logos/google.svg", alt: "Google" },
  { src: "/images/company-logos/amazon.svg", alt: "Amazon" },
  { src: "/images/company-logos/hexa.svg", alt: "Hexa" },
  { src: "/images/company-logos/gunzx.svg", alt: "Gunzx" },
  { src: "/images/company-logos/taxada.svg", alt: "Taxada" },
  { src: "/images/company-logos/kanba.svg", alt: "Kanba" },
  { src: "/images/company-logos/publisher_logo.jpg", alt: "Publisher" },
];

const avatars = [
  "/headshots/human1.png",
  "/headshots/human2.png",
  "/headshots/human3.png",
  "/headshots/human4.png",
  "/headshots/human5.png",
];

const LogoSet = () => (
  <div className="flex shrink-0 items-center gap-8">
    {logos.map((logo) => (
      <div
        key={logo.alt}
        className="flex h-10 w-20 shrink-0 items-center justify-center"
      >
        <Image
          src={logo.src}
          alt={logo.alt}
          width={96}
          height={40}
          className="h-7 w-auto select-none object-contain grayscale"
        />
      </div>
    ))}
  </div>
);

const Carousel = ({
  hideAvatars,
  text,
}: {
  hideAvatars?: boolean;
  text?: React.ReactNode;
} = {}) => {
  return (
    <div className="flex w-full flex-col items-center gap-4 pb-4">
      {/* Avatar stack */}
      {!hideAvatars && (
        <div className="flex -space-x-2">
          {avatars.map((src, i) => (
            <Image
              key={i}
              src={src}
              alt="Happy customer"
              width={36}
              height={36}
              className="h-9 w-9 rounded-full border-2 border-white object-cover"
            />
          ))}
        </div>
      )}

      {/* Social proof text */}
      {text ? (
        <div className="text-sm text-muted-foreground">{text}</div>
      ) : (
        <p className="text-sm text-muted-foreground">
          <span className="font-bold">5M+</span> headshots for{" "}
          <span className="font-bold">99,732+</span> happy customers
        </p>
      )}

      {/* Scrolling logo strip */}
      <div className="relative w-full max-w-3xl overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-white to-transparent" />
        <div className="flex w-max animate-[infiniteScroll_60s_linear_infinite] gap-8 opacity-60">
          <LogoSet />
          <LogoSet />
        </div>
      </div>
    </div>
  );
};

export default Carousel;
