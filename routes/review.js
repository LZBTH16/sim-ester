const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');

router.post('/', function(req, res) {
    (async () => {
        const pool = await sql.connect(dbConfig);

        const username = req.session.authenticatedUser;

        const reviewRating = req.body.review_rating;
        let reviewDate = new Date();
        reviewDate = moment(review_date).format('YYYY-MM-DD');
        const productId = req.body.product_id;
        const reviewComment = req.body.review_comment;

        // Get customer_id for insert
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = @username";
        let result = await pool.request()
                        .input('username', sql.NVarChar, username)
                        .query(sqlQuery);
        
        const customerId = result.recordset[0].customer_id;

        sqlQuery = "INSERT INTO reviews (review_rating, review_date, customer_id, product_id, review_comment) VALUES (@review_rating, @review_date, @customer_id, @product_id, @review_comment)";
        result = await pool.request()
                    .input('review_rating', sql.Int, reviewRating)
                    .input('review_date', sql.Date, reviewDate)
                    .input('customer_id', sql.Int, customerId)
                    .input('product_id', sql.Int, productId)
                    .input('review_comment', sql.NVarChar, reviewComment)
                    .query(sqlQuery);

        res.redirect(`/product?id=${product_id}&success=true`);
     })();
});

module.exports = router;