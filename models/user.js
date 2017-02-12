var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;
var crypto  = require('crypto');

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

facebook: String,
tokens: [],
address: String,
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
  history:
  [{
    paid: {
      type: Number,
      default: 0
    },
    item: {type: Schema.Types.ObjectId, ref: 'Product'}
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
UserSchema.methods.gravatar = function(size) {
  if(!this.size) size = 200;
  if(!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=reto';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

var User = mongoose.model('User', UserSchema);

module.exports = {User};
