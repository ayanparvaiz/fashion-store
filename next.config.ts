import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static build (`out/`) so the MVP can be hosted on any static host,
  // including Firebase Hosting on the free Spark plan.
  output: "export",
  trailingSlash: true,
  images: {
    // Product photos are served by the Unsplash CDN, which resizes on the fly.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    // A tighter width ladder keeps srcset attributes (and HTML) small.
    deviceSizes: [640, 828, 1080, 1440, 1920, 2560],
    imageSizes: [96, 192, 256, 384],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
