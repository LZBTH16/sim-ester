const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'image/jpeg');

    let product_id = req.query.id;
    product_id = parseInt(product_id);
    if (isNaN(product_id)) {
        res.end();
        return;
    }

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            const sqlQuery = "SELECT product_image FROM products WHERE product_id = @product_id";

            const result = await pool.request()
                .input('product_id', sql.Int, product_id)
                .query(sqlQuery);

            if (result.recordset.length === 0) {
                console.log("No image record");
                res.end();
                return;
            } else {
                const product_image = result.recordset[0].product_image;

                res.write(product_image);
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
