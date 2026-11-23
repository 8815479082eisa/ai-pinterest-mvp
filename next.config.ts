import type { NextConfig } from "next";

// Images are served only from the public Cloudflare R2 bucket (see lib/config.ts).
const imageBase = new URL(process.env.IMAGE_BASE_URL ?? "https://pub-REPLACE-ME.r2.dev");

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: [
      {
        protocol: imageBase.protocol.replace(":", "") as "http" | "https",
        hostname: imageBase.hostname,
        port: imageBase.port,
        pathname: "/**",
      },
    ],
    qualities: [75, 85],
    // Only for testing against a local image server (LOCAL_PREVIEW=1). Off on Vercel.
    dangerouslyAllowLocalIP: process.env.LOCAL_PREVIEW === "1",
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
