const express = require('express');
const router = express.Router();
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.post('/', function(req, res) {
    (async () => {
        const authenticatedUser = await validateLogin(req);

        const redirectCart = req.query.redirectCart;

        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser;
            res.redirect(redirectCart ? "/showcart" : "/index");
        } else {
            res.redirect("/login");
        }
    })();
});

async function validateLogin(req) {
    if (!req.body || !req.body.username || !req.body.password) {
        return false;
    }

    const username = req.body.username;
    const password = req.body.password;
    const authenticatedUser = await (async function() {
        try {
            const sqlQuery = "SELECT customer_id, admin FROM customers WHERE username = $1 AND password = $2";
            const result = await client.query(sqlQuery, [username, password]);
            
            if (result.rows.length > 0) {
                req.session.admin = result.rows[0].admin;
                return username;
            }

            return false;
        } catch (err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
