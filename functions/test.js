import express from 'express';

import dotenv from 'dotenv';

import bodyParser from 'body-parser';

import multer from 'multer';

import path from 'path';

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/uploads');
  },
});

const upload = multer({ storage: fileStorage });

dotenv.config({ path: process.cwd() });

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res, next) => {
  res.sendFile(path.resolve('src/pages/index.html'));
});

app.post('/update-price', upload.single('fileUpload'), (req, res, next) => {
  console.log('req.file', req.file);
});

app.listen(3000, () => console.log('Server listening...'));
