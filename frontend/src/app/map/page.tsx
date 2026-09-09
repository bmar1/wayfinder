import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MapCanvas } from "@/components/map/MapCanvas";

export default function MapPage() {
  return (
    <div className="relative h-[100dvh] overflow-hidden bg-cream">
      <MapCanvas />

      <header className="absolute inset-x-0 top-0 z-10 flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="rounded-[var(--radius-pill)] bg-cream/90 px-3 py-2 shadow-[0_8px_24px_rgba(59,42,34,0.12)] backdrop-blur-md"
        >
          <Logo />
        </Link>
        <p className="rounded-[var(--radius-pill)] bg-cream/90 px-4 py-2 font-display text-sm font-semibold text-espresso shadow-[0_8px_24px_rgba(59,42,34,0.12)] backdrop-blur-md">
          Toronto
        </p>
      </header>
    </div>
  );
}
