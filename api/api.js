var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');

router.post('/search', (req, res, next) => {
  Product.search({
    query_string: { query: req.body.search_term}
  }, (err, results) => {
    if(err) {
      return next(err);
    }
    console.log(results);
    res.json(results);
  });
});

router.get('/:name', (req, res, next) => {
  async.waterfall([
    function(callback){
      Category.findOne({name: req.params.name}, (err, category) => {
        if(err){
          return next(err);
        }
        console.log(category);
        callback(null, category);

      });
    },
    function(category, callback){
        for(var i = 0; i < 30; i++){
          var product = new Product();
          product.category = category._id;
          product.name = faker.commerce.productName();
          product.price = faker.commerce.price();
          product.image = faker.image.image();
          product.save();
        }
    }
  ]);
  res.json({ message: 'Success'});
});

module.exports = router;
