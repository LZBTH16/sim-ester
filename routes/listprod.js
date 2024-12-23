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
        const category = req.query.category; // Category filter

        // Base query to join the product and category tables
        let sqlQuery = `
            SELECT p.product_id, p.product_name, p.product_price, c.category_name 
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
            WHERE 1=1
        `;

        // Array to hold query parameters
        let queryParams = [];

        // If a product name is provided, add it to the query and bind the parameter
        if (name) {
            sqlQuery += " AND p.product_name ILIKE $1"; 
            queryParams.push(`%${name}%`);
        }

        // If a category is provided, add it to the query and bind the parameter
        if (category) {
            sqlQuery += " AND c.category_name = $2";
            queryParams.push(category);
        }

        // Execute the query
        let result = await client.query(sqlQuery, queryParams);
        
        // Formatting the products
        let products = result.rows.map(product => ({
            id: product.productid,
            name: product.productname,
            price: parseFloat(product.productprice).toFixed(2),
            category: product.categoryname
        }));

        // Sort alphabetically
        products.sort((a, b) => a.name.localeCompare(b.name));

        // Determine the title to send to the template
        let searchTitle = "All Products";
        if (name && category) {
            searchTitle = `Products in '${category}' category containing '${name}'`;
        } else if (name) {
            searchTitle = `Products containing '${name}'`;
        } else if (category) {
            searchTitle = `Products in '${category}' category`;
        }

        // Render the template
        res.render('listprod', { 
            searchTitle, 
            products, 
            username: req.session.authenticatedUser, 
            title: "Products", 
            category 
        });

    } catch (err) {
        console.error(err);
        res.write(err + "");
    }
});

module.exports = router;
