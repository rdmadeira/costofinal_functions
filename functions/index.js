import express from 'express';

import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import { mailingRouter, productsRouter } from './src/routes/index.js';

admin.initializeApp(functions.config().firebase);

dotenv.config({ path: process.cwd() });

const appMail = express();
const getProducts = express();

/* ***************************************************** */
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
/* ***************************************************** */
getProducts.use(express.json());
getProducts.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
getProducts.use('/api/products', productsRouter);

/* products.listen(3300, () => console.log('Server running on port 3300')); */
export const app = functions
  .runWith({ secrets: ['MAIL', 'MAIL_KEY'] })
  .https.onRequest(appMail);

export const products = functions
  .runWith({ secrets: ['MAIL', 'MAIL_KEY'] })
  .https.onRequest(getProducts);
