const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {

    let productList = false;
    if (!req.session.productList) {
        productList = [];
    } else {
        productList = req.session.productList;
    }

    let id = false;
    let quantity = false;

    if(req.query.id && req.query.quantity){
        id = req.query.id;
        quantity = req.query.quantity;

        id = parseInt(id);
        quantity = parseInt(quantity);
    }else{
        return res.redirect("/showcart");
    }

    // Update quantity
    productList[id].quantity = quantity;

    req.session.productList = productList;
    res.redirect("/showcart");
});

module.exports = router;
