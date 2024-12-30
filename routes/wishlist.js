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

router.get('/', async function (req, res) {
    try {
        // Get the customer ID based on the authenticated user's username
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [req.session.authenticatedUser]);

        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found.");
        }

        const customerId = result.rows[0].customer_id;

        // Fetch the wishlist for the customer
        sqlQuery = "SELECT wishlist_id FROM wishlists WHERE customer_id = $1";
        result = await client.query(sqlQuery, [customerId]);

        if (result.rows.length === 0) {
            return res.render('wishlist', {
                title: "SIM-ESTER",
                username: req.session.authenticatedUser,
                message: "No wishlist found."
            });
        }

        const wishlistId = result.rows[0].wishlist_id;

        // Fetch the products in the wishlist
        sqlQuery = `
            SELECT p.product_id, p.product_name, p.product_price, wp.added_date
            FROM wishlist_products wp
            JOIN products p ON wp.product_id = p.product_id
            WHERE wp.wishlist_id = $1`;
        result = await client.query(sqlQuery, [wishlistId]);

        // Prepare the products list
        const products = result.rows.map(row => ({
            productId: row.product_id,
            productName: row.product_name,
            productPrice: row.product_price,
            addedDate: row.added_date
        }));

        // Render the wishlist page with the products
        res.render('wishlist', {
            title: "SIM-ESTER",
            username: req.session.authenticatedUser,
            products: products
        });

    } catch (err) {
        console.error("Error fetching wishlist:", err);
        res.status(500).send("Error loading wishlist.");
    }
});

module.exports = router;