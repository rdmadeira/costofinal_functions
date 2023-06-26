import express from 'express';

import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import { mailingRouter, productsRouter } from './src/routes/index.js';

admin.initializeApp(functions.config().firebase);

dotenv.config({ path: process.cwd() });

const appMail = express();

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

export const app = functions
  .runWith({ secrets: ['MAIL', 'MAIL_KEY'] })
  .https.onRequest(appMail);

/* ***************************************************** */
const updateProducts = express();
updateProducts.use(express.json());
updateProducts.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  );
  next();
});
updateProducts.use('/api/products', productsRouter);

export const products = functions.https.onRequest(updateProducts);
