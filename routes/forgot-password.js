const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Client } = require('pg');
const sgMail = require('@sendgrid/mail');
const bcrypt = require('bcryptjs');

// Database client setup
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

// Route to render the password reset request form
router.get('/request-reset', (req, res) => {
    res.render('request-reset');
});

// Route to handle password reset request
router.post('/request-reset', async (req, res) => {
    const { email } = req.body;

    const emailRegex = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;

    if (!emailRegex.test(email)) {
        return res.status(400).send("The email you entered is invalid.");
    }

    try {
        // Check if the email exists
        const result = await client.query("SELECT customer_id, username FROM customers WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).send("No account with that email exists.");
        }

        const customerId = result.rows[0].customer_id;
        const username = result.rows[0].username;

        // Generate token and expiration time
        const token = crypto.randomBytes(20).toString('hex');
        const expiryTime = Date.now() + 3600000; // Token expires in 1 hour

        // Store the token in the database
        const sqlQuery = "INSERT INTO reset_passwords (customer_id, token, expiry_time) VALUES ($1, $2, $3) ON CONFLICT (customer_id) DO UPDATE SET token = $2, expiry_time = $3";
        await client.query(sqlQuery, [customerId, token, expiryTime]);

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const resetUrl = `http://${req.headers.host}/forgot-password/reset-password/${token}`;
        
        const emailMsg = {
            to: email,
            from: process.env.EMAIL_USER,
            subject: 'Sim-ester Password Reset Request',
            text: `
                Hello,
        
                You requested a password reset for your Sim-ester account: ${username}. Click the link below to reset your password:
        
                ${resetUrl}
        
                If you did not request this, please ignore this email.
        
                Best regards,
                The Sim-ester Team.
            `,
            tracking_settings: {
                click_tracking: {
                    enable: false,
                    enable_text: false
                },
                open_tracking: {
                    enable: false
                }
            }
        };

        await sgMail.send(emailMsg);

        res.status(200).send("A password reset link has been sent to your email.");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while processing your request.");
    }
});

// Route to render password reset page
router.get('/reset-password/:token', (req, res) => {
    const { token } = req.params;
    res.render('reset-password', { token });
});

// Route to handle password reset
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;
    const saltRounds = 5;

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    try {
        // Verify token and expiration
        let sqlQuery = "SELECT customers.customer_id FROM customers JOIN reset_passwords ON customers.customer_id = reset_passwords.customer_id WHERE token = $1 AND expiry_time > $2"
        const result = await client.query(sqlQuery, [token, Date.now()]);

        if (result.rows.length === 0) {
            return res.status(400).send("Invalid or expired token.");
        }

        const customerId = result.rows[0].customer_id;

        // Update password
        sqlQuery = "UPDATE customers SET password = $1 WHERE customer_id = $2";
        await client.query(sqlQuery, [hashedNewPassword, customerId]);

        // Clear token
        sqlQuery = "DELETE FROM reset_passwords WHERE customer_id = $1";
        await client.query(sqlQuery, [customerId]);

        res.status(200).send("Your password has been successfully updated.");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while resetting your password.");
    }
});

module.exports = router;