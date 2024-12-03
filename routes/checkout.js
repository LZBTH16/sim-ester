const express = require('express');
const router = express.Router();
const auth = require('../auth');

router.get('/', function(req, res, next) {
    auth.checkAuthentication(req, res);

    res.render('checkout', {
        title: "SIM-ESTER Checkout",
        username: req.session.authenticatedUser
    }); 
});

module.exports = router;