package wayfinder.space;

import org.junit.jupiter.api.Test;
import wayfinder.space.map.MapViewport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SpaceApplicationTests {

  @Test
  void viewportIsDowntownToronto() {
    MapViewport v = MapViewport.TORONTO;
    assertEquals(43.6532, v.lat(), 0.0001);
    assertEquals(-79.3832, v.lng(), 0.0001);
    assertTrue(v.southwest()[0] < v.lat());
    assertTrue(v.northeast()[0] > v.lat());
    assertTrue(v.southwest()[1] < v.lng());
    assertTrue(v.northeast()[1] > v.lng());
  }
}
