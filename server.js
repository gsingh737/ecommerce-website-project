var express = require('express');
var morgan = require('morgan');
var mongoose = require('mongoose');
var {User} = require('./models/user');
var bodyParser = require('body-parser');
var ejs = require('ejs');
var engine = require('ejs-mate');
var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');

const path = require('path');
const publicPath = path.join(__dirname, '/public');
console.log(publicPath);
mongoose.connect('mongodb://root:root@ds111549.mlab.com:11549/ecommerce', (err)=>{
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
app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.use(mainRoutes);
app.use(userRoutes);



app.listen(8000, (err)  =>  {
  if(err) throw err;
  console.log('Server is Running');
});
