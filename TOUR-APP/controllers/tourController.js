const Tour = require('../models/tourModel');

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

exports.aliasTopCheapTours = (req, res, next) => {
  req.query = {
    ...req.query,
    limit: 5,
    sort: '-ratingAverage,price',
    fields: 'name,price,ratingAverage,summary,difficulty'
  };
  next();
};

exports.getAllTours = async (req, res) => {
  console.log('req.query ', req.query);
  const filteredQuery = ['sort', 'limit', 'skip', 'fields', 'page'];
  let reqQuery = { ...req.query };
  filteredQuery.forEach(q => delete reqQuery[q]);

  console.log('reqQuery ', reqQuery);
  //FILTERING
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(sort|limit)\b/g, '');
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

  try {
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
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        tour: updatedTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
