"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import "maplibre-gl/dist/maplibre-gl.css";

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

/**
 * Empty Toronto canvas. Pins wait on PostGIS ingest. MapLibre is imported
 * inside the effect so Turbopack never evaluates it on the server.
 */
export function MapCanvas() {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<{ remove: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const container = ref.current;
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
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

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
