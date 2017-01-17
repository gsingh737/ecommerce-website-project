var router = require('express').Router();
var {User} = require('../models/user');


router.post('/signup', (req, res, next) => {
   var user = new User();
   console.log(req.body);
   user.profile.name = req.body.name;
   user.password = req.body.password;
   user.email = req.body.email;
   User.findOne({email: req.body.email}, (err, existingUser) => {
     if(existingUser){
       console.log(`${req.body.email} already exits`);
       return redirect('/signup');
     }
     user.save((err, user) => {
       if(err){
         return next(err);
       }
       res.json("New User Created");
     });
   });

});


module.exports = router;
