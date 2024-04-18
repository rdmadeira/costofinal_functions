import {
  getProductsFromFirestore,
  sendNewProductsToFirestore,
} from '../firebase/utils.js';
import {
  createAsyncJsonFromDB,
  updatePrices,
  productsExcelToJson,
} from '../utils/utils.js';

import path from 'path';

export const getProductsHandler = async (req, res, next) => {
  const products = await getProductsFromFirestore();

  if (!products.isSuccess) {
    return next(products.error);
  }

  res.json({
    data: products.data,
    message: products.message,
    isSuccess: products.isSuccess,
  });
};

// Actualiza los documentos que coincide el Key con el Id de la DB:
export const postCreateProductsHandler = async (req, res, next) => {
  try {
    const { originalname, mimetype, buffer } = req.files[0];
    const merge = req.body.merge;
    const mergeTipoProducto = req.body.mergeTipoProducto; // usar

    console.log('mergeTipoProducto', mergeTipoProducto); // true o undefined

    const collectionName = req.body.collectionName;

    const createAsyncJsonResponse = await createAsyncJsonFromDB('products'); // No collectionName por ahora, solo products
    if (!createAsyncJsonResponse.isSuccess) {
      console.log(
        'createAsyncJsonResponse.message',
        createAsyncJsonResponse.message
      );

      return next(createAsyncJsonResponse.error);
    }

    console.log('merge', merge, 'collectionName', collectionName);

    const excelFilePath = uploadFile(originalname, mimetype, buffer);

    // Hacer archivo Json a partir del excel:
    const createNewProductJsonResponse = productsExcelToJson(
      excelFilePath,
      createAsyncJsonResponse.data // db_products data para transformProductsFirebaseJsonToFlatArray
    );

    if (!createNewProductJsonResponse.isSuccess) {
      console.log(
        'createNewProductJsonResponse',
        createNewProductJsonResponse.message
      );
      return next(createNewProductJsonResponse.error);
    }

    console.log(
      'createNewProductJsonResponse.data[FERRETERIA]',
      createNewProductJsonResponse.data['FERRETERIA']
    );
    const sendNewProductsToFirestoreResponse = await sendNewProductsToFirestore(
      createNewProductJsonResponse.data,
      collectionName,
      merge,
      mergeTipoProducto
    );

    if (!sendNewProductsToFirestoreResponse.isSuccess) {
      console.log(
        'sendNewProductsToFirestoreResponse',
        sendNewProductsToFirestoreResponse.message
      );
      return next(sendNewProductsToFirestoreResponse.error);
    }

    res
      .status(200)
      .sendFile(
        path.resolve(process.cwd() + '/public/' + 'success-post-products.html')
      );
  } catch (error) {
    console.log('error', error);
    next(error);
  }

  /* await createNewProductsToFirestore(productsJson, test);
  await updateProductsToFirestore(productsJson, test);

  console.log('response', response);

  if (!response.isSuccess) {
    res.status(500).json({ isSuccess: false, message: response.message });
    return next(response.error);
  }

  res.status(200).json({ isSuccess: true, message: response.message }); */
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

    const fileXLSPath = uploadFile(originalname, mimetype, buffer);

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

export const getCreateProductsHandler = async (req, res, next) => {
  res
    .status(200)
    .sendFile(
      path.resolve(process.cwd() + '/public/' + 'create-products.html')
    );
};
