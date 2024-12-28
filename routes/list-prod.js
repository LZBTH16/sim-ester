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
        const name = req.query.product_name;
        const category = req.query.category;

        let sqlQuery = `
            SELECT p.product_id, p.product_name, p.product_price, c.category_name 
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE 1=1
        `;

        let queryParams = [];
        if (name && category) {
            sqlQuery += " AND p.product_name ILIKE $1 AND c.category_name = $2";
            queryParams.push(`%${name}%`, category);
        } else if (name) {
            sqlQuery += " AND p.product_name ILIKE $1";
            queryParams.push(`%${name}%`);
        } else if (category) {
            sqlQuery += " AND c.category_name = $1";
            queryParams.push(category);
        }

        let result = await client.query(sqlQuery, queryParams);

        let products = result.rows.map(product => ({
            id: product.product_id,
            name: product.product_name,
            price: parseFloat(product.product_price).toFixed(2),
            category: product.category_name
        }));

        products.sort((a, b) => a.name.localeCompare(b.name));

        let searchTitle = "All Products";
        if (name && category) {
            searchTitle = `Products in '${category}' category containing '${name}'`;
        } else if (name) {
            searchTitle = `Products containing '${name}'`;
        } else if (category) {
            searchTitle = `Products in '${category}' category`;
        }

        res.render('list-prod', { 
            searchTitle, 
            products, 
            username: req.session.authenticatedUser, 
            title: "Products", 
            category 
        });

    } catch (err) {
        console.error("Error:", err);
        res.status(500).send(err.message);
    }
});


module.exports = router;
