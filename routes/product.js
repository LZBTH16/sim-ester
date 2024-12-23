const express = require('express');
const router = express.Router();
const { Client } = require('pg');  

// PostgreSQL connection setup (NeonDB)
const client = new Client({
    connectionString: process.env.DATABASE_URL, 
    ssl: {
        rejectUnauthorized: false 
    }
});

client.connect();

router.get('/', async function(req, res) {
    try {
        const success = req.query.success === 'true';
        const productId = req.query.id;

        // Query for product details
        let sqlQuery = "SELECT productName, productPrice, productImageURL, productDesc FROM product WHERE productId = $1";
        let result = await client.query(sqlQuery, [productId]);

        const product = result.rows[0]; 

        // Query for reviews
        sqlQuery = "SELECT reviewRating, reviewComment, reviewDate FROM review WHERE productId = $1 ORDER BY reviewId DESC";
        result = await client.query(sqlQuery, [productId]);
        
        let reviews = result.rows;

        // Format review date
        reviews = reviews.map(review => {
            let formattedDate = new Date(review.reviewDate).toDateString();
            review.reviewDate = formattedDate;
            return review;
        });

        // Query for average rating and total reviews
        sqlQuery = "SELECT ROUND(AVG(CAST(reviewRating AS FLOAT)), 2) AS averageReviewRating, COUNT(*) AS totalReviews FROM review WHERE productId = $1";
        result = await client.query(sqlQuery, [productId]);

        const averageRating = result.rows.length > 0 ? result.rows[0].averageReviewRating : false;
        const totalReviews = result.rows.length > 0 ? result.rows[0].totalReviews : false;

        let canReview = false;

        // Check if user is logged in and has purchased the product
        if (req.session.authenticatedUser) {
            sqlQuery = "SELECT customerId FROM customer WHERE userid = $1";
            result = await client.query(sqlQuery, [req.session.authenticatedUser]);

            const customerId = result.rows[0]?.customerId;

            if (customerId) {
                sqlQuery = `
                    SELECT productId 
                    FROM ordersummary 
                    JOIN orderproduct ON ordersummary.orderId = orderproduct.orderId 
                    WHERE customerId = $1 AND productId = $2
                `;
                result = await client.query(sqlQuery, [customerId, productId]);
                canReview = result.rows.length > 0;
            }
        }

        // Render the product page with all the data
        res.render('product', {
            productId: productId,
            productName: product.productName,
            productPrice: product.productPrice,
            productImageURL: product.productImageURL,
            productDesc: product.productDesc,
            username: req.session.authenticatedUser,
            title: product.productName,
            averageRating: averageRating,
            totalReviews: totalReviews,
            reviews: reviews,
            canReview: canReview,
            successMessage: success ? "Your review has been successfully submitted!" : null,
        });

    } catch (err) {
        console.error(err);
        res.write(err + "");
    }
});

module.exports = router;