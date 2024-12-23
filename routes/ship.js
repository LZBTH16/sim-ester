const express = require('express');
const router = express.Router();
const { Client } = require('pg'); 
const moment = require('moment');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    const orderId = parseInt(req.query.order_id);
          
    if(!orderId) {
        return res.render('ship', {message: 'Invalid Order ID'});
    }

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

           // Start a transaction
           const transaction = new sql.Transaction(pool); 
           await transaction.begin();
	   	
            const sqlQuery = "SELECT * FROM order_products WHERE order_id = @orderId";
            const result = await pool.request().input('orderId', sql.Int, orderId).query(sqlQuery);

            let ship_date = moment(new Date()).format('YYYY-MM-DD'); // check this
            const sql_ship_query = "INSERT INTO shipments (shipment_date, shipment_desc, warehouse_id) VALUES (@ship_date, 'Shipment for order @orderId', 1)";  
            await pool.request().input('ship_date', sql.DateTime, ship_date).query(sql_ship_query);
            
            // an array to store the shipment details for rendering
            let shipmentDetails = [];

            for(let item of result.recordset) {
                const productId = item.product_id;
                const quantity = item.quantity;

                // getting available inventory
                const sqlInvQuery = "SELECT quantity FROM product_inventory WHERE product_id = @product_id AND warehouse_id = 1"; 
                const inventoryCheck = await pool.request().input('product_id', sql.Int, productId).query(sqlInvQuery);

                const availableQuantity = inventoryCheck.recordset[0]?.quantity || 0;

                // checking if there is enough inventory
                if(availableQuantity < quantity) {
                    await transaction.rollback();
                    return res.render('ship', {message: `Not enough inventory for product ${productId}. Required: ${quantity}, Available: ${availableQuantity}`});
                }

                // updating shipment details for rendering
                shipmentDetails.push({
                    productId: productId,
                    quantity: quantity,
                    prevInventory: availableQuantity,
                    newInventory: availableQuantity - quantity
                });

                // update the inventory
                const sql_update_query = "UPDATE product_inventory SET quantity = quantity - @qty WHERE product_id = @product_id AND warehouse_id = 1";
                await pool.request().input('product_id', sql.Int, product_id).input('qty', sql.Int, quantity).query(sql_update_query); 
            }

            // commit the transaction after successfully updating all inventories 
            await transaction.commit();

            // rendering the page
            res.render('ship', {
                shipmentDetails: shipmentDetails,
                message: 'Shipment processed successfully'
            })
 
        } catch(err) {
            console.dir(err);
            await transaction.rollback(); // rollback if any errors
            res.write(err + "")
        }
    })();
});

module.exports = router;
