const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            // Get product name to search for
            let productId = req.query.id;

            let sqlQuery = "SELECT productName, productPrice, productImageURL FROM product WHERE productId = @productId";

            let result = await pool.request()
                .input('productId', sql.Int, productId)
                .query(sqlQuery);
            
            let product = result.recordset[0];
            let productName = product.productName;
            let productPrice = product.productPrice;
            let productImageURL = product.productImageURL;

            // <!> Temporarily using res.write(), will switch to handlebars eventually. <!>
            res.write(`<h1>${productName}</h1>`);

            // If there is a productImageURL, display using IMG tag
            if(productImageURL){
                res.write(`<img src="${productImageURL}"></img>`);
            }else{
                // Retrieve any image stored directly in database. Note: Call displayImage.jsp with product id as parameter.
                res.write(`<img src="/displayImage?id=${productId}" />`);
            }
            res.write(`<h2>Id ${productId}</h2>`);
            res.write(`<h2>Price ${productPrice}</h2>`);

            res.write(`<h1><a href="addcart?id=${productId}&name=${productName}&price=${productPrice}">Add to cart</a></h1>`);
            res.write(`<h1><a href=listprod>Continue shopping</a></h1>`);

            res.end()
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
