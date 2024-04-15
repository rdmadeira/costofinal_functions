import {
  getProductsFromFirestore,
  updateProductsToFirestore,
  createNewProductsToFirestore,
} from '../firebase/utils.js';
import { createAsyncJsonFromDB, updatePrices } from '../utils/utils.js';

import path from 'path';

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
export const putCreateProductsHandler = async (req, res, next) => {
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
  console.log('process.chdir()', process.cwd());

  res
    .status(200)
    .sendFile(path.resolve(process.cwd() + '/public/' + 'update-prices.html'));
};

// Todavia falta:

import { uploadFile, sendUpdatedProductsToDB } from '../utils/utils.js';

export const postUpdatePriceHandler = async (req, res, next) => {
  try {
    const { originalname, mimetype, buffer } = req.files[0];
    const collectionName = req.body.collectionName;

    const fileXLSPath = await uploadFile(originalname, mimetype, buffer);

    const createAsyncJsonResponse = await createAsyncJsonFromDB('products');
    if (!createAsyncJsonResponse.isSuccess) {
      console.log(
        'createAsyncJsonResponse.message',
        createAsyncJsonResponse.message
      );

      return next(createAsyncJsonResponse.error);
    }

    const updatePricesResponse = updatePrices(fileXLSPath);

    if (!updatePricesResponse.isSuccess) {
      console.log('updatePricesResponse.message', updatePricesResponse.message);

      return next(updatePricesResponse.error);
    }

    const sendUpdatedProductsToDBResponse = await sendUpdatedProductsToDB(
      collectionName
    );

    if (!sendUpdatedProductsToDBResponse.isSuccess) {
      console.log(
        'sendUpdatedProductsToDBResponse.message',
        sendUpdatedProductsToDBResponse.message
      );

      return next(sendUpdatedProductsToDBResponse.error);
    }

    await res
      .status(200)
      .sendFile(path.resolve('public/' + 'success-update-prices.html'));
  } catch (error) {
    console.log('error', error);
    next(error);
  }
};

export const getCreateProductsHandler = async () => {
  res
    .status(200)
    .sendFile(
      path.resolve(process.cwd() + '/public/' + 'create-products.html')
    );
};
