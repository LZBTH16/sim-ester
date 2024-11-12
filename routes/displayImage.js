const express = require('express');
const router = express.Router();
const sql = require('mssql');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let productId = req.query.id;
    productId = parseInt(productId);
    if (isNaN(productId)) {
        res.end();
        return;
    }

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "SELECT productImage FROM product WHERE productId = @productId";

            let result = await pool.request()
                .input('productId', sql.Int, productId)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No image record");
                res.end();
                return;
            } else {
                let productImage = result.recordset[0].productImage;

                res.write(productImage);
            }

            res.end();
        } catch(err) {
            console.dir(err);
            res.write(err + "")
            res.end();
        }
    })();
});

module.exports = router;
