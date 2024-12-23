const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const auth = require('../auth');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            // grabbing everything but the password
            const sqlQuery = "SELECT customer_id, first_name, last_name, email, phone_num, address, city, state, postal_code, country, username FROM customers WHERE username LIKE @username";
            const result = await pool.request().input('username', sql.VarChar, username).query(sqlQuery);

            // grabbing the first (and only) part of the queried array to be displayed on the site
            const customer = result.recordset[0];

            // send the query to be displayed
            res.render('customer', {customer,
                username: req.session.authenticatedUser,
                title: "Your Profile"
            });

        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
