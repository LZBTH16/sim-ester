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
    let username = false;

    if (req.session.authenticatedUser) {
        username = req.session.authenticatedUser;
    }

    try {
        const sqlQuery = `
            SELECT product_id, product_name, product_price, product_image_url
            FROM products
            WHERE product_name IN ($1, $2, $3)
        `;
        
        const result = await client.query(sqlQuery, ['Database Dynasty', 'Object Oriented Odyssey', 'Hashmap Simulator']);

        const products = result.rows;

        res.render('index', {
            title: "SIM-ESTER",
            username: username,
            products: products
        });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).send("Error retrieving products.");
    }
});

module.exports = router;