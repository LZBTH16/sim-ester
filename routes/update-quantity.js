const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    // Ensure productList is an object
    let productList = req.session.productList || {};

    let id = false;
    let quantity = false;

    if (req.query.id && req.query.quantity) {
        id = req.query.id;
        quantity = req.query.quantity;

        id = parseInt(id);
        quantity = parseInt(quantity);
    } else {
        return res.redirect("/show-cart");
    }

    // Ensure the product exists in the cart and update quantity
    if (productList[id]) {
        productList[id].quantity = quantity;
    }

    req.session.productList = productList;
    res.redirect("/show-cart");
});

module.exports = router;