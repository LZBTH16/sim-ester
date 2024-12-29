const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { Client } = require('pg');
const moment = require('moment');
const multer = require('multer');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Set the storage engine to memoryStorage
const storage = multer.memoryStorage();

// Set file size limit to 15MB (15 * 1024 * 1024 bytes)
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 15 * 1024 * 1024 }  // 15MB limit
}).single('productImage');  // Assuming 'productImage' is the field name for image uploads

client.connect();

router.get('/', async function(req, res, next) {
    try {
        auth.checkAuthentication(req, res);
        auth.checkAdmin(req, res);

        // what to show after updating/deleting/adding product
        const successMessage = req.session.successMessage;
        req.session.successMessage = null;

        // getting orders per day
        let sqlQuery = "SELECT CAST(order_date AS DATE) AS order_date, SUM(total_amount) AS sum_total, SUM(quantity) AS products_sold FROM order_summaries JOIN order_products ON order_summaries.order_id = order_products.order_id GROUP BY CAST(order_date AS DATE) ORDER BY order_date ASC";
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

        sqlQuery = "SELECT product_name, SUM(quantity) AS sales_count FROM products JOIN order_products ON products.product_id = order_products.product_id GROUP BY product_name ORDER BY product_name ASC";
        results = await client.query(sqlQuery);

        const productData = results.rows.map(product => ({
            productName: product.product_name,
            salesCount: product.sales_count
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

router.post('/updateProduct', upload, async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const updateData = req.body;
    const {productId, productName, productPrice, productDesc, adminPassword} = updateData;

    // Check if file size exceeds 15MB
    if (req.file && req.file.size > 15 * 1024 * 1024) {
        return res.status(400).send('File size exceeds the 15MB limit');
    }

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/not-authorized');
    }

    try {
        const currentDataQuery = "SELECT * FROM products WHERE product_id = $1";
        const currentDataResult = await client.query(currentDataQuery, [productId]);
        const currentProduct = currentDataResult.rows[0];
        const productImage = req.file ? req.file.buffer : currentProduct.product_image;

        let updateQuery = `
            UPDATE products
            SET
                product_name = $1,
                product_price = $2,
                product_desc = $3,
                product_image = $4
            WHERE product_id = $5`;

        await client.query(updateQuery, [
            productName || currentProduct.product_name,
            productPrice || currentProduct.product_price,
            productDesc || currentProduct.product_desc,
            productImage,
            productId
        ]);

        // Get rid of an existing image URL since we are now using the one in the database
        updateQuery = "UPDATE products SET product_image_url = NULL WHERE product_id = $1";
        await client.query(updateQuery, [productId]);

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

router.post('/addProduct', upload, async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const newData = req.body;
    const {productName, productPrice, productDesc, categoryId, adminPassword} = newData;

    // Check if file size exceeds 15MB
    if (req.file && req.file.size > 15 * 1024 * 1024) {
        return res.status(400).send('File size exceeds the 15MB limit');
    }

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/not-authorized');
    }

    try {
        const productImage = req.file ? req.file.buffer : null;
        const addQuery = "INSERT INTO products (product_name, category_id, product_desc, product_price, product_image) VALUES ($1, $2, $3, $4, $5)";
        await client.query(addQuery, [
            productName,
            categoryId,
            productDesc,
            productPrice,
            productImage
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