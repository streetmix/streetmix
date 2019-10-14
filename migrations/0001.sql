-- TODO install postGIS before running

CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;

CREATE TABLE IF NOT EXISTS `users` (
  id uuid DEFAULT uuid_generate_v4 (),
  `twitter_id` varchar(100),
  -- `twitter_credentials` ???,
  `auth0_id` varchar(100),
  `email` varchar(200) UNIQUE,
  `login_tokens` varchar[],
  `profile_image_url` varchar,
  `flags` varchar[],
  `roles` varchar[],
  `last_street_id` int,
  -- `data` ???,
  `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW(),
);

CREATE TRIGGER set_timestamp_user
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TYPE street_status as enum('ACTIVE', 'DELETED');


CREATE TYPE locationHierarchy as (
  `country` varchar,
  `region` varchar,
  `locality` varchar,
)
CREATE TYPE location as (
  latlng GEOGRAPHY(POINT,4326)
  `wofId` varchar,
  `label` varchar,
  `heirarchy` locationHierarchy,
  `geometryId` varchar,
  `intersectionId` varchar
)

CREATE TYPE segment as (
  `type` varchar,
  `variantString` varchar,
  `width` int,
  `randSeed` int
)

CREATE TYPE street_data as (
  schemaVersion int,
  width: int,
  id uuid DEFAULT uuid_generate_v4 (),
  `namespaced_id` int NOT NULL,
  `units` int NOT NULL,
  -- location -> latlng -> (lat, lng)
  `units` varchar NOT NULL,
  location location NOT NULL,
  userUpdated: boolean,
  `environment` varchar,
  `leftBuildingHeight` int,
  `rightBuildingHeight` int,
  `leftBuildingVariant` varchar,
  `rightBuildingVariant` varchar,
  `segments` segment[],
  `editCount` int,
)

CREATE TABLE IF NOT EXISTS `streets` (
  id uuid DEFAULT uuid_generate_v4 (),
  `namespaced_id` int NOT NULL,
  status street_status,
  `name` varchar(200),
  creator_id varchar references users(id),
  -- creatorId: ref to user, index = true
  -- data: mixed
  `created_at` TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  `updated_at` TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
  `creator_ip` varchar(100),
);

CREATE TRIGGER set_timestamp_street
BEFORE UPDATE ON streets
FOR EACH ROW
EXECUTE PROCEDURE trigger_set_timestamp();
