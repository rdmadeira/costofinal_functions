import jwt from 'jsonwebtoken';

export const authVerify = (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new Error('Not Authorized'));
  }

  const decode = jwt.verify(token, process.env.JWT_KEY);
};
