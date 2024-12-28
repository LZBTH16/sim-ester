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
const loadData = require('./routes/load-data');
const listOrder = require('./routes/list-order');
const listProd = require('./routes/list-prod');
const addCart = require('./routes/add-cart');
const showCart = require('./routes/show-cart');
const checkout = require('./routes/checkout');
const order = require('./routes/order');
const deleteItem = require('./routes/delete-item');
const updateQuantity = require('./routes/update-quantity');
const displayImage = require('./routes/display-image');
const index = require('./routes/index');
const validateLogin = require('./routes/validate-login');
const admin = require('./routes/admin');
const product = require('./routes/product');
const login = require('./routes/login');
const customer = require('./routes/customer');
const logout = require('./routes/logout');
const register = require('./routes/register');
const validateRegister = require('./routes/validate-register');
const customerEdit = require('./routes/customer-edit');
const review = require('./routes/review');
const notAuthorized = require('./routes/not-authorized');
const forgotPassword = require('./routes/forgot-password');
const orderHistory = require('./routes/order-history');

app.use('/load-data', loadData);
app.use('/list-order', listOrder);
app.use('/list-prod', listProd);
app.use('/add-cart', addCart);
app.use('/show-cart', showCart);
app.use('/checkout', checkout);
app.use('/order', order);
app.use('/delete-item', deleteItem);
app.use('/update-quantity', updateQuantity);
app.use('/display-image', displayImage);
app.use('/index', index);
app.use('/validate-login', validateLogin);
app.use('/admin', admin);
app.use('/product', product);
app.use('/login', login);
app.use('/customer', customer);
app.use('/logout', logout);
app.use('/register', register);
app.use('/validate-register', validateRegister);
app.use('/customer-edit', customerEdit);
app.use('/review', review);
app.use('/not-authorized', notAuthorized);
app.use('/forgot-password', forgotPassword);
app.use('/order-history', orderHistory);

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
