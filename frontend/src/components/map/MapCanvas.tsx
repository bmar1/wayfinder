"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { DemoRestaurant } from "@/lib/demo-restaurants";
import { createPinElement, getPinDot, updatePinElement } from "@/lib/map-pin";
import { createHoverCard } from "@/lib/map-hover-card";

type Viewport = {
  lat: number;
  lng: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
  southwest: number[];
  northeast: number[];
};

const TORONTO: Viewport = {
  lat: 43.6532,
  lng: -79.3832,
  zoom: 12,
  minZoom: 10,
  maxZoom: 16,
  southwest: [43.581, -79.6393],
  northeast: [43.8555, -79.1169],
};

function toLngLat(latLng: number[]): [number, number] {
  return [latLng[1], latLng[0]];
}

/** Minimal shape of the dynamically-imported maplibre-gl module this file needs beyond `Map`. */
type MapLibreGL = {
  Marker: new (options?: { element?: HTMLElement }) => MapLibreMarker;
  Popup: new (options?: { closeButton?: boolean; closeOnClick?: boolean; offset?: number }) => MapLibrePopup;
};

type MapCanvasProps = {
  restaurants: DemoRestaurant[];
  selectedId: string | null;
  onSelectRestaurant: (id: string) => void;
};

/**
 * Toronto canvas with demo restaurant pins. MapLibre is imported inside the
 * effect so Turbopack never evaluates it on the server. Markers are synced
 * to the (possibly filtered) `restaurants` prop, so toggling a filter
 * adds/removes pins instead of just hiding them.
 */
export function MapCanvas({ restaurants, selectedId, onSelectRestaurant }: MapCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const glRef = useRef<MapLibreGL | null>(null);
  const markersRef = useRef<Map<string, MapLibreMarker>>(new Map());
  const hoverPopupRef = useRef<MapLibrePopup | null>(null);
  const onSelectRef = useRef(onSelectRestaurant);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    onSelectRef.current = onSelectRestaurant;
  }, [onSelectRestaurant]);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const container = ref.current;
    const markers = markersRef.current;
    let cancelled = false;

    async function boot() {
      let viewport = TORONTO;
      try {
        const res = await fetch("/api/map");
        if (res.ok) {
          const body = (await res.json()) as { viewport: Viewport };
          viewport = body.viewport;
        }
      } catch {
        // Backend optional for the mock shell.
      }
      if (cancelled || !container) return;

      const maplibre = await import("maplibre-gl");
      const maplibregl = maplibre.default ?? maplibre;
      glRef.current = maplibregl as unknown as MapLibreGL;

      const map = new maplibregl.Map({
        container,
        style: "https://tiles.openfreemap.org/styles/positron",
        center: [viewport.lng, viewport.lat],
        zoom: viewport.zoom,
        minZoom: viewport.minZoom,
        maxZoom: viewport.maxZoom,
        maxBounds: [toLngLat(viewport.southwest), toLngLat(viewport.northeast)],
        attributionControl: false,
      });

      map.on("error", (err: { error?: Error }) => {
        console.error(err.error ?? err);
      });

      map.addControl(
        new maplibregl.AttributionControl({ compact: true }),
        "bottom-right",
      );
      map.addControl(
        new maplibregl.NavigationControl({ showCompass: false }),
        "bottom-right",
      );

      map.on("load", () => {
        map.resize();
        setReady(true);
      });

      mapRef.current = map;
    }

    void boot();

    return () => {
      cancelled = true;
      hoverPopupRef.current?.remove();
      markers.forEach((marker) => marker.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Sync markers to the (filtered) restaurant list, keep selection styling
  // current, and fly to the selected restaurant.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = glRef.current;
    if (!map || !maplibregl || !ready) return;

    const markers = markersRef.current;
    const currentIds = new Set(restaurants.map((r) => r.id));

    // Drop markers for restaurants no longer in the (filtered) list.
    markers.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    });

    // Add markers for restaurants that don't have one yet.
    restaurants.forEach((restaurant, index) => {
      if (markers.has(restaurant.id)) return;

      const el = createPinElement(restaurant.dietaryStatus, restaurant.id === selectedId);
      const dot = getPinDot(el);
      dot.style.opacity = reduce ? "1" : "0";
      dot.style.transform = reduce ? "scale(1)" : "scale(0.4)";

      el.addEventListener("click", () => onSelectRef.current(restaurant.id));
      el.addEventListener("mouseenter", () => {
        if (!hoverPopupRef.current) {
          hoverPopupRef.current = new maplibregl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 18,
          });
        }
        hoverPopupRef.current
          .setLngLat([restaurant.lng, restaurant.lat])
          .setDOMContent(createHoverCard(restaurant))
          .addTo(map);
      });
      el.addEventListener("mouseleave", () => {
        hoverPopupRef.current?.remove();
      });

      const marker = new maplibregl.Marker({ element: el }).setLngLat([restaurant.lng, restaurant.lat]).addTo(map);
      markers.set(restaurant.id, marker);

      // pinEnter: staggered arrival reads as "results arriving," not a layout jump.
      if (!reduce) {
        window.setTimeout(() => {
          dot.style.opacity = "1";
          dot.style.transform = "scale(1)";
        }, index * 40);
      }
    });

    // Update every visible marker's selected styling.
    markers.forEach((marker, id) => {
      const restaurant = restaurants.find((r) => r.id === id);
      if (!restaurant) return;
      updatePinElement(marker.getElement() as HTMLDivElement, restaurant.dietaryStatus, id === selectedId);
    });

    const selected = restaurants.find((r) => r.id === selectedId);
    if (selected && markers.has(selected.id)) {
      if (reduce) {
        map.jumpTo({ center: [selected.lng, selected.lat], zoom: 15 });
      } else {
        map.flyTo({ center: [selected.lng, selected.lat], zoom: 15, essential: true });
      }
    }
  }, [restaurants, selectedId, ready, reduce]);

  return (
    <>
      <div className="absolute inset-0">
        <div ref={ref} className="h-full w-full" />
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-cream/15"
      />
      {!ready && (
        <div className="absolute inset-0 z-[1] flex items-center justify-center bg-cream">
          <span
            className={`h-10 w-10 rounded-full border-[3px] border-harbour/25 border-t-harbour ${reduce ? "" : "animate-spin"}`}
          />
        </div>
      )}
    </>
  );
}
