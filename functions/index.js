import express from 'express';

import dotenv from 'dotenv';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import {
  mailingRouter /* ,
  authRouter, */,
  productsRouter,
} from './src/routes/index.js';
/* import { setHeaderAllowOrigin } from './src/middlewares/setHeader.js';
import errorHandler from './src/errors/errorsHandler.js'; */

import bodyParser from 'body-parser';

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

/* Crear ruta de acceso de DB - productos */
const getProductsApi = express();

getProductsApi.use(express.static('public'));

getProductsApi.use(express.json());
getProductsApi.use(bodyParser.urlencoded({ extended: true }));
getProductsApi.use((req, res, next) => {
  /* res.setHeader('Access-Control-Allow-Origin', '*'); */ // Desabilitar CORS para prueba
  /* res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  ); */
  next();
});

getProductsApi.use('/api/products', productsRouter);

export const products = functions.https.onRequest(getProductsApi);

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
