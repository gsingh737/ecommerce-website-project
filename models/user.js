var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
// User schema attributes fields
var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
password: {
  type: String
},
profile: {
  name:
  {
    type: String,
    default: ''
  },
  picture:
  {
    type: String,
    default:''
  },
  address: String,
  history:
  [{
    date: Date,
    paid: {
      type: Number,
      default: 0
    }
  }]
}
});

//middleware called before user is saveed to db
UserSchema.pre('save', function(next) {
  var user = this;
  if(!user.isModified('password')){
    return next();
  }
  bcrypt.genSalt(10, (err, salt) => {
    if(err) {
      return next(err);
    }
    bcrypt.hash(user.password, salt, (err, hash) => {
      if(err){
        next(err);
      }
      user.password = hash;
      next();
    });


  });
});


//compare password in the db and user typed password
UserSchema.methods.comparePassword = function(password){
  return bcrypt.compare(password, this.password);
}
var User = mongoose.model('User', UserSchema);

module.exports = {User};
