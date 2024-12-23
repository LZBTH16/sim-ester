const express = require('express');
const router = express.Router();
const sql = require('mssql');
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

        sqlQuery = "SELECT firstName, lastName, customerId FROM customer WHERE userid = @userid";
        results = await pool.request()
            .input('userid', sql.VarChar, username)
            .query(sqlQuery);

        const firstName = results.recordset[0].firstName;
        const lastName = results.recordset[0].lastName;
        const customerId = results.recordset[0].customerId;

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

        // Insert into ordersummary
        let currentDate = new Date();
        sqlQuery = "INSERT INTO ordersummary (orderDate, totalAmount, customerId) OUTPUT INSERTED.orderId VALUES(@orderDate, @totalAmount, @customerId)";
        let result = await pool.request()
            .input('orderDate', sql.DateTime, currentDate)
            .input('totalAmount', sql.Decimal, total)
            .input('customerId', sql.Int, customerId)
            .query(sqlQuery);

        let orderId = result.recordset[0].orderId;

        // Insert into orderproduct
        for (let product of productList) {
            if (!product){ 
                continue;
            }

            sqlQuery = "INSERT INTO orderproduct VALUES (@orderId, @productId, @quantity, @price)";
            await pool.request()
                .input('orderId', sql.Int, orderId)
                .input('productId', sql.Int, product.id)
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