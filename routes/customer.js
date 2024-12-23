const express = require('express');
const router = express.Router();
const { Client } = require('pg');  // PostgreSQL client
const auth = require('../auth');

// Create a new Postgres client instance and connect
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    (async function() {
        try {
            // Query to get customer details excluding the password
            const sqlQuery = "SELECT customer_id, first_name, last_name, email, phone_num, address, city, state, postal_code, country, username FROM customers WHERE username = $1";
            const result = await client.query(sqlQuery, [username]);

            // Grab the first (and only) part of the queried result
            const customer = result.rows[0];

            // Send the query result to be displayed
            res.render('customer', { 
                customer,
                username: req.session.authenticatedUser,
                title: "Your Profile"
            });

        } catch (err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

module.exports = router;
