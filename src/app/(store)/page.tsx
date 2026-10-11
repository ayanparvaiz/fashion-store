import { Bestsellers } from "@/components/home/bestsellers";
import { CategoryTiles } from "@/components/home/category-tiles";
import { DenimFeature } from "@/components/home/denim-feature";
import { GenderSplit } from "@/components/home/gender-split";
import { Hero3D } from "@/components/home/hero-3d/hero-3d";
import { NewArrivals } from "@/components/home/new-arrivals";
import { NewsletterBlock } from "@/components/home/newsletter-block";
import { SaleBanner } from "@/components/home/sale-banner";
import { SocialGrid } from "@/components/home/social-grid";
import { Preloader, PreloaderGate } from "@/components/motion/preloader";

export default function HomePage() {
  return (
    <>
      <PreloaderGate />
      <Preloader />
      <Hero3D />
      <CategoryTiles />
      <NewArrivals />
      <SaleBanner />
      <GenderSplit />
      <Bestsellers />
      <DenimFeature />
      <SocialGrid />
      <NewsletterBlock />
    </>
  );
}
