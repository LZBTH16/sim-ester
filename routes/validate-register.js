const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');

// Create a new Postgres client instance and connect
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.post('/', function(req, res) {
    (async () => {
        const formData = req.body;

        const { firstName, lastName, email, phone, address, city, state, postalCode, country, username, password } = formData;

        // Check if phone number is valid
        const phoneRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

        if (!phoneRegex.test(phone)) {
            return res.render('registration-error', { invalidPhoneNumber: true });
        }

        // Check if email is valid
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if (!emailRegex.test(email)) {
            return res.render('registration-error', { invalidEmail: true });
        }

        // Check if the user already exists by email
        let sqlQuery = "SELECT first_name FROM customers WHERE email = $1";
        let result = await client.query(sqlQuery, [email]);

        // If the email already exists, do not create the account
        if (result.rows.length > 0) {
            return res.render('registration-error', { emailInUse: true });
        }

        // Check if the username already exists
        sqlQuery = "SELECT first_name FROM customers WHERE username = $1";
        result = await client.query(sqlQuery, [username]);

        // If the username already exists, do not create the account
        if (result.rows.length > 0) {
            return res.render('registration-error', { usernameInUse: true });
        }

        // Hash password with bcrypt
        const saltRounds = 5;

        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // If successful, insert into database
        sqlQuery = `
            INSERT INTO customers (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `;
        await client.query(sqlQuery, [
            firstName, lastName, email, phone, address, city, state, postalCode, country, username, hashedPassword
        ]);

        // Render the account created page with the entered information
        res.render('account-created', {
            firstN: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            newUsername: username
        });
    })().catch(err => {
        console.error(err);
        res.render('registration-error', { errorMessage: 'An error occurred while creating the account.' });
    });
});

module.exports = router;
