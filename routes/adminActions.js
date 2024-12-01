const express = require('express');
const router = express.Router();
const auth = require('../auth');
const sql = require('mssql');
const moment = require('moment');

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
    const {productId, productName, productPrice, productDesc} = updateData;

    try {
        const pool = await sql.connect(dbConfig);

        // to preserve other data if admin doesn't update all fields
        const currentData = "SELECT * FROM product WHERE productId = @productId";
        const dataRequest = pool.request();
        dataRequest.input('productId', sql.Int, productId);
        const result = await dataRequest.query(currentData);
        const currentProduct = result.recordset[0];

        const updateQuery = `
            UPDATE product
            SET
                productName = @productName,
                productPrice = @productPrice,
                productDesc = @productDesc
            WHERE productId = @productId`;

        await pool.request()
            .input('productId', sql.Int, productId)
            .input('productName', sql.VarChar, productName || currentProduct.productName)
            .input('productPrice', sql.Decimal, productPrice || currentProduct.productPrice)
            .input('productDesc', sql.VarChar, productDesc || currentProduct.productDesc)
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

    const updateData = req.body;
    const {productId} = updateData;

    try {
        const pool = await sql.connect(dbConfig);

        // need to delete from the other tables first
        const deleteOrderProduct = "DELETE FROM orderproduct WHERE productId = @productId";
        await pool.request().input('productId', sql.Int, productId).query(deleteOrderProduct);
        const deleteProductInventory = "DELETE FROM productinventory WHERE productId = @productId";
        await pool.request().input('productId', sql.Int, productId).query(deleteProductInventory);

        // now to delete from the product table
        const deleteQuery = "DELETE FROM product WHERE productId = @productId";
        await pool.request().input('productId', sql.Int, productId).query(deleteQuery);
        
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
    const {productName, productPrice, productDesc, categoryId} = newData;

    try {
        const pool = await sql.connect(dbConfig);
        
        const addQuery = "INSERT INTO product(productName, categoryId, productDesc, productPrice) VALUES (@productName, @categoryId, @productDesc, @productPrice)";
        await pool.request()
        .input('productName', sql.VarChar, productName)
        .input('categoryId', sql.Int, categoryId)
        .input('productDesc', sql.VarChar, productDesc)
        .input('productPrice', sql.Decimal, productPrice)
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