CREATE EXTENSION postgis;

CREATE TABLE IF NOT EXISTS locations (
    location_id SERIAL PRIMARY KEY,
    location    VARCHAR(50) NOT NULL,
    type        VARCHAR(50) NOT NULL,
    description VARCHAR(250),
    rating      DECIMAL(2,1) NOT NULL,
    coordinates GEOGRAPHY NOT NULL,
    added       DATE NOT NULL,
    UNIQUE (location, coordinates)
);

-- keep locations separate, and let users post their own ratings and description of the place and store that into other table
--CREATE TABLE IF NOT EXISTS location_ratings (
--    id              INT REFERENCES locations (location_id),
--    description     VARCHAR(50),
--    user_ratings    DECIMAL(2,1) NOT NULL,
--    added           DATE
--);