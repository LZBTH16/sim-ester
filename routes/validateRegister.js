const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 

router.post('/', function(req, res) {
    (async () => {
        const pool = await sql.connect(dbConfig);
        const formData = req.body;

        const { firstName, lastName, email, phone, address, city, state, postalCode, country, username, password } = formData;

        // Check if phone number is valid
        const phoneRegex = /^(\+\d{1,2}\s?)?1?\-?\.?\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/;

        if(!phoneRegex.test(phone)){
            return res.render('registrationError', { invalidPhoneNumber: true });
        }

        // Check if email is valid
        const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

        if(!emailRegex.test(email)){
            return res.render('registrationError', { invalidEmail: true });
        }

        // Check if the user already exists
        let sqlQuery = "SELECT first_name FROM customer WHERE email = @email";
        let result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(sqlQuery);

        // If the email already exists do not create the account
        if(result.recordset.length > 0){
            return res.render('registrationError', { emailInUse: true });
        }
        
        sqlQuery = "SELECT first_name FROM customer WHERE username = @username";
        result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(sqlQuery);

        // If the username already exists do not create the account
        if(result.recordset.length > 0){
            return res.render('registrationError', { usernameInUse: true });
        }

        // If successful, insert into database
        sqlQuery = "INSERT INTO customer (first_name, last_name, email, phone_num, address, city, state, postal_code, country, username, password) VALUES (@first_name, @last_name, @email, @phone, @address, @city, @state, @postal_code, @country, @username, @password)";
        result = await pool.request()
            .input('first_name', sql.VarChar, firstName)
            .input('last_name', sql.VarChar, lastName)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('address', sql.VarChar, address)
            .input('city', sql.VarChar, city)
            .input('state', sql.VarChar, state)
            .input('postal_code', sql.VarChar, postalCode)
            .input('country', sql.VarChar, country)
            .input('username', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(sqlQuery);

        res.render('accountCreated', {
            first_name: firstName,
            last_name: lastName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            state: state,
            postal_code: postalCode,
            country: country,
            newUsername: username
        });
    })();

});

module.exports = router;
