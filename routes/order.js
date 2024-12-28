const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', async function (req, res, next) {
    let productList = req.session.productList || [];

    if (productList.length === 0) {
        return res.render('order', { emptyCart: true });
    }

    try {
        let sqlQuery = "";
        let results = [];

        const username = req.session.authenticatedUser;

        // Verify username
        sqlQuery = "SELECT first_name, last_name, customer_id FROM customers WHERE username = $1";
        results = await client.query(sqlQuery, [username]);

        const firstName = results.rows[0].first_name;
        const lastName = results.rows[0].last_name;
        const customerId = results.rows[0].customer_id;

        let total = 0;
        let orderItems = [];
        let subtotal = 0;
        
        for (let i = 0; i < productList.length; i++) {
            const product = productList[i];
            
            if (!product){
                continue;
            }
            
            subtotal = (Number(product.quantity) * Number(product.price)).toFixed(2);
            total += product.quantity * product.price;
            
            orderItems.push({
                id: product.id,
                name: product.name,
                quantity: product.quantity,
                price: Number(product.price).toFixed(2),
                subtotal: subtotal
            });
        }

        // Insert into order_summaries
        let currentDate = new Date();
        sqlQuery = "INSERT INTO order_summaries (order_date, total_amount, customer_id) VALUES ($1, $2, $3) RETURNING order_id;";
        let result = await client.query(sqlQuery, [currentDate, total, customerId]);

        let orderId = result.rows[0].order_id;

        // Insert into order_products
        for (let product of productList) {
            if (!product) { 
                continue;
            }

            sqlQuery = "INSERT INTO order_products (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)";
            await client.query(sqlQuery, [
                orderId, 
                product.id, 
                product.quantity, 
                product.price
            ]);

            sqlQuery = "UPDATE products SET sales_count = sales_count + $1 WHERE product_id = $2";
            await client.query(sqlQuery, [product.quantity, product.id]);
        }

        // Clear shopping cart (sessional variable)
        req.session.productList = [];

        // Render the order summary
        res.render('order', {
            customer: { id: customerId, firstName, lastName },
            order: { id: orderId, date: moment(currentDate).format('YYYY-MM-DD'), total: total.toFixed(2) },
            items: orderItems,
            username: req.session.authenticatedUser,
            title: "Your Order"
        });

    } catch (err) {
        console.dir(err);
        res.render('order', { errorMessage: JSON.stringify(err) });
    }
});

module.exports = router;
