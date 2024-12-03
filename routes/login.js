const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    // Set the message for the login, if present
    let redirectCart = req.query.redirectCart;

    let loginMessage = false;
    if (req.session.loginMessage) {
        loginMessage = req.session.loginMessage;
        req.session.loginMessage = false;
    }

    res.render('login', {
        title: "Login",
        loginMessage: loginMessage,
        redirectCart: redirectCart
    });
});

module.exports = router;
