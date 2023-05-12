import { createFileandSend } from '../nodemailer/utils.js';

export const mailingGetHandler = (req, res) => {
  const data = req.body;

  createFileandSend(data);
  res.status(200).json({ message: 'Email enviado con suceso!' });
};
