import express from 'express';

import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import {
  mailingRouter /* ,
  productsRouter,
  authRouter, */,
} from './src/routes/index.js';
/* import { setHeaderAllowOrigin } from './src/middlewares/setHeader.js';
import errorHandler from './src/errors/errorsHandler.js'; */

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
/* const updateProducts = express();
updateProducts.use(express.json());
updateProducts.use(setHeaderAllowOrigin);
updateProducts.use('/api/products', productsRouter);
updateProducts.use('/api/auth', authRouter);
updateProducts.use(errorHandler);

<<<<<<< HEAD
export const products = functions.https.onRequest(updateProducts);
 */

/* export const products = functions
  .runWith({ secrets: ['USER_UID', 'DATABASE_API_KEY'] })
  .https.onRequest(updateProducts); */
