package wayfinder.space.map;

/**
 * Hard-locked downtown Toronto viewport. Places come from PostGIS later;
 * this object is the map shell, not a pin payload.
 */
public record MapViewport(
    double lat,
    double lng,
    double zoom,
    double minZoom,
    double maxZoom,
    double[] southwest,
    double[] northeast
) {
  public static final MapViewport TORONTO = new MapViewport(
      43.6532,
      -79.3832,
      12,
      10,
      16,
      new double[] {43.5810, -79.6393},
      new double[] {43.8555, -79.1169}
  );
}
