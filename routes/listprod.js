const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Products</title>")

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
        res.write('<h1>Search for Products You Want to Buy:</h1>');

        res.write('<form method="get" action="listprod">');
        res.write('<input type="text" name="productName" size="50">');
        res.write('<input type="submit" value="Submit"><input type="reset" value="Reset">');
        res.write('</form>');
        
        (async function() {
            try {
                let pool = await sql.connect(dbConfig);
    
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

                // displaying the search message
                if(name){
                    res.write(`<h2>Products containing '${name}'</h2>`);
                } else{
                    res.write("<h2>All Products</h2>");
                }
                
                res.write("<table><tr><th></th><th>Product Name</th><th>Price</th></tr>");
                for (let i = 0; i < results.recordset.length; i++) {
                    let result = results.recordset[i];
                    let price = "$"+result.productPrice.toFixed(2);
                    res.write(`<tr><td><a href='addcart?id=${result.productId}&name=${result.productName}&price=${result.productPrice}'>Add to cart</a></td><td>${result.productName}</td><td>${price}</td></tr>`);

                }
                res.write("</table>");
    
                res.end();
            } catch(err) {
                console.dir(err);
                res.write(JSON.stringify(err));
                res.end();
            }})();
});

module.exports = router;
