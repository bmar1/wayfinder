/**
 * Wayfinder mark: a compass needle inside a ring. Hand-drawn as a single
 * simple geometric shape (skill Section 4.8 exception: invented brand name,
 * simple geometric mark, done with intent), not a decorative illustration.
 * Two-tone in the locked palette so it reads correctly at 20-40px in the nav.
 */
export function LogoMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <circle cx="20" cy="20" r="18.5" stroke="currentColor" strokeWidth="2" className="text-espresso" />
      <path d="M20 6 L25 20 L20 20 Z" className="fill-harbour" />
      <path d="M20 34 L15 20 L20 20 Z" className="fill-espresso" />
      <path d="M6 20 L20 17 L20 20 Z" className="fill-espresso/40" />
      <path d="M34 20 L20 23 L20 20 Z" className="fill-espresso/40" />
      <circle cx="20" cy="20" r="2.25" className="fill-cream" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
