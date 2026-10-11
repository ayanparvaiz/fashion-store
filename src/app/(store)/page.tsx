import { Bestsellers } from "@/components/home/bestsellers";
import { CategoryTiles } from "@/components/home/category-tiles";
import { DenimFeature } from "@/components/home/denim-feature";
import { GenderSplit } from "@/components/home/gender-split";
import { HeroSlider } from "@/components/home/hero-slider";
import { NewArrivals } from "@/components/home/new-arrivals";
import { NewsletterBlock } from "@/components/home/newsletter-block";
import { SaleBanner } from "@/components/home/sale-banner";
import { SocialGrid } from "@/components/home/social-grid";

export default function HomePage() {
  return (
    <>
      <h1 className="sr-only">Fashion Store — women&apos;s and men&apos;s fashion in Singapore</h1>
      <HeroSlider />
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
