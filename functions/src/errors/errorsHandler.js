const errorHandler = (error, req, res) => {
  res.status(error.statusCode || 500).json({ message: error.message, error });
};

export default errorHandler;
