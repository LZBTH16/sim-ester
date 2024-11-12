const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res);
	
    res.setHeader('Content-Type', 'text/html');

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            const sqlQuery = "SELECT CAST(orderDate AS DATE) orderDate, SUM(totalAmount) sumTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)";

            const results = await pool.request()
                .query(sqlQuery);

            // Iterate through every order in the recordset
            const orders = results.recordset.map(order => ({
                orderDate: moment(order.orderDate).format('YYYY-MM-DD'),
                sumTotal: order.sumTotal
            }));

            res.render('admin', {orders});

        } catch(err) {
            console.dir(err);
            res.write(err + "");
        }
    })();
});

module.exports = router;