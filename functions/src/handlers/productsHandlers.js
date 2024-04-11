import {
  getProductsFromFirestore,
  updateProductsToFirestore,
  createNewProductsToFirestore,
} from '../firebase/utils.js';
import { createAsyncJsonFromDB, updatePrices } from '../utils/utils.js';

import path from 'path';

import admin from 'firebase-admin';

export const getProductsHandler = async (req, res, next) => {
  const products = await getProductsFromFirestore();
  console.log('req.body', req.body);

  if (!products.isSuccess) {
    res.status(500).json({ message: products.message });
    return next(products.error);
  }

  res.json({
    data: products.data,
    message: products.message,
    isSuccess: products.isSuccess,
  });
};

// Actualiza los documentos que coincide el Key con el Id de la DB:
export const putProductsHandler = async (req, res, next) => {
  const { products: productsJson } = req.body;
  const { isNew, test } = req.query;

  const response = isNew
    ? await createNewProductsToFirestore(productsJson, test)
    : await updateProductsToFirestore(productsJson, test);

  console.log('response', response);

  if (!response.isSuccess) {
    res.status(500).json({ isSuccess: false, message: response.message });
    return next(response.error);
  }

  res.status(200).json({ isSuccess: true, message: response.message });
};

export const getUpdatePriceHandler = async (req, res) => {
  console.log('req.body', req.body);

  res.status(200).sendFile(path.resolve('src/' + 'pages/' + 'index.html'));
};

// Todavia falta:

import { uploadFile } from '../utils/utils.js';

export const postUpdatePriceHandler = async (req, res, next) => {
  try {
    const { originalname, mimetype, buffer } = req.files[0];

    await uploadFile(originalname, mimetype, buffer);

    await createAsyncJsonFromDB('products');

    updatePrices(filePath);

    res.send('Ok');
  } catch (error) {
    console.log('error', error);
    next(error);
  }
};
