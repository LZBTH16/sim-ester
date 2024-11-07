const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = req.session.productList || [];

    // Calculate the total for the cart
    let total = productList.reduce((sum, product) => {
        if (product) {
            return sum + (product.quantity * product.price);
        }
        return sum;
    }, 0);

    // Render the Handlebars template and pass productList and total
    res.render('showcart', { productList, total });
});

module.exports = router;
