import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_SITE_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  output: "export",
  trailingSlash: true,

  images: {
    unoptimized: true
  },

  basePath: basePath || undefined,
  assetPrefix: basePath ? `${basePath}/` : undefined
};

export default nextConfig;
