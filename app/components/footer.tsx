import Link from "next/link";
import Image from "next/image";
import Logo from "./logo";
import LanguageSelector from "./language-selector";
import { getLocale, getTranslations } from "next-intl/server";

const Footer = async () => {
  const t = await getTranslations("Footer");
  const locale = await getLocale();
  const howItWorksHref = `/${locale}#how-it-works`;
  const examplesHref = `/${locale}#examples`;
  const pricingHref = `/${locale}#pricing`;
  const faqsHref = `/${locale}#faqs`;

  return (
    <footer className="items-center justify-center flex my-0 z-20 bg-[#111111] backdrop-blur-md border-t border-gray-800">
      <div className="w-full lg:max-w-7xl px-8 py-16 mx-auto">
        {/* Top Section */}
        <div className="border-b border-gray-800 pb-10 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12">
            {/* Col 1: Logo & Desc */}
            <div className="flex flex-col">
              <div className="flex items-center mb-6">
                <Link href="/" className="hover:opacity-80 transition-opacity">
                  <Logo variant="white" width={180} />
                </Link>
              </div>
              <p className="text-base leading-relaxed text-gray-400 max-w-xs">
                {t("description")}
              </p>
            </div>

            {/* Col 2: Payment Methods */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {t("paymentMethods")}
                </h3>
                <div className="flex flex-wrap items-center gap-2.5 mt-2">
                  <Image
                    alt="American Express"
                    loading="lazy"
                    width={45}
                    height={28}
                    className="h-8 w-auto shadow-sm rounded-md px-1.5 py-1"
                    src="/assets/trust-badges/american-express.svg"
                  />
                  <Image
                    alt="Visa"
                    loading="lazy"
                    width={45}
                    height={28}
                    className="h-8 w-auto rounded-md shadow-sm px-1.5 py-1"
                    src="/assets/trust-badges/visa.svg"
                  />
                  <Image
                    alt="Mastercard"
                    loading="lazy"
                    width={45}
                    height={28}
                    className="h-8 w-auto rounded-md shadow-sm px-1.5 py-1"
                    src="/assets/trust-badges/mastercard.svg"
                  />
                  <Image
                    alt="Klarna"
                    loading="lazy"
                    width={45}
                    height={28}
                    className="h-8 w-auto rounded-md shadow-sm px-1.5 py-1"
                    src="/assets/trust-badges/klarna.svg"
                  />
                  <Image
                    alt="PayPal"
                    loading="lazy"
                    width={45}
                    height={28}
                    className="h-8 w-auto p-1.5 rounded-md shadow-sm"
                    src="/assets/trust-badges/paypal_lg.svg"
                  />
                </div>
              </div>
            </div>

            {/* Col 3: Language & Copyright */}
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  {t("language")}
                </h3>
                <div className="mt-1 -ml-3">
                  <LanguageSelector variant="dark" />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-sm text-gray-300 leading-relaxed font-medium">
                  {t("copyright", { year: new Date().getFullYear() })}
                  <br />
                  <span className="text-gray-400 font-normal">
                    {t("trademark")}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 lg:gap-12 w-full">
          {/* Product */}
          <div className="mt-0">
            <div className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">
              {t("product")}
            </div>
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href={howItWorksHref}
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("howItWorks")}
                </Link>
              </li>
              <li>
                <Link
                  href={examplesHref}
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("examples")}
                </Link>
              </li>
              <li>
                <Link
                  href={pricingHref}
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("pricing")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="mt-0">
            <div className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">
              {t("resources")}
            </div>
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href="/photo-requirements"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("photoRequirements")}
                </Link>
              </li>
              <li>
                <Link
                  href={faqsHref}
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("faqs")}
                </Link>
              </li>

              <li>
                <Link
                  href="/reviews"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("reviews")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("blog")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="mt-0">
            <div className="text-sm font-semibold leading-6 text-white uppercase tracking-wider">
              {t("company")}
            </div>
            <ul className="mt-6 space-y-4">
              <li>
                <Link
                  href="/terms"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
              <li>
                <Link
                  href="/refund"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("refundPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="text-sm leading-6 text-gray-400 hover:text-white transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
