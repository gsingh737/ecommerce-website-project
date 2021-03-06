var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var {User} = require('./models/user');
var Category = require('./models/category');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');
var session = require('express-session');
var cookierParser = require('cookie-parser');
var flash = require('express-flash');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');
var secret = require('./config/secret');

var cartLength =require('./middleware/middleware');

const path = require('path');
const publicPath = path.join(__dirname, '/public');

mongoose.connect(secret.database, (err)=>{
    if(err){
      console.log(err);
    }
    else {
      console.log('Connected to db');
    }
});

var app = express();
//Middleware
app.use(express.static(publicPath));
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookierParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({url: secret.database, autoReconnect: true})
}));
app.use(flash());

app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next)  => {
  res.locals.user = req.user;
  next();
});

app.use(cartLength);

app.use((req, res, next) => {
  Category.find({}, (err, categories) => {
    if(err){
      next(err);
    }
    res.locals.categories = categories;
    next();
  });
});

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api', apiRoutes);

app.listen(secret.port, (err)  =>  {
  if(err) throw err;
  console.log('Server is Running');
});
