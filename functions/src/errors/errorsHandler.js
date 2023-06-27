const errorHandler = (error, req, res) => {
  res.status(error.statusCode || 400).json({ message: error.message });
};

export default errorHandler;
