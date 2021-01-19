const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRoutes');

const router = express.Router();

// router.param('id', tourController.checkID);

//user MERGE ROUTES INSTEAD BELOW
// router
//   .route('/:tourId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

router.get('/nearby/:distance/center/:latlng/unit/:unit', tourController.nearbyTours);


router.use('/:tourId/reviews', reviewRouter);

router
  .route('/top-cheap')
  .get(tourController.aliasTopCheapTours, tourController.getAllTours);

router.route('/tours-stats').get(tourController.getTourStats);
router.route('/tours-plan/:year').get(tourController.getToursPlanOfYear);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );



module.exports = router;
