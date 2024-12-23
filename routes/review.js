const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.post('/', async function(req, res) {
    try {
        const username = req.session.authenticatedUser;

        const reviewRating = req.body.reviewRating;
        let reviewDate = new Date();
        reviewDate = moment(reviewDate).format('YYYY-MM-DD');
        const productId = req.body.productId;
        const reviewComment = req.body.reviewComment;

        // Get customer_id for insert
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [username]);
        
        const customerId = result.rows[0].customer_id;

        // Insert the review into the reviews table
        sqlQuery = "INSERT INTO reviews (review_rating, review_date, customer_id, product_id, review_comment) VALUES ($1, $2, $3, $4, $5)";
        await client.query(sqlQuery, [
            reviewRating,
            reviewDate,
            customerId,
            productId,
            reviewComment
        ]);

        res.redirect(`/product?id=${productId}&success=true`);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while posting the review.");
    }
});

module.exports = router;
