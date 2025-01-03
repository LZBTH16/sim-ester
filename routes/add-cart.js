const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    // If the product list isn't set in the session,
    // create a new object.
    let productList = {};
    if (req.session.productList) {
        productList = req.session.productList;
    }

    // Add new product selected
    // Get product information
    let id = false;
    let name = false;
    let price = false;
    if (req.query.id && req.query.name && req.query.price) {
        id = req.query.id;
        name = req.query.name;
        price = req.query.price;
    } else {
        return res.redirect("/list-prod"); // added "return" so that the code below does not execute
    }

    // Update quantity if add same item to order again
    if (productList[id]) {
        productList[id].quantity = productList[id].quantity + 1;
    } else {
        productList[id] = {
            "id": id,
            "name": name,
            "price": price,
            "quantity": 1
        };
    }

    req.session.productList = productList;
    res.redirect("/show-cart");
});

module.exports = router;