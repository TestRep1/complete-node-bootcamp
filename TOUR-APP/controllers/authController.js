const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

exports.signup = catchAsync(async (req, res, next) => {
    const user = await User.create(req.body); //should filter out all other fields for security

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRED_IN});
    res.status(201).json({
        status: 'success',
        token,
        data: {
            user
        }
    })
});