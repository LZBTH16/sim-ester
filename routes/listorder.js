const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    res.write('<title>SIM-ESTER Order List</title>');

    /** Create connection, and validate that it connected successfully **/

    /**
    Useful code for formatting currency:
        let num = 2.87879778;
        num = num.toFixed(2);
    **/

    /** Write query to retrieve all order headers **/

    (async function() {
        try {
            let pool = await sql.connect(dbConfig);

            let sqlQuery = "SELECT orderId, orderDate, customerId, customerName, totalAmount FROM ordersummary JOIN customer ON customer.customerId = ordersummary.customerId";
            let results = await pool.request().query(sqlQuery);
            
            res.write("<table><tr><th>OrderId</th><th>Order Date</th><th>Customer Id</th><th>Customer Name</th><th>Total Amount</th></tr>");
            for (let i = 0; i < results.recordset.length; i++) {
                let result = results.recordset[i];
                res.write("<tr><td>" + result.orderId + "</td><td>" + result.orderDate + "</td><td>" + result.customerId + "</td><td>" + result.customerName + "</td><td>" + result.totalAmount + "</td></tr>");
                
                let sqlQuery2 = "SELECT productId, quantity, price FROM orderproduct WHERE orderId = {result.orderId}";
                let result2 = await pool.request().query(sqlQuery2);
                for(let j = 0; j < result2.recordset.length; j++){
                    let price = result2.price;
                    price = 
                    res.write("<tr><td>" + result2.productId + "</td><td>" + result2.quantity + "</td><td>" + result2.price + "</td></tr>");
                }
            }
            res.write("</table>");

            res.end();
        } catch(err) {
            console.dir(err);
            res.write(JSON.stringify(err));
            res.end();
        }})();
    
    /** For each order in the results
            Print out the order header information
            Write a query to retrieve the products in the order

            For each product in the order
                Write out product information 
    **/

    // res.end();
});

module.exports = router;
