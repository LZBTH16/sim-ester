const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.post('/', function(req, res) {
    // Have to preserve async context since we make an async call
    // to the database in the validateLogin function.
    (async () => {
        const authenticatedUser = await validateLogin(req);

        // True if the user wanted to checkout but wasn't logged in
        const redirectCart = req.query.redirectCart

        if (authenticatedUser) {
            req.session.authenticatedUser = authenticatedUser;
            res.redirect(redirectCart ? "/showcart" : "/index"); // Redirect to index by default
        } 
        else {
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

            const sqlQuery = "SELECT customerId, admin FROM customer WHERE userid = @username AND password = @password";
            const result = await pool.request()
                .input('username', sql.VarChar, username)
                .input('password', sql.VarChar, password)
                .query(sqlQuery);
            
            // Check if the credentials match an valid account
            if(result.recordset.length > 0){
                req.session.admin = result.recordset[0].admin;
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
