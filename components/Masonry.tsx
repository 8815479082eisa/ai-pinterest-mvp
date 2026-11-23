/** Pinterest-style masonry using CSS columns — no JavaScript needed. */
export default function Masonry({ children }: { children: React.ReactNode }) {
  return (
    <div className="columns-2 gap-4 sm:gap-6 md:columns-3 xl:columns-4">{children}</div>
  );
}
