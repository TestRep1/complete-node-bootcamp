module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'fail';

  if (process.env.NODE_ENV === 'development') {
    sendErrorToDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorToProd(err, res);
  }
};

const sendErrorToDev = (err, res) => {
  res.status(err.statusCode).json({
    errorName: err.name,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

const sendErrorToProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong'
    });
  }
};
