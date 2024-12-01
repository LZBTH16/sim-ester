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
        
        // Dynamic parameters for the query
        const request = pool.request();
        
        // If a product name is provided, add it to the query and bind the parameter
        if (name) {
            sqlQuery += " AND p.productName LIKE @name";
            request.input('name', sql.VarChar, `%${name}%`);
        }
        
        // If a category is provided (and not null/empty), add it to the query and bind the parameter
        if (category) {
            sqlQuery += " AND c.categoryName = @category";
            request.input('category', sql.VarChar, category);
        }
        
        // Execute the query
        const results = await request.query(sqlQuery);
        
        // Formatting the products
        const products = results.recordset.map(result => ({
            id: result.productId,
            name: result.productName,
            price: result.productPrice.toFixed(2),
            category: result.categoryName
        }));
        
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
                
    
        } catch(err) {
            console.dir(err);
            res.write(JSON.stringify(err));
        }})();
});

module.exports = router;
