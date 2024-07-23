const errorHandler = (error, req, res, next) => {
  console.log('error', error);
  if (error) {
    res.status(error.statusCode || 500).json({ message: error.message, error });
  }
  next();
};

export default errorHandler;
