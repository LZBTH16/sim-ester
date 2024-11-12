const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        const authenticatedUser = await validateLogin(req);
        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser;
            res.redirect("/index");
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
    const authenticatedUser =  await (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            const sqlQuery = "SELECT customerId FROM customer WHERE userid = @username AND password = @password";
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query(sqlQuery);
            
            // Check if the credentials match an valid account
            if(result.recordset.length > 0){
                return username;
            }

           return false;
        } catch(err) {
            console.dir(err);
            return false;
        }
    })();

    return authenticatedUser;
}

module.exports = router;
