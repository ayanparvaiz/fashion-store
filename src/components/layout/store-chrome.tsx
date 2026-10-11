import { CartDrawer } from "@/components/cart/cart-drawer";
import { Cursor } from "@/components/motion/cursor";
import { PageTransition } from "@/components/motion/page-transition";
import { SmoothScroll } from "@/components/motion/smooth-scroll";
import { QuickView } from "@/components/product/quick-view";
import { RecentPurchases } from "@/components/marketing/social-proof";
import { WelcomePopup } from "@/components/marketing/welcome-popup";
import { AnnouncementBar } from "./announcement-bar";
import { Footer } from "./footer";
import { Header } from "./header";
import { MobileMenu } from "./mobile-menu";
import { SearchOverlay } from "./search-overlay";

/** Header, footer and global drawers shared by every storefront page. */
export function StoreChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to content
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <SmoothScroll />
      <Cursor />
      <QuickView />
      <RecentPurchases />
      <WelcomePopup />
      <CartDrawer />
      <MobileMenu />
      <SearchOverlay />
    </>
  );
}
