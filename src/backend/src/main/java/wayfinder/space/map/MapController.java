package wayfinder.space.map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MapController {
  private final GeoProbe geo;

  public MapController(GeoProbe geo) {
    this.geo = geo;
  }

  @GetMapping("/api/map")
  public MapBootstrap bootstrap() {
    return new MapBootstrap(
        MapViewport.TORONTO,
        new GeoStatus(geo.postgisVersion(), geo.placeCount())
    );
  }

  public record GeoStatus(String postgisVersion, long places) {}

  public record MapBootstrap(MapViewport viewport, GeoStatus geo) {}
}
