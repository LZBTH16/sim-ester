const express = require('express');
const router = express.Router();
const { Client } = require('pg');
const moment = require('moment');
const auth = require('../auth');

const client = new Client({
    connectionString: process.env.DATABASE_URL,  
    ssl: {
        rejectUnauthorized: false  
    }
});

client.connect();

router.get('/', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    try {
        // Get the customer id of the current user
        let sqlQuery = "SELECT customer_id FROM customers WHERE username = $1";
        let result = await client.query(sqlQuery, [req.session.authenticatedUser]);

        const customerId = result.rows[0].customer_id;

        // Get the order summary details (not including the products)
        sqlQuery = "SELECT order_id, order_date, total_amount FROM order_summaries WHERE customer_id = $1";
        result = await client.query(sqlQuery, [customerId]);

        const orders = [];
        for (let order of result.rows) {
            let orderDetails = {
                orderId: order.order_id,
                orderDate: moment(order.order_date).format("YYYY-MM-DD HH:mm:ss"),
                totalAmount: order.total_amount,
                products: []
            };

            // Query to get the products in the order
            sqlQuery = `SELECT product_name, quantity, price FROM order_products WHERE order_id = $1`;
            const productResult = await client.query(sqlQuery, [order.order_id]);

            // Add product details to the order
            for (let product of productResult.rows) {
                orderDetails.products.push({
                    productName: product.product_id,
                    quantity: product.quantity,
                    price: `$${product.price}`
                });
            }

            // Add the complete order with products to the orders array
            orders.push(orderDetails);
        }

        // Render the orders list page
        res.render('order-history', { 
            orders,
            username: req.session.authenticatedUser,
            title: "Your order history"
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Something went wrong!');
    }
});

module.exports = router;
