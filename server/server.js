const { Pool } = require('pg');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');

// Initialize server
const app = express();
app.set('trust proxy', true);

// allow cors
app.use(cors());
app.use(bodyParser.json({ limit: '4MB' }));
const port = process.env.PORT || 9000;

// Start server
console.log('mode: ', process.env.NODE_ENV);
app.listen(port, () => console.log(`Listening on port ${port}`));


// Create pool
const pool = new Pool({
    host: 'postgres',  // Container host name
    port: 5432,
    user: db_user = fs.readFileSync('/run/secrets/db_user', 'utf8'),
    password: db_user_pw = fs.readFileSync('/run/secrets/db_user_pw', 'utf8'),
    database: 'sports_location_tracker',
    max: 20             // Max amount of connections
});

////////////////
// API routes //
////////////////

// set message for API root
app.get('/api', (req, res) => {
    res.json({ info: 'API root' });
});


// Search the db
app.get('/api/locations', async(req,res) => {
    let { type, latitude, longitude, distance } = req.query;
    
    // Validate the request params
    if (type.length > 50         || !type.match("^$|^[A-Za-z0-9-äöåÄÖÅ ]+$") ||
        latitude.length === 0    ||
        longitude.length === 0   ||
        distance.length === 0    || !distance.match("^$|^[0-9]+$"))
    {
        return res.status(400).send('Server error: Input validation failed');
    };

    if (type.length === 0) type = '%';
    else type = `%${type}%`

    try {
        results = await pool.query(`SELECT 
                                        location_id, 
                                        location, 
                                        type, 
                                        description, 
                                        rating, 
                                        ST_Y(coordinates::geometry) AS latitude,
                                        ST_X(coordinates::geometry) As longitude, 
                                        TO_CHAR(added, 'DD.MM.YYYY') AS added,
                                        ROUND((ST_Distance(coordinates, ST_GeogFromText('SRID=4326;POINT(${longitude + " " + latitude})'))/1000)::NUMERIC(8,2),2) AS distance
                                    FROM locations 
                                    WHERE
                                        lower(type) LIKE lower($1) AND
                                        ST_DWithin(coordinates, ST_GeogFromText('SRID=4326;POINT(${longitude + " " + latitude})'), $2)
                                    ORDER BY distance ASC;`,
                                    [type, distance]);
        res.status(200).json(results.rows);
    }
    catch (err) {
        console.log(err.code, ': ', err.message);
        res.status(500).send('Server error: Error in database query');
    }
});


// Add new location
app.post('/api/locations', async(req, res) => {
    let { location, type, description, rating, latitude, longitude } = req.body;

    // Validate the request params
    if (location.length === 0    || location.length > 50 || !location.match("^$|^[A-Za-z0-9-äöåÄÖÅ() ]+$") ||
        type.length === 0        || type.length > 50     || !type.match("^$|^[A-Za-z0-9-äöåÄÖÅ ]+$")     ||
        description.length > 250 || !description.match("^$|^[A-Za-z0-9-äöåÄÖÅ()/.,!?_ ]+$") ||
        rating < 0 || rating > 5 ||
        latitude.length === 0    ||
        longitude.length === 0)
    {
        return res.status(400).send('Server error: Input validation failed');
    };

    try {
        await pool.query(`INSERT INTO locations (location, type, description, rating, coordinates, added)
                          VALUES
                          ($1, $2, $3, $4, ST_GeogFromText('SRID=4326;POINT(${longitude + " " + latitude})'), NOW());`,
                          [location, type, description, rating]);   
        res.status(201).send('POST successful');
    }
    catch (err) {
        console.log(err.code, ': ', err.message);
        res.status(500).send('Server error: Error in database query');
    }
});

// Delete location
app.post('/api/locations/delete', async(req, res) => {
    let { id } = req.body;

    try {
        await pool.query(`DELETE FROM locations WHERE location_id = $1;`, [id]);
        res.status(200).send('DELETE successful');
    }
    catch (err) {
        console.log(err.code, ': ', err.message);
        res.status(500).send('Server error: Error in database query');
    }
});

