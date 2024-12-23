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
        const name = req.query.productName;
        const category = req.query.category; // Category filter

        // Base query to join the product and category tables
        let sqlQuery = `
            SELECT p.productId, p.productName, p.productPrice, c.categoryName 
            FROM product p
            JOIN category c ON p.categoryId = c.categoryId
            WHERE 1=1
        `;

        // Array to hold query parameters
        let queryParams = [];

        // If a product name is provided, add it to the query and bind the parameter
        if (name) {
            sqlQuery += " AND p.productName ILIKE $1"; 
            queryParams.push(`%${name}%`);
        }

        // If a category is provided, add it to the query and bind the parameter
        if (category) {
            sqlQuery += " AND c.categoryName = $2";
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
