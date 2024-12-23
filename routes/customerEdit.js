const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
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
    const {first_name, last_name, email, phone_num, address, city, state, postal_code, country, password} = formData;

    try {
        const pool = await sql.connect(dbConfig);

        // to preserve other data if the user doesn't want to edit all fields
        const currentData = "SELECT * FROM customers WHERE username = @username";
        const dataRequest = pool.request();
        dataRequest.input('username', sql.VarChar, username);
        const result = await dataRequest.query(currentData);

        const currentUser = result.recordset[0];

        const updateQuery = `
            UPDATE customers
            SET
                first_name = @first_name,
                last_name = @last_name,
                email = @email,
                phone_num = @phone_num,
                address = @address,
                city = @city,
                state = @state,
                postal_code = @postal_code,
                country = @country,
                password = @password
            WHERE username = @username;
        `;
        const request = pool.request();
        request.input('first_name', sql.VarChar, first_name || currentUser.first_name);
        request.input('last_name', sql.VarChar, last_name || currentUser.last_name);
        request.input('email', sql.VarChar, email || currentUser.email);
        request.input('phone_num', sql.VarChar, phone_num || currentUser.phone_num);
        request.input('address', sql.VarChar, address || currentUser.address);
        request.input('city', sql.VarChar, city || currentUser.city);
        request.input('state', sql.VarChar, state || currentUser.state);
        request.input('postal_code', sql.VarChar, postal_code || currentUser.postal_code);
        request.input('country', sql.VarChar, country || currentUser.country);
        request.input('password', sql.VarChar, password);
        request.input('username', sql.VarChar, username);

        await request.query(updateQuery);

        res.redirect('/customer');
    } catch (err) {
        console.error(err);
        res.write(err + "")
        res.end();
    }
});

module.exports = router;