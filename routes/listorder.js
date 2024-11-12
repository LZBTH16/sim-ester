const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function (req, res, next) {
    try {
        const pool = await sql.connect(dbConfig);

        const sqlQuery = `
            SELECT orderId, orderDate, customer.customerId, firstName, lastName, totalAmount 
            FROM ordersummary 
            JOIN customer ON customer.customerId = ordersummary.customerId
        `;
        const results = await pool.request().query(sqlQuery);

        const orders = [];
        for (let result of results.recordset) {
            let order = {
                orderId: result.orderId,
                orderDate: moment(result.orderDate).format("YYYY-MM-DD HH:mm:ss.0"),
                customerId: result.customerId,
                customerName: result.firstName + " " + result.lastName,
                totalAmount: result.totalAmount.toFixed(2),
                products: []
            };

            const sqlQuery2 = `SELECT productId, quantity, price FROM orderproduct WHERE orderId = ${result.orderId}`;
            const results2 = await pool.request().query(sqlQuery2);

            for (let product of results2.recordset) {
                order.products.push({
                    productId: product.productId,
                    quantity: product.quantity,
                    price: `$${product.price.toFixed(2)}`
                });
            }

            orders.push(order);
        }

        res.render('listorder', { orders });
    } catch (err) {
        console.dir(err);
        res.write(JSON.stringify(err));
    }
});

module.exports = router;
