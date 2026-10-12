# Fashion Store

A modern fashion e-commerce storefront and admin panel for women's and men's clothing in Singapore. It has an interactive 3D landing page, editorial motion design, 492 products across 20 categories, Cash on Delivery checkout and a full admin dashboard.

![Fashion Store landing page with the 3D product ring](docs/screenshots/hero-3d.jpg)

> **MVP status:** This build runs entirely in the browser and has no backend. Orders, product edits, accounts and settings are saved in the visitor's browser (localStorage), so you can try every flow end to end. The data layer is isolated so it can be moved to Firebase (Firestore, Auth, Storage) without rewriting the UI. See [Going live](#going-live-with-firebase).

## Try it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

| What | Where | Login |
| --- | --- | --- |
| Storefront | `/` | — |
| Admin panel | `/admin` | `admin@fashionstore.sg` / `admin123` |

Discount codes to try at checkout: `WELCOME10` (10% off), `FLASH10` (flash sale, 10% off), `STYLE20` (20% off over S$120), `SAVE15` (S$15 off over S$100), `FREESHIP`.

## Features

### Experience and motion
- **Intro:** a once-per-session brand preloader with rising letters, a 0–100 counter and a curtain reveal
- **3D hero:** a WebGL ring of product photos (three.js and React Three Fiber). Visitors can drag it, it reacts to scroll speed with a fabric-like ripple, the camera follows the pointer, and clicking a panel opens that product. Browsers without WebGL see a static photo layout instead.
- **Scroll motion:** smooth scrolling (Lenis), headings that reveal line by line, image wipes, parallax and staggered product grids (GSAP ScrollTrigger)
- **Pinned lookbook:** six looks that scroll sideways on desktop, each with "shop the look" product chips
- **Editorial category index:** large type rows with a photo that follows the cursor
- **Details:** a scroll-reactive marquee, a labelled custom cursor, 3D tilt and glare on product cards, and page transitions where the product photo morphs into the product page (View Transitions API)
- **Accessibility:** every animation is switched off when the visitor's system asks for reduced motion

![Intro preloader](docs/screenshots/intro.jpg)

### Storefront
- **Catalogue:** 492 products. Women: dresses, tops, skirts, jeans, shorts, hoodies, knitwear, denim jackets, jackets and coats, activewear. Men: T-shirts, shirts, polos, hoodies, knitwear, denim jackets, outerwear, jeans, pants, shorts.
- **Home page:** 3D hero, category index, New Arrivals (Women/Men tabs), lookbook, flash sale countdown, sale banner, Women/Men tiles, Bestsellers, Denim edit, social grid and newsletter signup
- **Collections:** 26 collections, each with filters for category, size, colour family, price, in-stock and on-sale. Sorting, "load more" and a mobile filter drawer are included.
- **Quick View:** pick a size and add to bag from any product card or lookbook chip without leaving the page
- **Product pages:** swipeable gallery with zoom, size selector with low-stock alerts, a "Find my size" quiz (height, weight and fit), size guide, "notify me" for sold-out sizes, a live viewer count, delivery-date estimate, fabric and care details, "Complete the look" bundles, reviews with "write a review", recommendations and recently viewed. A sticky add-to-bag bar appears on mobile.
- **Conversion features:** daily flash sale countdown (`FLASH10`), first-visit 10% welcome offer with exit intent, and "someone in Tampines just bought…" purchase notices that visitors can dismiss
- **Search:** instant search overlay with popular searches, plus a full results page with filters
- **Bag:** slide-out drawer and a full bag page, free-delivery progress bar and discount codes
- **Checkout:** distraction-free layout with Singapore phone and postal-code validation, Standard or Express delivery, and **Cash on Delivery**. Cards and PayNow are shown as "coming soon".
- **After purchase:** order confirmation, status timeline and an order tracker that looks orders up by number plus email or phone
- **Accounts:** sign up, sign in, order history and a saved address
- **Content pages:** Lookbook, About, Contact, FAQ, Shipping, Returns, Size Guide, Privacy, Terms and Photo Credits
- **Quality:** fully responsive, keyboard accessible, SEO metadata, Product JSON-LD, sitemap, robots.txt and an Open Graph image

### Admin panel (`/admin`)
- **Dashboard:** revenue, orders, average order value and items sold, each compared with the previous period. Includes a daily revenue chart (with a table view), sales by category, orders awaiting confirmation, top products, low-stock alerts and back-in-stock requests.
- **Orders:** status tabs, search and CSV export. The order drawer has a confirm → ship → deliver workflow, cancel with automatic restock, a printable invoice, and one-tap call or WhatsApp to the customer.
- **Products:** search and filter the catalogue, then add, edit or delete products. You can set pricing and sale prices, stock per size, draft or active status, and New/Bestseller flags. Images can be uploaded or added by URL. Changes show on the storefront instantly.
- **Customers:** list built from orders, showing lifetime spend, with CSV export
- **Discounts:** create, toggle and delete percentage, fixed-amount and free-delivery codes
- **Settings:** announcement bar messages, delivery fees, free-delivery threshold, a Cash on Delivery switch, store contact details and a demo data reset

