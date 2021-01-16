const express = require('express');
const morgan = require('morgan');


const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const errorController = require('./controllers/errorController');

const app = express();

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use(express.static(`${__dirname}/public`));

app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 3) ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//DEFAULT ROUTE:
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the server!`);
  err.statusCode = 404;
  err.status = 'fail';
  next(err);
  
})

//GLOBAL ERROR HANDLING
app.use(errorController);

module.exports = app;
