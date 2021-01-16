const fs = require('fs');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Tour = require('./models/tourModel');
dotenv.config({ path: './config.env' });

const DATA_PATH = `${__dirname}/dev-data/data/tours-simple.json`;

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
  const tours = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  await Tour.create(tours);
  console.log('Data imported...');
  process.exit(0);
};

const deleteDataFromDB = async () => {
  await Tour.deleteMany();
  console.log('Data deleted...');
  process.exit(0);
};

if (process.argv[2] === '--import') {
  importDataToDB();
} else if (process.argv[2] === '--delete') {
  deleteDataFromDB();
}
