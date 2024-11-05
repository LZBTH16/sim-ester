const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>SIM-ESTER Order Processing</title>");

    // shopping cart
    let productList = false;
    if (req.session.productList && req.session.productList.length > 0) {
        productList = req.session.productList;
    }
    else{
        res.write('<h1>Your shopping cart is empty!</h1>');
        res.end();
        return;
    }
    
    /**
    Determine if valid customer id was entered
    Determine if there are products in the shopping cart
    If either are not true, display an error message
    **/

    (async function() {
        try{
            let sqlQuery = "";
            let results = [];

            // Verify customerId and password
            let customerId = req.query.customerId;
            let password = req.query.password;
            customerId = Number(customerId);

            let pool = await sql.connect(dbConfig);

            sqlQuery = "SELECT firstName, lastName FROM customer WHERE customerId = @customerId AND password = @password";
            results = await pool.request()
                .input('customerId', sql.Int, customerId)
                .input('password', sql.VarChar, password)
                .query(sqlQuery);

            // Check if user exists, or if the customerId is a valid number
            if(results.recordset.length === 0 || !Number.isInteger(customerId) || customerId < 0){
                res.write('<h1>Invalid account details. Go back to the previous page and try again.</h1>');
                res.end();
                return;
            }

            let firstName = results.recordset[0].firstName;
            let lastName = results.recordset[0].lastName;

            // Show Order Summary
            res.write('<h1>Your Order Summary</h1>');
            res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
            res.write("<th>Price</th><th>Subtotal</th></tr>");

            let total = 0;
            for (let i = 0; i < productList.length; i++) {
                product = productList[i];
                if (!product) {
                    continue
                }
    
                res.write("<tr><td>" + product.id + "</td>");
                res.write("<td>" + product.name + "</td>");
    
                res.write("<td align=\"center\">" + product.quantity + "</td>");
    
                res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
                res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td></tr>");
                res.write("</tr>");
                total = total + product.quantity * product.price;
            }
            res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
            res.write("</table>");

            // Insert into ordersummary
            let currentDate = new Date();
            sqlQuery = "INSERT INTO ordersummary (orderDate, totalAmount, customerId) OUTPUT INSERTED.orderId VALUES(@orderDate, @totalAmount, @customerId)";
            let result = await pool.request()
                .input('orderDate', sql.DateTime, currentDate)
                .input('totalAmount', sql.Decimal, total)
                .input('customerId', sql.Int, customerId)
                .query(sqlQuery);

            let orderId = result.recordset[0].orderId;

            res.write("<h1>Order completed. Will be shipped soon...</h1>");
            res.write('<h1>Your order reference number is: ' + orderId + '</h1>');
            res.write('<h1>Shipping to customer: ' + customerId + ' Name: ' + firstName + ' ' + lastName + '</h1>');

            // Insert into orderproduct
            for(let i = 0; i < productList.length; i++){
                product = productList[i];
                if (!product){
                    continue;
                }

                sqlQuery = "INSERT INTO orderproduct VALUES (@orderId, @productId, @quantity, @price)"
                result = await pool.request()
                    .input('orderId', sql.Int, orderId)
                    .input('productId', sql.Int, product.id)
                    .input('quantity', sql.Int, product.quantity)
                    .input('price', sql.Decimal, product.price)
                    .query(sqlQuery);
            }

            // Clear shopping cart (sessional variable)
            req.session.destroy();
            res.end();

        } catch(err){
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }

    })();


    /** Make connection and validate **/

    /** Save order information to database**/


        /**
        // Use retrieval of auto-generated keys.
        sqlQuery = "INSERT INTO <TABLE> OUTPUT INSERTED.orderId VALUES( ... )";
        let result = await pool.request()
            .input(...)
            .query(sqlQuery);
        // Catch errors generated by the query
        let orderId = result.recordset[0].orderId;
        **/

    /** Insert each item into OrderedProduct table using OrderId from previous INSERT **/

    /** Update total amount for order record **/

    /** For each entry in the productList is an array with key values: id, name, quantity, price **/

    /**
        for (let i = 0; i < productList.length; i++) {
            let product = products[i];
            if (!product) {
                continue;
            }
            // Use product.id, product.name, product.quantity, and product.price here
        }
    **/

    /** Print out order summary **/

    /** Clear session/cart **/

    // res.end();
});

module.exports = router;
