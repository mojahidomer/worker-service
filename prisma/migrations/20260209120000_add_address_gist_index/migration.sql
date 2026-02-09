-- Ensure PostGIS is available
CREATE EXTENSION IF NOT EXISTS postgis;

-- GIST index for fast distance queries
CREATE INDEX IF NOT EXISTS "Address_location_gist" ON "Address"
USING GIST (ST_SetSRID(ST_MakePoint("longitude", "latitude"), 4326));
