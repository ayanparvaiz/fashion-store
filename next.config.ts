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
