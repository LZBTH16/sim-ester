const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { Client } = require('pg'); 

const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.connect();

router.get('/', async function(req, res, next) {
    auth.checkAuthentication(req, res);
    const username = req.session.authenticatedUser;
    auth.checkAdmin(req, res);

    const successMessage = req.session.successMessage;
    req.session.successMessage = null;

    res.render('adminActions', {
        username: username,
        title: "Admin Actions",
        successMessage: successMessage
    });
});

router.post('/updateProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const updateData = req.body;
    const {productId, productName, productPrice, productDesc, adminPassword} = updateData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/notAuthorized');
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
        res.redirect('/adminActions');
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
        return res.redirect('/notAuthorized');
    }

    try {
        const deleteOrderProduct = "DELETE FROM order_products WHERE product_id = $1";
        await client.query(deleteOrderProduct, [productId]);

        const deleteQuery = "DELETE FROM products WHERE product_id = $1";
        await client.query(deleteQuery, [productId]);

        req.session.successMessage = 'Product deleted successfully!';
        res.redirect('/adminActions');
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
        return res.redirect('/notAuthorized');
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
        res.redirect('/adminActions');
    } catch (err) {
        console.error(err);
        res.write(err + "");
        res.end();
    }
});

module.exports = router;
