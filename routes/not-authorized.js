const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    res.setHeader('Content-Type', 'text/html');
    // Render the register form
    res.render('not-authorized', {
        title: "Error 401 Unauthorized",
        username: req.session.authenticatedUser
    });
});

module.exports = router;