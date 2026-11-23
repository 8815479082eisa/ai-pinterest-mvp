/**
 * Base URL of the public Cloudflare R2 bucket that hosts all images.
 * Set IMAGE_BASE_URL in Vercel (and in .env.local) to your r2.dev URL
 * or custom domain, e.g. https://pub-xxxxxxxx.r2.dev
 */
export const IMAGE_BASE_URL = (
  process.env.IMAGE_BASE_URL ?? "https://pub-REPLACE-ME.r2.dev"
).replace(/\/$/, "");

export const imageUrl = (path: string) => `${IMAGE_BASE_URL}/${path}`;
