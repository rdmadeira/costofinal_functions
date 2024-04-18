const errorHandler = (error, req, res, next) => {
  console.log('error', error);

  res.status(error.statusCode || 500).json({ message: error.message, error });
};

export default errorHandler;
