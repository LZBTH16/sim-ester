require('dotenv').config();
const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const { neon } = require('@neondatabase/serverless'); // Neon DB integration

const sql = neon(process.env.DATABASE_URL); // Connect to Neon DB

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
let loadData = require('./routes/loaddata');
let listOrder = require('./routes/listorder');
let listProd = require('./routes/listprod');
let addCart = require('./routes/addcart');
let showCart = require('./routes/showcart');
let checkout = require('./routes/checkout');
let order = require('./routes/order');
let deleteItem = require('./routes/deleteitem');
let updateQuantity = require('./routes/updatequantity');
let displayImage = require('./routes/displayImage');
let index = require('./routes/index');
let ship = require('./routes/ship');
let validateLogin = require('./routes/validateLogin');
let admin = require('./routes/admin');
let product = require('./routes/product');
let login = require('./routes/login');
let customer = require('./routes/customer');
let logout = require('./routes/logout');
let register = require('./routes/register');
let validateRegister = require('./routes/validateRegister');
let customerEdit = require('./routes/customerEdit');
let adminActions = require('./routes/adminActions');
let review = require('./routes/review');
let notAuthorized = require('./routes/notAuthorized');

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
app.use('/ship', ship);
app.use('/validateLogin', validateLogin);
app.use('/admin', admin);
app.use('/product', product);
app.use('/login', login);
app.use('/customer', customer);
app.use('/logout', logout);
app.use('/register', register);
app.use('/validateRegister', validateRegister);
app.use('/customerEdit', customerEdit);
app.use('/adminActions', adminActions);
app.use('/review', review);
app.use('/notAuthorized', notAuthorized);

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
