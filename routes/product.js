const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res) {
    try {
        let pool = await sql.connect(dbConfig);

        let productId = req.query.id;

        let sqlQuery = "SELECT productName, productPrice, productImageURL FROM product WHERE productId = @productId";
        let result = await pool.request()
            .input('productId', sql.Int, productId)
            .query(sqlQuery);

        let product = result.recordset[0];

        res.render('product', {
            productId: productId,
            productName: product.productName,
            productPrice: product.productPrice,
            productImageURL: product.productImageURL
        });
    } catch (err) {
        console.dir(err);
        res.write(err + "")
    }
});

module.exports = router;
