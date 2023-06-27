import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';

dotenv.config();

export const authAdminHandler = async (req, res, next) => {
  const { uid, email } = req.body;

  if (uid !== process.env.AUTH_UID) return next(new Error('Not authorized'));

  let token = jwt.sign({ uid }, process.env.JWT_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });

  res.status(200).json({
    message: 'Successfully logged in',
    data: {
      uid,
      email,
      token,
    },
  });
};
