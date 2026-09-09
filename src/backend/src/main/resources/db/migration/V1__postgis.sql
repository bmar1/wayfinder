-- PostGIS + empty place table. No seed rows: the map ships with zero pins.
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id text UNIQUE,
  zabihah_place_id text UNIQUE,
  name text NOT NULL,
  address text,
  city text,
  state text,
  country text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  geo geography(Point, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography
  ) STORED,
  price_level smallint,
  photo_url text,
  phone text,
  website text,
  zabihah_url text,
  match_status text NOT NULL DEFAULT 'unmatched'
    CHECK (match_status IN ('unmatched', 'auto', 'admin', 'conflict')),
  match_confidence real,
  last_enriched_at timestamptz,
  last_zabihah_sync_at timestamptz,
  zabihah_snapshot jsonb,
  zabihah_snapshot_fetched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX restaurants_geo_gix ON restaurants USING GIST (geo);
CREATE INDEX restaurants_name_trgm ON restaurants USING GIST (name gist_trgm_ops);

CREATE TABLE dietary_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id uuid NOT NULL REFERENCES restaurants (id) ON DELETE CASCADE,
  tag_type text NOT NULL CHECK (tag_type IN ('halal', 'kosher', 'vegetarian', 'vegan', 'low_calorie')),
  status text NOT NULL CHECK (status IN ('verified', 'likely', 'unchecked', 'false')),
  confidence_score real,
  verified_source text CHECK (verified_source IS NULL OR verified_source = 'zabihah'),
  likely_sources text[],
  last_verified_at timestamptz,
  last_checked_at timestamptz,
  check_attempts integer NOT NULL DEFAULT 0,
  note text,
  UNIQUE (restaurant_id, tag_type)
);

CREATE INDEX dietary_tags_type_status ON dietary_tags (tag_type, status);
