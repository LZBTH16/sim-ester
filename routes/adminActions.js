const express = require('express');
const router = express.Router();
const auth = require('../auth');
const { Client } = require('pg'); 

// to display the page
router.get('/', async function(req, res, next) {
    auth.checkAuthentication(req, res); // display error msg if attempting to access page and not logged in
    const username = req.session.authenticatedUser;
    auth.checkAdmin(req, res);

    const successMessage = req.session.successMessage; // displaying success message when product updated, deleted, or added
    req.session.successMessage = null // clear message after displaying it

    res.render('adminActions', {
        username: username,
        title: "Admin Actions",
        successMessage: successMessage
    });
});

// to update a product
router.post('/updateProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const updateData = req.body;
    const {productId, productName, productPrice, productDesc, adminPassword} = updateData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/notAuthorized');
    }

    try {
        const pool = await sql.connect(dbConfig);

        // to preserve other data if admin doesn't update all fields
        const currentData = "SELECT * FROM product WHERE product_id = @product_id";
        const dataRequest = pool.request();
        dataRequest.input('product_id', sql.Int, productId);
        const result = await dataRequest.query(currentData);
        const currentProduct = result.recordset[0];

        const updateQuery = `
            UPDATE product
            SET
                product_name = @product_name,
                product_price = @product_price,
                product_desc = @product_desc
            WHERE product_id = @product_id`;

        await pool.request()
            .input('product_id', sql.Int, productId)
            .input('product_name', sql.VarChar, productName || currentProduct.product_name)
            .input('product_price', sql.Decimal, productPrice || currentProduct.product_price)
            .input('product_desc', sql.VarChar, productDesc || currentProduct.product_desc)
            .query(updateQuery);

        req.session.successMessage = 'Product updated successfully!';

        res.redirect('/adminActions');
    } catch (err) {
        console.error(err);
        res.write(err + "")
        res.end();
    }
});

// to delete a product
router.post('/deleteProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const deleteData = req.body;
    const {productId, adminPassword} = deleteData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/notAuthorized');
    }

    try {
        const pool = await sql.connect(dbConfig);

        // need to delete from the other tables first
        const deleteOrderProduct = "DELETE FROM order_products WHERE product_id = @product_id";
        await pool.request().input('product_id', sql.Int, productId).query(deleteOrderProduct);
        const deleteProductInventory = "DELETE FROM product_inventory WHERE product_id = @product_id";
        await pool.request().input('product_id', sql.Int, productId).query(deleteProductInventory);

        // now to delete from the product table
        const deleteQuery = "DELETE FROM product WHERE product_id = @product_id";
        await pool.request().input('product_id', sql.Int, productId).query(deleteQuery);
        
        req.session.successMessage = 'Product deleted successfully!';

        res.redirect('/adminActions');
    } catch (err) {
        console.error(err);
        res.write(err + "")
        res.end();
    }
});

// to add a product
router.post('/addProduct', async function (req, res, next) {
    auth.checkAuthentication(req, res);

    const newData = req.body;
    const {productName, productPrice, productDesc, categoryId, adminPassword} = newData;

    if(adminPassword !== process.env.ADMIN_PASSWORD){
        return res.redirect('/notAuthorized');
    }

    try {
        const pool = await sql.connect(dbConfig);
        
        const addQuery = "INSERT INTO products(product_name, category_id, product_desc, product_price) VALUES (@product_name, @category_id, @product_desc, @product_price)";
        await pool.request()
        .input('product_name', sql.VarChar, productName)
        .input('category_id', sql.Int, categoryId)
        .input('product_desc', sql.VarChar, productDesc)
        .input('product_price', sql.Decimal, productPrice)
        .query(addQuery);
    
        req.session.successMessage = 'Product added successfully!';

        res.redirect('/adminActions');
    } catch (err) {
        console.error(err);
        res.write(err + "")
        res.end();
    }
});

module.exports = router;