const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  active: {
    type: Boolean,
    default: true,
    select: false
  },
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
      message: "Password doesn't match"
    }
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'lead-guide', 'admin'],
    default: 'user'
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.confirmPassword = undefined;
  next();
});

//CHECK PASSWORD
userSchema.methods.isPasswordCorrect = async function(password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

//VHECK IF PASSWORD WAS CHANGED AFTER LOGIN
userSchema.methods.changedPasswordAfter = function(jwtTimestamp) {
  if (this.passwordChangedAt) {
    return jwtTimestamp < parseInt(this.passwordChangedAt.getTime() / 1000, 10);
  }
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  //Encrypt reset token with SHA256
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; //10 minutes in miliseconds

  console.log({ resetToken }, this.passwordResetToken);

  //send the token by email later
  return resetToken;
};

//POPULATE passwordChangedAt FIELD
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; //substract 1 second
  next();
});

userSchema.pre(/^find/, function(next) {
  this.find({ active: { $ne: false } });
  next();
});

module.exports = mongoose.model('User', userSchema);
