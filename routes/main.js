var router = require('express').Router();
var Product = require('../models/product');

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

module.exports = router;
