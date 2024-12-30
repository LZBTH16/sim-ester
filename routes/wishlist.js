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

        // Wishlist doesn't exist
        if (result.rows.length === 0) {
            return res.render('wishlist', {
                title: "SIM-ESTER",
                username: req.session.authenticatedUser,
                message: "No wishlist found.",
                noWishlist: true
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

        const emptyWishlist = result.rows.length === 0;

        // Prepare the products list
        const products = result.rows.map(product => ({
            productId: product.product_id,
            productName: product.product_name,
            productPrice: product.product_price,
            addedDate: moment(product.added_date).format('YYYY-MM-DD')
        }));

        // Render the wishlist page with the products
        res.render('wishlist', {
            title: "SIM-ESTER",
            username: req.session.authenticatedUser,
            products: products,
            emptyWishlist
        });

    } catch (err) {
        console.error("Error fetching wishlist:", err);
        res.status(500).send("Error loading wishlist.");
    }
});

router.post('/create', async function (req, res) {
    try {
        // Check if the user is authenticated (i.e., logged in)
        if (!req.session.authenticatedUser) {
            return res.redirect('/login'); // Redirect to login page if not authenticated
        }

        // Retrieve customer_id based on the authenticated user's username
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [req.session.authenticatedUser]);

        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found.");
        }

        const customerId = result.rows[0].customer_id;

        // Check if the user already has a wishlist
        sqlQuery = "SELECT wishlist_id FROM wishlists WHERE customer_id = $1";
        result = await client.query(sqlQuery, [customerId]);

        // User already has a wishlist
        if (result.rows.length > 0) {
            return res.redirect('/wishlist'); // Redirect to the existing wishlist
        }

        // Create a new wishlist for the customer
        sqlQuery = "INSERT INTO wishlists (customer_id) VALUES ($1)";
        result = await client.query(sqlQuery, [customerId]);

        // Redirect to the wishlist page after creating it
        res.redirect('/wishlist');
    } catch (err) {
        console.error("Error creating wishlist:", err);
        res.status(500).send("Error creating wishlist.");
    }
});

router.get('/add', async (req, res) => {
    try {
        const { productId } = req.query; // Access the productId from query parameters
        const username = req.session.authenticatedUser;

        // Ensure the user is logged in
        if (!username) {
            return res.status(401).send("You must be logged in to add products to your wishlist.");
        }

        // Retrieve the customer_id from the customers table based on the username
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [username]);

        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found.");
        }

        const customerId = result.rows[0].customer_id;

        // Check if the user already has a wishlist
        sqlQuery = "SELECT wishlist_id FROM wishlists WHERE customer_id = $1";
        result = await client.query(sqlQuery, [customerId]);

        if (result.rows.length === 0) {
            // If no wishlist exists, create a new wishlist
            sqlQuery = "INSERT INTO wishlists (customer_id) VALUES ($1) RETURNING wishlist_id";
            result = await client.query(sqlQuery, [customerId]);
        }

        const wishlistId = result.rows[0].wishlist_id;

        // Check if the product is already in the wishlist to avoid duplicates
        sqlQuery = "SELECT * FROM wishlist_products WHERE wishlist_id = $1 AND product_id = $2";
        result = await client.query(sqlQuery, [wishlistId, productId]);

        if (result.rows.length > 0) {
            return res.status(400).send("This product is already in your wishlist.");
        }

        // Add the product to the wishlist
        sqlQuery = "INSERT INTO wishlist_products (wishlist_id, product_id) VALUES ($1, $2)";
        await client.query(sqlQuery, [wishlistId, productId]);

        res.redirect('/wishlist'); // Redirect to the wishlist page after adding the product
    } catch (err) {
        console.error("Error adding product to wishlist:", err);
        res.status(500).send("Error adding product to wishlist.");
    }
});

router.get('/remove', async (req, res) => {
    try {
        const { productId } = req.query; 
        const username = req.session.authenticatedUser;

        // Ensure the user is logged in
        if (!username) {
            return res.status(401).send("You must be logged in to remove products from your wishlist.");
        }

        // Retrieve the customer_id from the customers table based on the username
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [username]);

        if (result.rows.length === 0) {
            return res.status(404).send("Customer not found.");
        }

        const customerId = result.rows[0].customer_id;

        // Check if the user has a wishlist
        sqlQuery = "SELECT wishlist_id FROM wishlists WHERE customer_id = $1";
        result = await client.query(sqlQuery, [customerId]);

        if (result.rows.length === 0) {
            return res.status(404).send("No wishlist found.");
        }

        const wishlistId = result.rows[0].wishlist_id;

        // Remove the product from the wishlist
        sqlQuery = "DELETE FROM wishlist_products WHERE wishlist_id = $1 AND product_id = $2";
        await client.query(sqlQuery, [wishlistId, productId]);

        // Redirect to the wishlist page after removing the product
        res.redirect('/wishlist');
    } catch (err) {
        console.error("Error removing product from wishlist:", err);
        res.status(500).send("Error removing product from wishlist.");
    }
});

module.exports = router;