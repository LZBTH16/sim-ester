require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');

const app = express();

// Setting up the session.
app.use(session({
  secret: 'COSC 304 Rules!',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    secure: false,
  }
}));

// Setting up the rendering engine
app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: 'views/partials',
  helpers: {
    multiply: (a, b) => (a * b).toFixed(2),
    formatPrice: (value) => Number(value).toFixed(2),
    multiplyAndFormat: (a, b) => (a * b).toFixed(2),
    eq: function (a, b) {
      return a === b;
    }
  }
}));
app.set('view engine', 'handlebars');

// Parses req.body
app.use(express.urlencoded({ extended: true }));

// Define routes
const loadData = require('./routes/loaddata');
const listOrder = require('./routes/listorder');
const listProd = require('./routes/listprod');
const addCart = require('./routes/addcart');
const showCart = require('./routes/showcart');
const checkout = require('./routes/checkout');
const order = require('./routes/order');
const deleteItem = require('./routes/deleteitem');
const updateQuantity = require('./routes/updatequantity');
const displayImage = require('./routes/displayImage');
const index = require('./routes/index');
const validateLogin = require('./routes/validateLogin');
const admin = require('./routes/admin');
const product = require('./routes/product');
const login = require('./routes/login');
const customer = require('./routes/customer');
const logout = require('./routes/logout');
const register = require('./routes/register');
const validateRegister = require('./routes/validateRegister');
const customerEdit = require('./routes/customerEdit');
const review = require('./routes/review');
const notAuthorized = require('./routes/notAuthorized');
const forgotPassword = require('./routes/forgotPassword');

app.use('/loaddata', loadData);
app.use('/listorder', listOrder);
app.use('/listprod', listProd);
app.use('/addcart', addCart);
app.use('/showcart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/deleteitem', deleteItem);
app.use('/updatequantity', updateQuantity);
app.use('/displayImage', displayImage);
app.use('/index', index);
app.use('/validateLogin', validateLogin);
app.use('/admin', admin);
app.use('/product', product);
app.use('/login', login);
app.use('/customer', customer);
app.use('/logout', logout);
app.use('/register', register);
app.use('/validateRegister', validateRegister);
app.use('/customerEdit', customerEdit);
app.use('/review', review);
app.use('/notAuthorized', notAuthorized);
app.use('/forgotPassword', forgotPassword);

// setting up CSS & images
app.use(express.static('public'));

// Redirect root to /index
app.get('/', (req, res) => {
  res.redirect('/index');
});

// Start the server
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
