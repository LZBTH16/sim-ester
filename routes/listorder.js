const express = require('express');
const router = express.Router();
const { Client } = require('pg');  // Use the 'pg' library for PostgreSQL
const moment = require('moment');
const auth = require('../auth');

// Create a new PostgreSQL client instance
const client = new Client({
    connectionString: process.env.DATABASE_URL,  
    ssl: {
        rejectUnauthorized: false  
    }
});

client.connect();  // Connect to PostgreSQL

router.get('/', async function (req, res, next) {
    auth.checkAuthentication(req, res);
    auth.checkAdmin(req, res);

    try {
        // Query to get order summaries and customer info
        const sqlQuery = `
            SELECT order_id, order_date, customers.customer_id, first_name, last_name, total_amount 
            FROM order_summaries 
            JOIN customers ON customers.customer_id = order_summaries.customer_id
        `;
        const result = await client.query(sqlQuery);

        const orders = [];
        for (let order of result.rows) {
            let orderDetails = {
                orderId: order.order_id,
                orderDate: moment(order.order_date).format("YYYY-MM-DD HH:mm:ss"), // Format the date
                customerId: order.customer_id,
                customerName: order.first_name + " " + order.last_name,
                totalAmount: order.total_amount,
                products: []
            };

            // Query to get the products in the order
            const sqlQuery2 = `SELECT product_id, quantity, price FROM order_products WHERE order_id = $1`;
            const productResult = await client.query(sqlQuery2, [order.order_id]);

            // Add product details to the order
            for (let product of productResult.rows) {
                orderDetails.products.push({
                    productId: product.product_id,
                    quantity: product.quantity,
                    price: `$${product.price}`
                });
            }

            // Add the complete order with products to the orders array
            orders.push(orderDetails);
        }

        // Render the orders list page
        res.render('listorder', { 
            orders,
            username: req.session.authenticatedUser,
            title: "All Orders"
        });
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.status(500).send('Something went wrong!');
    }
});

module.exports = router;
