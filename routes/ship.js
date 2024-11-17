const express = require('express');
const router = express.Router();
const sql = require('mssql');
const moment = require('moment');

router.get('/', async function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

	// TODO: Get order id
    const orderId = parseInt(req.query.orderId);
          
	// TODO: Check if valid order id
    if(!orderId) {
        return res.render('ship', {message: 'Invalid Order ID'});
    }
		  

    (async function() {
        try {
            const pool = await sql.connect(dbConfig);

           // Start a transaction
           const transaction = new sql.Transaction(pool); 
           await transaction.begin();
	   	
            // TODO: Retrieve all items in order with given id
            const sqlQuery = "SELECT * FROM orderproduct WHERE orderId = @orderId";
            const result = await pool.request().input('orderId', sql.Int, orderId).query(sqlQuery);

            // TODO: Create a new shipment record.
            let shipDate = moment(new Date()).format('YYYY-MM-DD'); // check this
            const sqlShipQuery = "INSERT INTO shipment (shipmentDate, shipmentDesc, warehouseId) VALUES (@shipDate, 'Shipment for order @orderId', 1)";  
            await pool.request().input('shipDate', sql.DateTime, shipDate).query(sqlShipQuery);
            
            // an array to store the shipment details for rendering
            let shipmentDetails = [];

            // TODO: For each item verify sufficient quantity available in warehouse 1.
            for(let item of result.recordset) {
                const {productId, quantity} = item;

                // getting available inventory
                const sqlInvQuery = "SELECT quantity FROM productinventory WHERE productId = @productId AND warehouseId = 1"; 
                const inventoryCheck = await pool.request().input('productId', sql.Int, productId).query(sqlInvQuery);

                const availableQty = inventoryCheck.recordset[0]?.quantity || 0;

                // TODO: If any item does not have sufficient inventory, cancel transaction and rollback. Otherwise, update inventory for each item.
                // checking if there is enough inventory
                if(availableQty < quantity) {
                    await transaction.rollback();
                    return res.render('ship', {message: `Not enough inventory for product ${productId}. Required: ${quantity}, Available: ${availableQty}`});
                }

                // updating shipment details for rendering
                shipmentDetails.push({
                    productId: productId,
                    qty: quantity,
                    prevInventory: availableQty,
                    newInventory: availableQty - quantity
                });

                // update the inventory
                const sqlUpdateQuery = "UPDATE productinventory SET quantity = quantity - @qty WHERE productId = @productId AND warehouseId = 1";
                await pool.request().input('productId', sql.Int, productId).input('qty', sql.Int, quantity).query(sqlUpdateQuery); 
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
