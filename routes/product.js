const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res) {
    try {
        const pool = await sql.connect(dbConfig);

        const success = req.query.success === 'true';
        const productId = req.query.id;

        let sqlQuery = "SELECT productName, productPrice, productImageURL, productDesc FROM product WHERE productId = @productId";
        let result = await pool.request()
            .input('productId', sql.Int, productId)
            .query(sqlQuery);

        const product = result.recordset[0];

        sqlQuery = "SELECT reviewRating, reviewComment, reviewDate FROM review WHERE productId = @productId ORDER BY reviewId DESC";
        result = await pool.request()
            .input('productId', sql.Int, productId)
            .query(sqlQuery);
        
        let reviews = result.recordset;

        // Loop through each review and format the reviewDate
        reviews = reviews.map(review => {
            // Convert the reviewDate to a Date object
            let formattedDate = new Date(review.reviewDate).toDateString();  
            // Replace the original reviewDate with the formatted date
            review.reviewDate = formattedDate;
            return review;
        });           
        
        sqlQuery = "SELECT ROUND(AVG(CAST(reviewRating AS FLOAT)), 2) averageReviewRating, COUNT(*) totalReviews FROM review WHERE productId = @productId";
        result = await pool.request()
                    .input('productId', sql.Int, productId)
                    .query(sqlQuery);

        const averageRating = result.recordset.length > 0 ? result.recordset[0].averageReviewRating : false;
        const totalReviews = result.recordset.length > 0 ? result.recordset[0].totalReviews : false;

        let canReview = false;

        // Get the customerId of the current user (if logged in)
        if(req.session.authenticatedUser){
            sqlQuery = "SELECT customerId FROM customer WHERE userid = @username";
            result = await pool.request()
                    .input('username', sql.VarChar, req.session.authenticatedUser)
                    .query(sqlQuery);

            const customerId = result.recordset[0].customerId;

            // Check if the user has purchased this product
            sqlQuery = "SELECT productId FROM ordersummary JOIN orderproduct ON ordersummary.orderId = orderproduct.orderId WHERE customerId = @customerId AND productId = @productId";
            result = await pool.request()
                    .input('customerId', sql.Int, customerId)
                    .input('productId', sql.Int, productId)
                    .query(sqlQuery);
            
            canReview = result.recordset.length > 0 ? true : false;
        }

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
        console.dir(err);
        res.write(err + "")
    }
});

module.exports = router;