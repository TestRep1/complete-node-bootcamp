const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

const Tour = require('./models/tourModel');
const User = require('./models/userModel');
const Review = require('./models/reviewModel');

const TOURS_PATH = `${__dirname}/dev-data/data/tours.json`;
const USERS_PATH = `${__dirname}/dev-data/data/users.json`;
const REVIEWS_PATH = `${__dirname}/dev-data/data/reviews.json`;

mongoose
  .connect(process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASS), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Connected to Database...');
  });

const importDataToDB = async () => {
  const tours = JSON.parse(fs.readFileSync(TOURS_PATH, 'utf-8'));
  const users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  const reviews = JSON.parse(fs.readFileSync(REVIEWS_PATH, 'utf-8'));

  await Tour.create(tours);
  await User.create(users, {validateBeforeSave: false}); //pasword always test1234
  await Review.create(reviews);

  console.log('Data imported...');
  process.exit(0);
};

const deleteDataFromDB = async () => {
  await Tour.deleteMany();
  await User.deleteMany();
  await Review.deleteMany();

  console.log('Data deleted...');
  process.exit(0);
};

if (process.argv[2] === '--import') {
  importDataToDB();
} else if (process.argv[2] === '--delete') {
  deleteDataFromDB();
}
