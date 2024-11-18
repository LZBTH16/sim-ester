const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.render('checkout', {
        title: "SIM-ESTER Checkout Line"
    }); 
});

module.exports = router;