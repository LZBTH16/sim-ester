const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    // Get the product name to search for
    let name = req.query.productName;
    let category = req.query.category; // Category filter

    /** $name and $category now contain the search string and category */
    /** Use them to build a query and print out the results **/

    /** Create and validate connection **/

    /** Print out the ResultSet **/

    /** 
    For each product create a link of the form
    addcart?id=<productId>&name=<productName>&price=<productPrice>
    **/

    /**
        Useful code for formatting currency:
        let num = 2.89999;
        num = num.toFixed(2);
    **/

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            // Base query to join the product and category tables
            let sqlQuery = `
                SELECT p.productId, p.productName, p.productPrice, c.categoryName 
                FROM product p
                JOIN category c ON p.categoryId = c.categoryId
                WHERE 1=1
            `;

            // If a product name is provided, add it to the query
            if (name) {
                sqlQuery += " AND p.productName LIKE @name";
            }

            // If a category is provided, add it to the query
            if (category) {
                sqlQuery += " AND c.categoryName = @category"; // Filtering by categoryName
            }

            let results;
            if (name && category) {
                results = await pool.request()
                    .input('name', sql.VarChar, `%${name}%`)
                    .input('category', sql.VarChar, category)
                    .query(sqlQuery); // Results filtered by both name and category
            } else if (name) {
                results = await pool.request()
                    .input('name', sql.VarChar, `%${name}%`)
                    .query(sqlQuery); // Filter by name only
            } else if (category) {
                results = await pool.request()
                    .input('category', sql.VarChar, category)
                    .query(sqlQuery); // Filter by category only
            } else {
                results = await pool.request().query(sqlQuery); // No filter, get all products
            }

            // Formatting the products
            const products = results.recordset.map(result => ({
                id: result.productId,
                name: result.productName,
                price: result.productPrice.toFixed(2),
                category: result.categoryName // Add categoryName to the product object
            }));

            // Title to send to listprod.handlebars
            const searchTitle = name ? `Products containing '${name}'` : (category ? `Products in '${category}' category` : "All Products");

            res.render('listprod', { searchTitle, products, username: req.session.authenticatedUser, title: "Products" });
                
    
            } catch(err) {
                console.dir(err);
                res.write(JSON.stringify(err));
            }})();
});

module.exports = router;
