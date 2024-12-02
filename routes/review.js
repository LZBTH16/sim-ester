const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.post('/', function(req, res) {
    (async () => {
        const pool = await sql.connect(dbConfig);

        const userid = req.session.authenticatedUser;

        if(!userid){
            // If not logged in, go back (will change later)
            return res.redirect("/index");
        }

        const reviewRating = req.body.reviewRating;
        let reviewDate = new Date();
        reviewDate = moment(reviewDate).format('YYYY-MM-DD');
        const productId = req.body.productId;
        const reviewComment = req.body.reviewComment;

        // Get customerId for insert
        let sqlQuery = "SELECT customerId FROM customer WHERE userid = @userid";
        let result = await pool.request()
                        .input('userid', sql.VarChar, userid)
                        .query(sqlQuery);
        
        const customerId = result.recordset[0].customerId;

        sqlQuery = "INSERT INTO review (reviewRating, reviewDate, customerId, productId, reviewComment) VALUES (@reviewRating, @reviewDate, @customerId, @productId, @reviewComment)";
        result = await pool.request()
                    .input('reviewRating', sql.Int, reviewRating)
                    .input('reviewDate', sql.Date, reviewDate)
                    .input('customerId', sql.Int, customerId)
                    .input('productId', sql.Int, productId)
                    .input('reviewComment', sql.VarChar, reviewComment)
                    .query(sqlQuery);

        res.redirect(`/product?id=${productId}&success=true`);
     })();
});

module.exports = router;