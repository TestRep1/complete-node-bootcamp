const express = require('express');
const tourController = require('../controllers/tourController');

const router = express.Router();

// router.param('id', tourController.checkID);

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
  .delete(tourController.deleteTour);

module.exports = router;
