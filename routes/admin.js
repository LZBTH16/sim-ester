const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { Client } = require('pg'); 
const moment = require('moment');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', async function(req, res, next) {
    try {
        auth.checkAuthentication(req, res);
        auth.checkAdmin(req, res);

        // getting orders per day
        const sqlQuery = "SELECT CAST(order_date AS DATE) AS order_date, SUM(total_amount) AS sum_total FROM order_summaries GROUP BY CAST(order_date AS DATE)";
        const results = await client.query(sqlQuery);

        // Iterate through every order in the recordset
        const orders = results.rows.map(order => ({
            orderDate: moment(order.order_date).format('YYYY-MM-DD'),
            sumTotal: order.sum_total
        }));

        // getting customer info
        const sqlQuery2 = "SELECT * FROM customers";
        const results2 = await client.query(sqlQuery2);

        const customerInfo = results2.rows.map(customer => ({
            username: customer.username,
            customerId: customer.customer_id,
            firstName: customer.first_name,
            lastName: customer.last_name,
            email: customer.email,
            phoneNum: customer.phone_num,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            postalCode: customer.postal_code,
            country: customer.country
        }));

        // sending the data to the admin.handlebars
        res.render('admin', {
            orders: JSON.stringify(orders),
            customerInfo,
            username: req.session.authenticatedUser,
            title: "Admin"
        });

    } catch (err) {
        console.dir(err);
        res.write(err + "");
    }
});

module.exports = router;
