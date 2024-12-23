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

router.get('/', async function(req, res) {
    try {
        const success = req.query.success === 'true';
        const productId = req.query.id;

        // Query for product details
        let sqlQuery = "SELECT product_name, product_price, product_image_url, product_desc FROM products WHERE product_id = $1";
        let result = await client.query(sqlQuery, [productId]);

        const product = result.rows[0]; 

        // Query for reviews
        sqlQuery = "SELECT review_rating, review_comment, review_date FROM reviews WHERE product_id = $1 ORDER BY review_id DESC";
        result = await client.query(sqlQuery, [productId]);
        
        let reviews = result.rows;

        // Format review date
        reviews = reviews.map(review => {
            let formattedDate = new Date(review.review_date).toDateString();
            review.review_date = formattedDate;
            return review;
        });

        // Query for average rating and total reviews
        sqlQuery = "SELECT ROUND(AVG(CAST(review_rating AS FLOAT)), 2) AS average_review_rating, COUNT(*) AS total_reviews FROM reviews WHERE product_id = $1";
        result = await client.query(sqlQuery, [productId]);

        const averageRating = result.rows.length > 0 ? result.rows[0].average_review_rating : false;
        const totalReviews = result.rows.length > 0 ? result.rows[0].total_reviews : false;

        let canReview = false;

        // Check if user is logged in and has purchased the product
        if (req.session.authenticatedUser) {
            sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
            result = await client.query(sqlQuery, [req.session.authenticatedUser]);

            const customerId = result.rows[0]?.customer_id;

            if (customerId) {
                sqlQuery = `
                    SELECT product_id 
                    FROM order_summaries 
                    JOIN order_products ON order_summaries.order_id = order_products.order_id 
                    WHERE customer_id = $1 AND product_id = $2
                `;
                result = await client.query(sqlQuery, [customerId, productId]);
                canReview = result.rows.length > 0;
            }
        }

        // Render the product page with all the data
        res.render('product', {
            productId: productId,
            productName: product.product_name,
            productPrice: product.product_price,
            productImageURL: product.product_image_url,
            productDesc: product.product_desc,
            username: req.session.authenticatedUser,
            title: product.product_name,
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