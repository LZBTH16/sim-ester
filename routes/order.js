const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');

router.get('/', async function (req, res, next) {
    let productList = req.session.productList || [];

    // Check if the shopping cart is empty
    if (productList.length === 0) {
        return res.render('order', { emptyCart: true });
    }

    try {
        let sqlQuery = "";
        let results = [];

        // Verify username
        const username = req.session.authenticatedUser;

        const pool = await sql.connect(dbConfig);

        sqlQuery = "SELECT first_name, last_name, customer_id FROM customers WHERE username = @username";
        results = await pool.request()
            .input('username', sql.VarChar, username)
            .query(sqlQuery);

        const firstName = results.recordset[0].first_name;
        const lastName = results.recordset[0].last_name;
        const customerId = results.recordset[0].customer_id;

        // Process the order summary
        let total = 0;
        let orderItems = [];
        let subtotal = 0;
        
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            
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
        sqlQuery = "INSERT INTO order_summaries (order_date, total_amount, customer_id) VALUES (@order_date, @total_amount, @customer_id) RETURNING order_id;";
        let result = await pool.request()
            .input('order_date', sql.DateTime, currentDate)
            .input('total_amount', sql.Decimal, total)
            .input('customer_id', sql.Int, customerId)
            .query(sqlQuery);

        let orderId = result.rows[0].order_id;

        // Insert into order_products
        for (let product of productList) {
            if (!product){ 
                continue;
            }

            sqlQuery = "INSERT INTO order_products VALUES (@order_id, @product_id, @quantity, @price)";
            await pool.request()
                .input('order_id', sql.Int, orderId)
                .input('product_id', sql.Int, product.id)
                .input('quantity', sql.Int, product.quantity)
                .input('price', sql.Decimal, product.price)
                .query(sqlQuery);
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