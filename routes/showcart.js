const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
    let productList = false;
    res.setHeader('Content-Type', 'text/html');
    res.write("<title>Your Shopping Cart</title>");
    if (req.session.productList) {
        productList = req.session.productList;
        res.write("<h1>Your Shopping Cart</h1>");
        res.write("<table><tr><th>Product Id</th><th>Product Name</th><th>Quantity</th>");
        res.write("<th>Price</th><th>Subtotal</th></tr>");

        let total = 0;
        for (let i = 0; i < productList.length; i++) {
            product = productList[i];
            if (!product) {
                continue
            }

            res.write("<tr><td>" + product.id + "</td>");
            res.write("<td>" + product.name + "</td>");

            res.write(`<td align=\"center\"><input type=\"number\" id=${product.id} value=\"${product.quantity}" min=\"1\" style=\"width: 40px; text-align: center;\"></td>`);
            res.write("<td align=\"right\">$" + Number(product.price).toFixed(2) + "</td>");
            res.write("<td align=\"right\">$" + (Number(product.quantity.toFixed(2)) * Number(product.price)).toFixed(2) + "</td>");
            // Delete Item
            res.write(`<td><a href='deleteitem?id=${product.id}'>Remove from cart</a></td>`);
            // Update Quantity Button
            res.write(`<td><button onclick="updateQuantity(${product.id})">Update Quantity</button></td>`);
            res.write("</tr>");
            total = total + product.quantity * product.price;
        }

        res.write(`
            <script>
            function updateQuantity(productId){
                let quantity = document.getElementById(productId).value;
                
                window.location.href = 'updatequantity?id=productId&quantity=quantity';
            }
            </script>
            `);

        
        res.write("<tr><td colspan=\"4\" align=\"right\"><b>Order Total</b></td><td align=\"right\">$" + total.toFixed(2) + "</td></tr>");
        res.write("</table>");

        res.write("<h2><a href=\"checkout\">Check Out</a></h2>");
    } else{
        res.write("<h1>Your shopping cart is empty!</h1>");
    }
    res.write('<h2><a href="listprod">Continue Shopping</a></h2>');

    res.end();
});

module.exports = router;
