const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res);
    auth.checkAdmin(req, res);

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            // getting orders per day
            const sqlQuery = "SELECT CAST(orderDate AS DATE) orderDate, SUM(totalAmount) sumTotal FROM ordersummary GROUP BY CAST(orderDate AS DATE)";
            const results = await pool.request().query(sqlQuery);

            // Iterate through every order in the recordset
            const orders = results.recordset.map(order => ({
                orderDate: moment(order.orderDate).format('YYYY-MM-DD'),
                sumTotal: order.sumTotal
            }));


            // getting customer info
            const sqlQuery2 = "SELECT * FROM customer";
            const results2 = await pool.request().query(sqlQuery2);
            const customerInfo = results2.recordset;

            // sending the data to the admin.handlebars
            res.render('admin', {orders,
                customerInfo,
                username: req.session.authenticatedUser,
                title: "Admin"
            });

        } catch(err) {
            console.dir(err);
            res.write(err + "");
        }
    })();
});

module.exports = router;