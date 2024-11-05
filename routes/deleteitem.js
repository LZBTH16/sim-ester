const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');

    let productList = false;
    if (!req.session.productList) {
        productList = [];
    } else {
        productList = req.session.productList;
    }

    let id = false;

    if(req.query.id){
        id = req.query.id;
    }else{
        res.redirect("/showcart");
    }

    // Delete the product
    delete productList[id];

    req.session.productList = productList;
    res.redirect("/showcart");
});

module.exports = router;