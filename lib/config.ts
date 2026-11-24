/**
 * Images live in public/images and are served directly by Vercel.
 * To move them to a CDN later, only this function needs to change.
 */
export const imageUrl = (path: string) => `/images/${path}`;
