const { mongo, Mongoose } = require('mongoose');
const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Factory = require('./controllerFactory');


//{{URL}}tours/nearby/1000/center/34.128225,-118.204394/unit/mi
exports.nearbyTours = catchAsync(async (req, res, next) => {
  const {distance, latlng, unit} = req.params;
  const[lat, lng] = latlng.split(',');

  const radius = unit ==='mi'? distance/3963.2 : distance/6378.1;
  const tours = await Tour.find({
    startLocation: {
      $geoWithin: { $centerSphere: [[lng, lat], radius]}
    }
  })

  res.status(200).json({
    status: 'success',
    data: {
      tours
    }
  })
})
// const fs = require('fs');

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

// exports.checkID = (req, res, next, val) => {
//   console.log(`Tour id is: ${val}`);

//   if (req.params.id * 1 > tours.length) {
//     return res.status(404).json({
//       status: 'fail',
//       message: 'Invalid ID'
//     });
//   }
//   next();
// };

// exports.checkBody = (req, res, next) => {
//   if (!req.body.name || !req.body.price) {
//     return res.status(400).json({
//       status: 'fail',
//       message: 'Missing name or price'
//     });
//   }
//   next();
// };

exports.getToursPlanOfYear = catchAsync(async (req, res, next) => {
  const year = req.params.year;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates'
    },
    {
      $match: {
        startDates: { $gte: new Date(year, 0, 1) },
        startDates: { $lte: new Date(year, 11, 31) }
      }
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        totalTours: { $sum: 1 },
        tours: { $push: '$name' }
      }
    },
    {
      $addFields: { month: '$_id' }
    },
    {
      //remove fields
      $project: { _id: 0 }
    }
  ]);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      plan
    }
  });
});

exports.getTourStats = catchAsync(async (req, res, next) => {
  const stat = await Tour.aggregate([
    { $match: { ratingsAverage: { $gte: 4 } } },
    {
      $group: {
        _id: { $toUpper: '$difficulty' }, //'$difficulty', //null,
        totalPrice: { $sum: '$price' },
        totalTours: { $sum: 1 },
        avgRatings: { $avg: '$ratingsAverage' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { totalPrice: -1 } //{_id: -1}
    }
    // {
    //   //We can add another Match to filter the result
    //   $match: {_id: {$ne: 'EASY'}}
    // }
  ]);

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    data: {
      stat
    }
  });
});

exports.aliasTopCheapTours = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: '-ratingAverage,price',
    fields: 'name,price,ratingAverage,summary,difficulty'
  };
  next();
};

exports.getAllTours = catchAsync(async (req, res, next) => {
  console.log('req.query ', req.query);
  const filteredQuery = ['sort', 'limit', 'skip', 'fields', 'page'];
  let reqQuery = { ...req.query };
  filteredQuery.forEach(q => delete reqQuery[q]);

  console.log('reqQuery ', reqQuery);
  //FILTERING
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(sort|limit)\b/g, '');
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

  let query = Tour.find(JSON.parse(queryStr)); //without await (chain query)

  //SORTING
  if (req.query.sort) {
    const sortFields = req.query.sort.split(',').join(' ');
    query = query.sort(sortFields);
  } else {
    //if user didn't spicify the sort
    query = query.sort('-createdAt');
  }

  //EXCLUDE/INCLUDE FIELDS
  if (req.query.fields) {
    const fields = req.query.fields.split(',').join(' ');
    query = query.select(fields);
  } else {
    query = query.select('-__v'); //by default remove mongodb __v field
  }

  //PAGINATION
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 10;
  const skip = (page - 1) * limit;
  query = query.skip(skip).limit(limit);

  //Check bounduries
  if (req.query.page) {
    const count = await Tour.countDocuments();
    if (skip > count) {
      throw new Error('Limit exceeded!!');
    }
  }

  const tours = await query;

  res.status(200).json({
    status: 'success',
    requestedAt: req.requestTime,
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getTour = Factory.getOne(Tour, {path: 'reviews'});

exports.createTour = Factory.createOne(Tour);

exports.updateTour = Factory.updateOne(Tour);

exports.deleteTour = Factory.deleteOne(Tour);