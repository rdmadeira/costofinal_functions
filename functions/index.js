import express from 'express';

import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import mailingRouter from './src/routes/mailing.js';

admin.initializeApp(functions.config().firebase);

dotenv.config({ path: process.cwd() });

console.log('index.js:13 - ', process.cwd());
console.log('index.js:14 - ', process.env.P);

const appMail = express();

appMail.use(express.json());
appMail.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
appMail.use('/api/mailing', mailingRouter);

export const app = functions.https.onRequest(appMail);
