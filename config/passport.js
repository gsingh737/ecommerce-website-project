var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('./secret');
var {User} = require('../models/user');
var async = require('async');
var Cart = require('../models/cart');


//serialize and deserialize
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
//Middleware
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, (req, email, password, done) => {
  console.log(email + " " + password);
  User.findOne({email}, (err, user) => {
    if(err){
      return done(err);
    }
    if(!user){
      return done(null, false, req.flash('loginMessage', 'No user has been found'));
    }

    if(!user.comparePassword(password)){
      return done(null, false, req.flash('loginMessage', 'Wrong password!'));
    }

    return done(null, user);
  });
}));

passport.use(new FacebookStrategy(secret.facebook, (token, refreshToken, profile, done) => {
  User.findOne({facebook: profile.id}, (err, user) => {
    if(err){
      return next(err);
    }
    if(user){
      return done(null, user);
    } else {
      debugger;
      console.log('New User');
      async.waterfall([
        function(callback){
          var newUser = new User();
          newUser.email = profile._json.email;
          newUser.facebook = profile.id;
          newUser.tokens.push({kind: 'facebook', token: token});
          newUser.profile.name = profile.displayName;
          newUser.profile.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';

          newUser.save((err) => {
            if(err){
              console.log(err);
              return done(err);
            }

            callback(null, newUser);
          });
        },
        function(newUser){
          console.log(newUser);
            var cart = new Cart();
            cart.owner = newUser._id;
            cart.save((err) => {
              if(err){
                return done(err);
              }
              return done(err, newUser);
            });
        }
      ]);
    }
  });
}));

//custom functions to validate
exports.isAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}
