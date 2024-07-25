const errorHandler = (error, req, res) => {
  console.log('error', error);
  if (error) {
    res.status(error.statusCode || 500).json({ message: error.message, error });
  }
};

export default errorHandler;
