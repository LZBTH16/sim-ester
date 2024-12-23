const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { Client } = require('pg'); 
const moment = require('moment');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res);
    auth.checkAdmin(req, res);

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

            // getting orders per day
            const sqlQuery = "SELECT CAST(order_date AS DATE) order_date, SUM(total_amount) sum_total FROM order_summaries GROUP BY CAST(order_date AS DATE)";
            const results = await pool.request().query(sqlQuery);

            // Iterate through every order in the recordset
            const orders = results.recordset.map(order => ({
                order_date: moment(order.order_date).format('YYYY-MM-DD'),
                sum_total: order.sum_total
            }));


            // getting customer info
            const sqlQuery2 = "SELECT * FROM customers";
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