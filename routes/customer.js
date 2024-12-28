const express = require('express');
const router = express.Router();
const { Client } = require('pg');  // PostgreSQL client
const auth = require('../auth');
const moment = require('moment');

// Create a new Postgres client instance and connect
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;

    (async function() {
        try {
            // Query to get customer details excluding the password
            const sqlQuery = "SELECT customer_id, first_name, last_name, email, phone_num, address, city, state, postal_code, country, username FROM customers WHERE username = $1";
            const result = await client.query(sqlQuery, [username]);

            // Grab the first (and only) part of the queried result
            const customer = result.rows[0];

            // Send the query result to be displayed
            res.render('customer', { 
                customer,
                username: req.session.authenticatedUser,
                title: "Your Profile"
            });

        } catch (err) {
            console.dir(err);
            res.write(err + "");
            res.end();
        }
    })();
});

router.get('/order-history', async function (req, res, next) {
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
            sqlQuery = "SELECT product_name, quantity, price FROM order_products JOIN products ON order_products.product_id = products.product_id WHERE order_id = $1";
            const productResult = await client.query(sqlQuery, [order.order_id]);

            // Add product details to the order
            for (let product of productResult.rows) {
                orderDetails.products.push({
                    productName: product.product_name,
                    quantity: product.quantity,
                    price: `$${product.price * product.quantity}`
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
