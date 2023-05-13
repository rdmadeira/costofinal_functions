import { createFileandSend } from '../nodemailer/utils.js';

export const mailingPostHandler = (req, res) => {
  const data = req.body;

  res.set('Access-Control-Allow-Origin', '*');
  if (data.email) {
    console.info('POST /mailing success');
    createFileandSend(data)
      .then(() => {
        res.status(200).json({ message: 'Email enviado con suceso!' });
      })
      .catch((err) => {
        res.status(500).json({ message: err });
      });
  } else {
    res.status(400).json({ message: 'no user email find' });
    console.warn('POST /mailing no user email find');
  }
};
