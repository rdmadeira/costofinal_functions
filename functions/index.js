import express from 'express';

import dotenv from 'dotenv';
import cors from 'cors';
import * as functions from 'firebase-functions';
import admin from 'firebase-admin';

import fileParser from 'express-multipart-file-parser';

import {
  mailingRouter,
  imagesRouter,
  productsRouter,
} from './src/routes/index.js';
/* import { setHeaderAllowOrigin } from './src/middlewares/setHeader.js';*/
import errorHandler from './src/errors/errorsHandler.js';

import bodyParser from 'body-parser';

admin.initializeApp(functions.config().firebase);

// refresh token access - error de Gaxios Error
/* import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  process.env.CLIENT_ID_GOOGLEAPIS,
  process.env.CLIENT_SECRET_KEY_GOOGLEAPIS,
  'https://developers.google.com/oauthplayground'
);
oauth2Client.setCredentials({
  refresh_token:
    '1//04CZ-RIvKzNwOCgYIARAAGAQSNwF-L9Irv1_ntUJEGRdfhHHC5vDTN9yBiHrh63Fgbnzm_D428xTSlFTOgADw_aVOGqLtbKwyVb4',
}); 
const accessToken = oauth2Client.getAccessToken();
console.log('accessToken', accessToken);*/

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
getProductsApi.use(fileParser);
getProductsApi.use(express.json());
getProductsApi.use(bodyParser.urlencoded({ extended: true }));

getProductsApi.use(
  cors({
    origin: ['http://localhost:3000', 'https://www.costofinal.com.ar'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

getProductsApi.use('/api/products', productsRouter);
getProductsApi.use(errorHandler);

export const products = functions.https.onRequest(getProductsApi);

const getImages = express();

getImages.use(express.static('public'));
getImages.use(
  cors({
    origin: ['http://localhost:3000', 'https://www.costofinal.com.ar'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
getImages.use('/api/images', imagesRouter);
getImages.use(errorHandler);

export const images = functions.https.onRequest(getImages);
