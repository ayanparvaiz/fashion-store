import { Bestsellers } from "@/components/home/bestsellers";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { DenimFeature } from "@/components/home/denim-feature";
import { GenderSplit } from "@/components/home/gender-split";
import { Hero3D } from "@/components/home/hero-3d/hero-3d";
import { Lookbook } from "@/components/home/lookbook";
import { NewArrivals } from "@/components/home/new-arrivals";
import { NewsletterBlock } from "@/components/home/newsletter-block";
import { SaleBanner } from "@/components/home/sale-banner";
import { SocialGrid } from "@/components/home/social-grid";
import { Marquee } from "@/components/motion/marquee";
import { Preloader, PreloaderGate } from "@/components/motion/preloader";

export default function HomePage() {
  return (
    <>
      <PreloaderGate />
      <Preloader />
      <Hero3D />
      <Marquee items={["New drops every Friday", "492 styles", "Free delivery over S$80", "Cash on delivery"]} />
      <CategoryShowcase />
      <NewArrivals />
      <Lookbook />
      <SaleBanner />
      <GenderSplit />
      <Bestsellers />
      <Marquee tone="accent" speed={50} items={["Women", "Men", "Denim", "Knitwear", "Activewear", "Outerwear"]} />
      <DenimFeature />
      <SocialGrid />
      <NewsletterBlock />
    </>
  );
}
