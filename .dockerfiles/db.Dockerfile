FROM postgres:13
RUN apt-get update && apt-get install postgis postgresql-13-postgis-2.5-scripts -y
WORKDIR /docker-entrypoint-initdb.d
COPY ./.dockerfiles/init_db.sql /docker-entrypoint-initdb.d/
EXPOSE 5432