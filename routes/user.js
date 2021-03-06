var router = require('express').Router();
var {User} = require('../models/user');
var Cart = require('../models/cart');
var passport = require('passport');
var async = require('async');
var passportconf = require('../config/passport');

router.get('/login', (req, res) => {
  if(req.user) return res.redirect('/');
  res.render('accounts/login', {message: req.flash('loginMessage')});
});

router.post('/login', passport.authenticate('local-login', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true
}), (req, res) => {
    console.log(req.body.email);
    console.log(req.body.password);
});

router.get('/profile', passportconf.isAuthenticated, (req, res, next) => {
  User.findOne({_id: req.user._id})
  .populate('profile.history.item')
  .exec((err, user) => {
    if(err) {
      return next(err);
    }
    res.render('accounts/profile', {user});
  })
  // res.json('hello');
});

router.get('/signup', (req, res, next) => {
  res.render('accounts/signup', {
    errors: req.flash('errors')
  });
});

router.post('/signup', (req, res, next) => {
  async.waterfall([
    function(callback){
      var user = new User();
      console.log(req.body);
      user.profile.name = req.body.name;
      user.password = req.body.password;
      user.email = req.body.email;
      user.profile.picture = user.gravatar();
      User.findOne({email: req.body.email}, (err, existingUser) => {
        if(existingUser){
          req.flash('errors', `Account with email ${req.body.email} already exits`)
          return res.redirect('/signup');
        }
        user.save((err, user) => {
          if(err){
            return next(err);
          }
          callback(null, user);
        });
      });
    },

    function (user, callback){
        var cart = new Cart();
        cart.owner = user._id;
        cart.save((err) => {
          if(err){
            return next(err);
          }

          req.logIn(user, (err) => {
            if(err){
              next(err);
            }
            res.redirect('/profile');
          });

        });
    }
  ]);
});


router.get('/logout', (req, res, next) => {
    req.logout();
    res.redirect('/');
});

router.get('/edit-profile', function(req, res, next) {
  res.render('accounts/edit-profile.ejs', {message: req.flash('success')});
});

router.post('/edit-profile', function(req, res, next) {
    User.findOne({_id: req.user._id}, (err, user) => {
      if(err){
        return next(err);
      }
      if(req.body.name) {
        user.profile.name = req.body.name;
      }
      if(req.body.address) {
        user.address = req.body.address;
      }

      user.save((err) => {
        if(err) {
          return next(err);
        }
        req.flash('success', 'Successfull Edited your profile');
        return res.redirect('/edit-profile');
      });
    });
});

router.get('/auth/facebook', passport.authenticate('facebook', {scope: 'email'}));

router.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/profile',
  failureRedirect: '/login'
}));

module.exports = router;
