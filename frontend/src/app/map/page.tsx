"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { MapCanvas } from "@/components/map/MapCanvas";
import { RestaurantSidebar } from "@/components/map/RestaurantSidebar";
import { RestaurantFilterBar, type FilterValue } from "@/components/map/RestaurantFilterBar";
import { DEMO_RESTAURANTS } from "@/lib/demo-restaurants";

export default function MapPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterValue>("all");

  const restaurants = useMemo(
    () =>
      filter === "all" ? DEMO_RESTAURANTS : DEMO_RESTAURANTS.filter((r) => r.dietaryStatus === filter),
    [filter],
  );

  const selected = restaurants.find((r) => r.id === selectedId) ?? null;

  function handleFilterChange(next: FilterValue) {
    setFilter(next);
    setSelectedId(null);
  }

  return (
    <div className="relative h-[100dvh] overflow-hidden bg-cream">
      <MapCanvas restaurants={restaurants} selectedId={selectedId} onSelectRestaurant={setSelectedId} />

      <header className="absolute inset-x-0 top-0 z-20 flex h-16 items-center justify-between px-4 sm:px-6">
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

      <RestaurantFilterBar value={filter} onChange={handleFilterChange} />

      <RestaurantSidebar restaurant={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
