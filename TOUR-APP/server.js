const dotenv = require('dotenv');
const app = require('./app');
const mongoose = require('mongoose');
dotenv.config({ path: './config.env' });

mongoose
  .connect(process.env.DB_URL.replace('<PASSWORD>', process.env.DB_PASS), {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(() => {
    console.log('Connected to Database...');
  });

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION ... ⚠️🔥🔥🔥 Shutting down the server...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', err => {
  console.log('UNCAUGHT EXCEPTION ... ⚠️🔥🔥🔥 Shutting down the server...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});
