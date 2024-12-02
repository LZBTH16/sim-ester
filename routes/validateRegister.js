const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', function(req, res) {
    (async () => {
        const pool = await sql.connect(dbConfig);
        const formData = req.body;

        const { firstName, lastName, email, phone, address, city, state, postalCode, country, username, password } = formData;

        // Check if the user already exists
        let sqlQuery = "SELECT firstName FROM customer WHERE email = @email";
        let result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(sqlQuery);

        // If the email already exists do not create the account
        if(result.recordset.length > 0){
            return res.render('registrationError', { emailInUse: true });
        }
        
        sqlQuery = "SELECT firstName FROM customer WHERE userid = @username";
        result = await pool.request()
            .input('username', sql.VarChar, username)
            .query(sqlQuery);

        // If the username already exists do not create the account
        if(result.recordset.length > 0){
            return res.render('registrationError', { usernameInUse: true });
        }

        // Check if phone number is valid
        const phoneRegex = /^\+?[1-9]\d{0,2}[-.\s]?(\(?\d{1,4}\)?)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;


        if(!phoneRegex.test(phone)){
            return res.render('registrationError', { invalidPhoneNumber: true })
        }

        // If successful, insert into database
        sqlQuery = "INSERT INTO customer (firstName, lastName, email, phonenum, address, city, state, postalCode, country, userid, password) VALUES (@firstName, @lastName, @email, @phone, @address, @city, @state, @postalCode, @country, @userid, @password)";
        result = await pool.request()
            .input('firstName', sql.VarChar, firstName)
            .input('lastName', sql.VarChar, lastName)
            .input('email', sql.VarChar, email)
            .input('phone', sql.VarChar, phone)
            .input('address', sql.VarChar, address)
            .input('city', sql.VarChar, city)
            .input('state', sql.VarChar, state)
            .input('postalCode', sql.VarChar, postalCode)
            .input('country', sql.VarChar, country)
            .input('userid', sql.VarChar, username)
            .input('password', sql.VarChar, password)
            .query(sqlQuery);

        res.render('accountCreated', {
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone,
            address: address,
            city: city,
            state: state,
            postalCode: postalCode,
            country: country,
            username: username
        });
    })();

});

module.exports = router;
