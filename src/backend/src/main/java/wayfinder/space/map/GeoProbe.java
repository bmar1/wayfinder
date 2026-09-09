package wayfinder.space.map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

@Service
public class GeoProbe {
  private final JdbcTemplate jdbc;

  public GeoProbe(JdbcTemplate jdbc) {
    this.jdbc = jdbc;
  }

  public String postgisVersion() {
    return jdbc.queryForObject("select PostGIS_Version()", String.class);
  }

  public long placeCount() {
    Long count = jdbc.queryForObject("select count(*) from restaurants", Long.class);
    return count == null ? 0 : count;
  }
}
