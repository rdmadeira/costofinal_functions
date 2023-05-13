import { createFileandSend } from '../nodemailer/utils.js';
import fs from 'fs';

import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const mailingPostHandler = (req, res) => {
  const data = req.body;
  fs.readdir(__dirname, (err, files) => {
    if (err) {
      console.error(err);
      res.sendStatus(500);
    } else {
      console.log('Files', files);
      res.sendStatus(200);
    }
  });
  res.set('Access-Control-Allow-Origin', '*');
  if (data.email) {
    console.info('POST /mailing success');
    res.status(200).json({ message: 'Email enviado con suceso!' });
    createFileandSend(data);
  } else {
    res.status(500).json({ message: 'no user email find' });
    console.warn('POST /mailing no user email find');
  }
};
