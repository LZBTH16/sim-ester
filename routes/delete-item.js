const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {

    let productList = {};
    if (req.session.productList) {
        productList = req.session.productList;
    }

    let id = false;

    if (req.query.id) {
        id = parseInt(req.query.id, 10); // Ensure id is a number
    } else {
        return res.redirect("/show-cart");
    }

    if (id >= 0) {
        delete productList[id]; // Remove the item by its key
    }

    req.session.productList = productList;
    res.redirect("/show-cart");
});

module.exports = router;
