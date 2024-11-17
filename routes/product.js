const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', async function(req, res) {
    try {
        const pool = await sql.connect(dbConfig);

        const productId = req.query.id;

        const sqlQuery = "SELECT productName, productPrice, productImageURL FROM product WHERE productId = @productId";
        const result = await pool.request()
            .input('productId', sql.Int, productId)
            .query(sqlQuery);

        const product = result.recordset[0];

        res.render('product', {
            productId: productId,
            productName: product.productName,
            productPrice: product.productPrice,
            productImageURL: product.productImageURL,
            username: req.session.authenticatedUser,
            title: product.productName
        });
    } catch (err) {
        console.dir(err);
        res.write(err + "")
    }
});

module.exports = router;