<table>
  <tr>
    <td><img src="docs/screenshots/category-index.jpg" alt="Category index with cursor-follow preview"></td>
    <td><img src="docs/screenshots/lookbook.jpg" alt="Pinned horizontal lookbook"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/quick-view.jpg" alt="Quick View modal"></td>
    <td><img src="docs/screenshots/complete-the-look.jpg" alt="Complete the look bundle"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/product.jpg" alt="Product page"></td>
    <td><img src="docs/screenshots/collection.jpg" alt="Collection page with filters"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/admin-dashboard.jpg" alt="Admin dashboard"></td>
    <td><img src="docs/screenshots/admin-orders.jpg" alt="Admin order management"></td>
  </tr>
  <tr>
    <td><img src="docs/screenshots/checkout.jpg" alt="Cash on Delivery checkout"></td>
    <td>
      <img src="docs/screenshots/mobile-home.jpg" alt="Mobile home page" width="49%">
      <img src="docs/screenshots/mobile-categories.jpg" alt="Mobile category index" width="49%">
    </td>
  </tr>
</table>

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router) with React 19 and TypeScript
- Tailwind CSS v4
- [three.js](https://threejs.org) with [React Three Fiber](https://r3f.docs.pmnd.rs) for the 3D hero (custom GLSL shaders)
- [GSAP](https://gsap.com) (ScrollTrigger, SplitText) and [Lenis](https://lenis.darkroom.engineering) for motion and smooth scrolling
- [Zustand](https://zustand.docs.pmnd.rs) for state (bag, wishlist, orders, catalogue edits), persisted to localStorage
- [Lucide](https://lucide.dev) icons
- Static export (`output: "export"`), so the site can be hosted on any static host, including Firebase Hosting on the free plan
- Product and campaign photography from [Unsplash](https://unsplash.com), served from their CDN

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Build the static site into `out/` |
| `npm run lint` | Lint the code |
| `npm run fetch:images` | Re-fetch candidate photos from Unsplash (needs `UNSPLASH_ACCESS_KEY`, see `.env.example`) |
| `python3 scripts/curate-expansion.py` | Turn the reviewed photo picks (`scripts/expansion-picks.json`) into named, coloured and priced products |
| `npm run build:catalog` | Regenerate `src/data/products.json` from the curated picks |

## Project structure

```
src/
  app/
    (store)/          storefront routes (home, collections, products, cart, account…)
    checkout/         checkout with its own minimal layout
    admin/            admin panel routes
  components/         UI grouped by area (layout, product, cart, home, admin…)
  data/               seed catalogue (492 products) and photo metadata
  lib/
    store/            Zustand stores: the data layer to swap for Firebase
    services/         checkout and order lookup ("backend" logic)
    motion.ts         GSAP, ScrollTrigger and Lenis setup shared by animations
    catalog.ts        product helpers and image crops
    pricing.ts        subtotal, discounts and delivery rules
scripts/              Unsplash fetch, photo curation and catalogue builder
```

## Deploy (Firebase Hosting)

```bash
npm run build
firebase login
firebase use --add            # pick or create the Firebase project
firebase deploy --only hosting
```

`firebase.json` is already set up to serve `out/` with trailing slashes, long-term caching for static assets and the custom 404 page.

## Going live with Firebase

The MVP keeps all backend concerns in `src/lib/store/*` and `src/lib/services/*`. To go live:

1. **Auth:** replace the demo accounts and admin login (`src/lib/store/auth.ts`) with Firebase Authentication. Use custom claims for admin users.
2. **Firestore:** move `products`, `orders`, `discounts` and `settings` into collections. Swap the Zustand stores for Firestore reads and real-time listeners.
3. **Orders:** turn `placeOrder()` into a Cloud Function (or Firestore transaction) that re-checks prices and stock on the server.
4. **Storage:** upload product images to Cloud Storage instead of data URLs (`src/lib/image-upload.ts`).
5. **Notifications:** send order confirmation emails, plus Telegram or WhatsApp alerts to the store team for new orders.
6. **Payments:** add card and PayNow (for example via Stripe) alongside Cash on Delivery.

## Credits

Photography by the talented creators on [Unsplash](https://unsplash.com). Each photographer is listed on the in-store [Photo credits](src/app/(store)/credits/page.tsx) page. Brand, copy and design are original; the visual direction is inspired by contemporary fast-fashion retailers.
