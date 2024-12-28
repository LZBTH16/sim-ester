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

        // what to show after updating/deleting/adding product
        const successMessage = req.session.successMessage;
        req.session.successMessage = null;

        // getting orders per day
        let sqlQuery = "SELECT CAST(order_date AS DATE) AS order_date, SUM(total_amount) AS sum_total, COUNT(product_id) AS products_sold FROM order_summaries JOIN order_products ON order_summaries.order_id = order_products.order_id GROUP BY CAST(order_date AS DATE) ORDER BY order_date ASC";
        let results = await client.query(sqlQuery);

        // Iterate through every order in the recordset
        const orders = results.rows.map(order => ({
            orderDate: moment(order.order_date).format('YYYY-MM-DD'),
            sumTotal: order.sum_total,
            productsSold: order.products_sold
        }));

        // getting customer info
        sqlQuery = "SELECT * FROM customers";
        results = await client.query(sqlQuery);

        const customerInfo = results.rows.map(customer => ({
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

        sqlQuery = "SELECT CAST(order_date AS DATE) AS order_date, products.product_name, SUM(quantity) AS total_quantity FROM order_summaries JOIN order_products ON order_summaries.order_id = order_products.order_id JOIN products ON order_products.product_id = products.product_id GROUP BY CAST(order_date AS DATE), products.product_name ORDER BY order_date ASC";
        results = await client.query(sqlQuery);

        const productData = results.rows.map(row => ({
            orderDate: moment(row.order_date).format('YYYY-MM-DD'),
            productName: row.product_name,
            totalQuantity: row.total_quantity
        }));

        // sending the data to the admin.handlebars
        res.render('admin', {
            orders: JSON.stringify(orders),
            customerInfo,
            productData: JSON.stringify(productData),
            username: req.session.authenticatedUser,
            successMessage: successMessage,
            title: "Admin"
        });

    } catch (err) {
        console.dir(err);
        res.write(err + "");
    }
});

router.post('/updateProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const updateData = req.body;
    const {productId, productName, productPrice, productDesc, adminPassword} = updateData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/not-authorized');
    }

    try {
        const currentDataQuery = "SELECT * FROM products WHERE product_id = $1";
        const currentDataResult = await client.query(currentDataQuery, [productId]);
        const currentProduct = currentDataResult.rows[0];

        const updateQuery = `
            UPDATE products
            SET
                product_name = $1,
                product_price = $2,
                product_desc = $3
            WHERE product_id = $4`;

        await client.query(updateQuery, [
            productName || currentProduct.product_name,
            productPrice || currentProduct.product_price,
            productDesc || currentProduct.product_desc,
            productId
        ]);

        req.session.successMessage = 'Product updated successfully!';
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.write(err + "");
        res.end();
    }
});

router.post('/deleteProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const deleteData = req.body;
    const {productId, adminPassword} = deleteData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/not-authorized');
    }

    try {
        const deleteOrderProduct = "DELETE FROM order_products WHERE product_id = $1";
        await client.query(deleteOrderProduct, [productId]);

        const deleteQuery = "DELETE FROM products WHERE product_id = $1";
        await client.query(deleteQuery, [productId]);

        req.session.successMessage = 'Product deleted successfully!';
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.write(err + "");
        res.end();
    }
});

router.post('/addProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const newData = req.body;
    const {productName, productPrice, productDesc, categoryId, adminPassword} = newData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/not-authorized');
    }

    try {
        const addQuery = "INSERT INTO products (product_name, category_id, product_desc, product_price) VALUES ($1, $2, $3, $4)";
        await client.query(addQuery, [
            productName,
            categoryId,
            productDesc,
            productPrice
        ]);

        req.session.successMessage = 'Product added successfully!';
        res.redirect('/admin');
    } catch (err) {
        console.error(err);
        res.write(err + "");
        res.end();
    }
});

module.exports = router;
