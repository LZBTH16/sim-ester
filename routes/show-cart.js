const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    // Ensure productList is treated as an object
    let productList = req.session.productList || {};

    // Calculate the total for the cart by iterating over the values of the object
    let total = Object.values(productList).reduce((sum, product) => {
        if (product) {
            return sum + (product.quantity * product.price);
        }
        return sum;
    }, 0);

    // Render the Handlebars template and pass productList and total
    res.render('show-cart', { 
        productList: Object.values(productList), // Pass the values of the object to the template
        total,
        username: req.session.authenticatedUser,
        title: "Your Cart"
    });
});

module.exports = router;
