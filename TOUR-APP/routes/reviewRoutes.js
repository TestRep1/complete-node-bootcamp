const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

const router = express.Router({ mergeParams: true }); //VERY IMPORTANT TO MERGE PARAMS SINCE WE REDIRECT FROM TOUR ROUTER

router
  .route('/')
  .patch(reviewController.updateReview)
  .get(reviewController.getAllReviews)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .delete(reviewController.deleteReview)
  .get(reviewController.getReview)
  .patch(reviewController.updateReview);

module.exports = router;
