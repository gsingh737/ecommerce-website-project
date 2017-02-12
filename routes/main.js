var router = require('express').Router();
var Product = require('../models/product');
var Cart = require('../models/cart');
var {User} = require('../models/user');
var async = require('async');

var stripe = require('stripe')('sk_test_tMWplPeyWVF4e9fD3I2Yy56X');

function paginate(req, res, next){
  var perPage = 9;
  var page = req.params.page || 1;
  Product
    .find()
    .skip(perPage * (page -1))
    .limit(perPage)
    .populate('category')
    .exec((err, products) => {
      Product.count().exec((err, count) => {
        if(err){
          return next(err);
        }
        res.render('main/product-main', { products, pages: count/ perPage});
      });
    });
}

Product.createMapping((err, mapping) => {
    if(err){
      console.log('error creating mapping');
    } else {
      console.log('Mapping created');
      console.log(mapping);
    }
});


var stream = Product.synchronize();
var count = 0;

stream.on('data', () => {
  count++;
});

stream.on('close', () => {
 console.log(`Indexed ${count} documents`)
});

stream.on('error', (error) => {
  console.log(error);
});


router.get('/cart', (req, res, next) => {
  Cart
  .findOne({owner: req.user._id})
  .populate('items.item')
  .exec((err, foundCart) => {
    if(err) {
      return next(err);
    }
    res.render('main/cart', {
       foundCart,
       message: req.flash('remove')
    });
  });
});

router.post('/product/:product_id', (req, res, next) => {
  Cart.findOne({owner: req.user._id}, (err, cart) => {
    cart.items.push({
      item: req.body.product_id,
      price: parseFloat(req.body.priceValue),
      quantity: parseInt(req.body.quantity)
    });
    console.log(cart);
    console.log(cart.total);
    console.log(parseFloat(req.body.priceValue).toFixed(2));
    cart.total = cart.total + parseFloat(req.body.priceValue).toFixed(2);
    cart.save((err) => {
      if(err) {
        return next(err);
      }
      return res.redirect('/cart');
    });
  });
});
router.post('/remove', (req, res, next) => {
  Cart.findOne({ owner: req.user._id }, function(err, foundCart) {
    foundCart.items.pull(String(req.body.item));

    foundCart.total = (foundCart.total - parseFloat(req.body.price)).toFixed(2);
    foundCart.save(function(err, found) {
      if (err) return next(err);
      req.flash('remove', 'Successfully removed');
      res.redirect('/cart');
    });
  });
});


router.post('/search', (req, res, next) =>{
  console.log('Post query: ' + req.body.q);
  res.redirect('/search?q=' + req.body.q);
});

router.get('/search', (req, res, next) => {
  if(req.query.q){
      Product.search({
        query_string: {query: req.query.q}
      }, (err, results) => {
          if(err){
            return next(err);
          }
          var data = results.hits.hits.map((hit) => {
            return hit;
          });
          res.render('main/search-result', {
            query: req.query.q,
            data
          });
      });
  }
});
router.get('/', (req, res, next) => {
  if(req.user){
    paginate(req, res, next);
  } else {
      res.render('main/home');
  }
});
router.get('/about', (req, res, next) => {
 res.render('main/about');
});

router.get('/page/:page', (req, res, next) => {
  paginate(req, res, next);
});


router.get('/products/:id', (req, res, next) => {
  Product
    .find({category: req.params.id})
    .populate('category')
    .exec().then((products) => {
      res.render('main/category', {products});
    })
    .catch((error) => {
      next(error);
    });
});

router.get('/product/:id', (req, res, next) => {
    Product.findById({_id: req.params.id}, (err, product) => {
        if(err){
          return next(err);
        }
        res.render('main/product', {product});
    });
});


router.post('/payment' , (req, res, next) => {
  console.log(req.body.stripeToken);
  var stripeToken = req.body.stripeToken;
  var currentCharges = Math.round(req.body.stripeMoney*100);
  stripe.customers.create({
    source: stripeToken
  }).then((customer) => {
    return stripe.charges.create({
      amount: currentCharges,
      currency: 'usd',
      customer: customer.id
    });
  }).then((charge) => {
    async.waterfall([
      function(callback){
          Cart.findOne({owner: req.user._id}, (err, cart) => {
            callback(err, cart);
          });
      },
      function(cart, callback){
        User.findOne({_id: req.user._id}, (err, user) => {
          if(user){
            for(var i=0; i < cart.items.length; i++){
                user.profile.history.push({
                  item: cart.items[i].item,
                  paid: cart.items[i].price
                });
            }

            user.save((err) => {
              if(err) {
                return next(err);
              }
              callback(err, user);
            });
          }
        });
      },
      function(user){
          Cart.update({owner: user._id}, { $set: { items: [], total: 0}}, (err, updated) => {
            if(err){
              return next(err);
            }
            if(updated){
              res.redirect('/profile');
            }
          });
      }
    ])
  })

});
module.exports = router;
