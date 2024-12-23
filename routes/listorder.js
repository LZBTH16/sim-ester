const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');
const auth = require('../auth');

router.get('/', async function (req, res, next) {
    auth.checkAuthentication(req, res);
    auth.checkAdmin(req, res);
    try {
        const pool = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT order_id, order_date, customer.customer_id, first_name, last_name, total_amount 
            FROM order_summaries 
            JOIN customers ON customers.customer_id = order_summaries.customer_id
        `;
        const results = await pool.request().query(sqlQuery);

        const orders = [];
        for (let result of results.recordset) {
            let order = {
                order_id: result.order_id,
                order_date: moment(result.order_date).format("YYYY-MM-DD HH:mm:ss.0"),
                customer_id: result.customer_id,
                customerName: result.first_name + " " + result.last_name,
                total_amount: result.total_amount.toFixed(2),
                products: []
            };

            const sqlQuery2 = `SELECT product_id, quantity, price FROM order_products WHERE order_id = ${result.order_id}`;
            const results2 = await pool.request().query(sqlQuery2);

            for (let product of results2.recordset) {
                order.products.push({
                    product_id: product.product_id,
                    quantity: product.quantity,
                    price: `$${product.price.toFixed(2)}`
                });
            }

            orders.push(order);
        }

        res.render('listorder', { orders,
            username: req.session.authenticatedUser,
            title: "All Orders"
         });
    } catch (err) {
        console.dir(err);
        res.write(JSON.stringify(err));
    }
});

module.exports = router;