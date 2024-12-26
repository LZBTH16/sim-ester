const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { Client } = require('pg');
const sgMail = require('@sendgrid/mail')

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
    res.render('requestReset');  // Make sure 'requestReset' is your Handlebars template for the form
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
        const result = await client.query("SELECT username FROM customers WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            return res.status(400).send("No account with that email exists.");
        }

        const username = result.rows[0].username;

        // Generate token and expiration time
        const token = crypto.randomBytes(20).toString('hex');
        const expireTime = Date.now() + 3600000; // Token expires in 1 hour

        // Store the token in the database
        await client.query(
            "UPDATE customers SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3",
            [token, expireTime, email]
        );

        sgMail.setApiKey(process.env.SENDGRID_API_KEY);

        const resetUrl = `http://${req.headers.host}/forgotPassword/reset-password/${token}`;
        
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
    res.render('resetPassword', { token });  // Make sure 'resetPassword' is your Handlebars template for resetting password
});

// Route to handle password reset
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    try {
        // Verify token and expiration
        const result = await client.query(
            "SELECT username FROM customers WHERE reset_password_token = $1 AND reset_password_expires > $2",
            [token, Date.now()]
        );

        if (result.rows.length === 0) {
            return res.status(400).send("Invalid or expired token.");
        }

        // Update password and clear token
        const username = result.rows[0].username;
        await client.query(
            "UPDATE customers SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE username = $2",
            [newPassword, username]
        );

        res.status(200).send("Your password has been successfully updated.");
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while resetting your password.");
    }
});

module.exports = router;
