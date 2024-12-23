const express = require('express');
const router = express.Router();
const { Client } = require('pg');  // PostgreSQL client

// Create a new Postgres client instance and connect
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let productId = req.query.id;
    productId = parseInt(productId);
    if (isNaN(productId)) {
        res.end();
        return;
    }

    (async function() {
        try {
            // PostgreSQL query to retrieve the product image
            const sqlQuery = "SELECT product_image FROM products WHERE product_id = $1";

            const result = await client.query(sqlQuery, [productId]);

            if (result.rows.length === 0) {
                console.log("No image record");
                res.end();
                return;
            } else {
                const productImage = result.rows[0].product_image;

                res.write(productImage);
            }

            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

module.exports = router;
