const express = require('express');
const router = express.Router();
const { Client } = require('pg'); // Using pg for PostgreSQL
const auth = require('../auth');

// displaying the edit page
router.get('/', async function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    res.render('customer-edit', {
        username: username,
        title: "Edit Your Profile"
    });  
});

// making the edits to the database from the user input, then redirecting to customer.handlebars
router.post('/', async function (req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    const formData = req.body;
    const {firstName, lastName, email, phoneNum, address, city, state, postalCode, country, password} = formData;

    try {
        const client = new Client({
            connectionString: process.env.DATABASE_URL,  
            ssl: {
                rejectUnauthorized: false 
            }
        });
        await client.connect();

        // Get current user data
        const currentDataQuery = "SELECT * FROM customers WHERE username = $1";
        const currentDataResult = await client.query(currentDataQuery, [username]);

        const currentUser = currentDataResult.rows[0];

        // Update query
        const updateQuery = `
            UPDATE customers
            SET
                first_name = $1,
                last_name = $2,
                email = $3,
                phone_num = $4,
                address = $5,
                city = $6,
                state = $7,
                postal_code = $8,
                country = $9,
                password = $10
            WHERE username = $11;
        `;

        // Execute the update query
        await client.query(updateQuery, [
            firstName || currentUser.first_name,
            lastName || currentUser.last_name,
            email || currentUser.email,
            phoneNum || currentUser.phone_num,
            address || currentUser.address,
            city || currentUser.city,
            state || currentUser.state,
            postalCode || currentUser.postal_code,
            country || currentUser.country,
            password || currentUser.password,
            username
        ]);

        // Close PostgreSQL client connection
        await client.end();

        // Redirect to the customer profile page after update
        res.redirect('/customer');
    } catch (err) {
        console.error(err);
        res.write(err + "");
        res.end();
    }
});

module.exports = router;
