const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required!']
  },
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, 'Email is required!'],
    validate: [validator.isEmail, 'Email is invalid!']
  },
  photo: String,

  password: {
      type: String,
      required: [true, 'Password is required!'],
      minlength: 8,
      select: false
  },
  confirmPassword: {
      type: String,
      required: [true, 'Confirm password is required!'],
      validate: {
          validator: function(el) {
              return el === this.password;
          },
          message: 'Password doesn\'t match'
      }
  },
  passwordChangedAt: Date,

  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },

  
});

userSchema.pre('save', async function(next) {
    if(!this.isModified('password')) return next();

    this.password = await bcrypt.hash(this.password, 12);
    this.confirmPassword = undefined;
    next();
})

//CHECK PASSWORD
userSchema.methods.isPasswordCorrect = async function(password, userPassword) {
  return await bcrypt.compare(password, userPassword);
}

//VHECK IF PASSWORD WAS CHANGED AFTER LOGIN
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if(this.passwordChangedAt) {
    return jwtTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
  return false;
}

module.exports = mongoose.model('User', userSchema);
