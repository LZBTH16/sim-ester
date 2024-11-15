const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    res.setHeader('Content-Type', 'text/html');

    // TODO: Print Customer information

    (async function() {
        try {

	// TODO: Print customer info

            const pool = await sql.connect(dbConfig);

            // grabbing everything but the password
            const sqlQuery = "SELECT customerId, firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid FROM customer WHERE userid LIKE @username";
            const result = await pool.request().input('username', sql.VarChar, username).query(sqlQuery);

            // grabbing the first (and only) part of the queried array to be displayed on the site
            const customer = result.recordset[0];

            // send the query to be displayed
            res.render('customer', {customer});

        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
