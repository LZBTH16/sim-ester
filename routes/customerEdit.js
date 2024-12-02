const express = require('express');
const router = express.Router();
const sql = require('mssql');
const auth = require('../auth');

// displaying the edit page
router.get('/', async function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    res.render('customerEdit', {
        username: username,
        title: "Edit Your Profile"
    });  
});

// making the edits to the database from the user input, then redirecting to customer.handlebars
router.post('/', async function (req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    const formData = req.body;
    const {firstName, lastName, email, phonenum, address, city, state, postalCode, country, password} = formData;

    try {
        const pool = await sql.connect(dbConfig);

        // to preserve other data if the user doesn't want to edit all fields
        const currentData = "SELECT * FROM customer WHERE userid = @userid";
        const dataRequest = pool.request();
        dataRequest.input('userid', sql.VarChar, username);
        const result = await dataRequest.query(currentData);

        const currentUser = result.recordset[0];

        const updateQuery = `
            UPDATE customer
            SET
                firstName = @firstName,
                lastName = @lastName,
                email = @email,
                phonenum = @phonenum,
                address = @address,
                city = @city,
                state = @state,
                postalCode = @postalCode,
                country = @country,
                password = @password
            WHERE userid = @userid;
        `;
        const request = pool.request();
        request.input('firstName', sql.VarChar, firstName || currentUser.firstName);
        request.input('lastName', sql.VarChar, lastName || currentUser.lastName);
        request.input('email', sql.VarChar, email || currentUser.email);
        request.input('phonenum', sql.VarChar, phonenum || currentUser.phonenum);
        request.input('address', sql.VarChar, address || currentUser.address);
        request.input('city', sql.VarChar, city || currentUser.city);
        request.input('state', sql.VarChar, state || currentUser.state);
        request.input('postalCode', sql.VarChar, postalCode || currentUser.postalCode);
        request.input('country', sql.VarChar, country || currentUser.country);
        request.input('password', sql.VarChar, password);
        request.input('userid', sql.VarChar, username);

        await request.query(updateQuery);

        res.redirect('/customer');
    } catch (err) {
        console.error(err);
        res.write(err + "")
        res.end();
    }
});

module.exports = router;