const catchAsync = require('../utils/catchAsync');
const Review = require('../models/reviewModel');
const Factory = require('./controllerFactory');

exports.deleteReview = Factory.deleteOne(Review);
exports.updateReview = Factory.updateOne(Review);
exports.getReview = Factory.getOne(Review);

exports.getAllReviews = catchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) filter = { tour: req.params.tourId };

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'success',
    data: {
      reviews
    }
  });
});

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    if (!req.body.user) req.body.user = req.user.id;
    next();
}

exports.createReview = Factory.createOne(Review);
