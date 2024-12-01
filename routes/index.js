const express = require('express');
const router = express.Router();
const sql = require('mssql');

// Rendering the main page
router.get('/', async function (req, res) {
    let username = false;

    if(req.session.authenticatedUser){
        username = req.session.authenticatedUser;
    }

    try {
        const pool = await sql.connect(dbConfig);
        // Query to get the specific products (Database Dynasty, Object Oriented Odyssey, Hashmap Simulator)
        const sqlQuery = `
            SELECT productId, productName, productPrice, productImageURL
            FROM product
            WHERE productName IN ('Database Dynasty', 'Object Oriented Odyssey', 'Hashmap Simulator')
        `;

        // Execute the query asynchronously
        const results = await pool.request().query(sqlQuery);

        // Get the products from the query result
        const products = results.recordset;

        // Render the index page, passing the products and username (if logged in)
        res.render('index', {
            title: "SIM-ESTER",
            username: username,
            products: products
        });
    } catch (err) {
        // Handle errors (e.g., DB connection issues)
        console.error("Error fetching products:", err);
        res.status(500).send("Error retrieving products.");
    }
});

module.exports = router;
