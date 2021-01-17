const { promisify } = require('util');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/appError');

const signToken = id =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN
  });

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body); //should filter out all other fields for security

  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  const correct =
    user && (await user.isPasswordCorrect(password, user.password));
  if (!correct) {
    return next(new AppError('Incorrect Email or Password...'));
  }

  //SIGN TOKEN
  const token = signToken(user._id);

  res.status(201).json({
    status: 'success',
    token
  });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    next(new AppError('You need to login first to continue.'), 401);
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id);
  if (!user) {
    return next('No user belong to this token!', 401);
  }

  if (user.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        'Password was changed  after login... please login again.',
        401
      )
    );
  }

  //GRANT ACCESS TO PROTECTED ROUTE
  req.user = user;
  next();
});


exports.restrictTo = (...role) => {
  return (req, res, next) => {
    if(!role.includes(req.user.role)) {
      return next(new AppError('You don\'t have permission to access this service.', 403 ));
    }
    next();

  }
}