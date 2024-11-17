const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res, next) {
    // Get the product name to search for
    let name = req.query.productName;
    
    /** $name now contains the search string the user entered
     Use it to build a query and print out the results. **/

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
    
                let sqlQuery;
                if(!name){
                    sqlQuery = "SELECT productId, productName, productPrice FROM product"; // default, when not specifically searching
                } else {
                    sqlQuery = "SELECT productId, productName, productPrice FROM product WHERE productName LIKE @name"; // when searching for something
                }
                
                let results;
                if(name){
                    results = await pool.request().input('name', sql.VarChar, `%${name}%`).query(sqlQuery); // results should be the specified search
                } else {
                    results = await pool.request().query(sqlQuery); // all products
                }

                // formatting the products
                const products = results.recordset.map(result => ({
                    id: result.productId,
                    name: result.productName,
                    price: result.productPrice.toFixed(2)
                }));

                // title to send to listprod.handlebars
                const searchTitle = name ? `Products containing '${name}'` : "All Products";

                res.render('listprod', {searchTitle, products,
                    username: req.session.authenticatedUser,
                    title: "Products"
                })
                
    
            } catch(err) {
                console.dir(err);
                res.write(JSON.stringify(err));
            }})();
});

module.exports = router;
