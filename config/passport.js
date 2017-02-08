var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var {User} = require('../models/user');

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

//custom functions to validate
exports.isAuthenticated = function(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/login');
}
