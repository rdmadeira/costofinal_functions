import {
  getProductsFromFirestore,
  sendNewProductsToFirestore,
  signIn,
  signOutAuth,
} from '../firebase/utils.js';
import {
  createAsyncJsonFromDB,
  updatePrices,
  productsExcelToJson,
  createExcelFileFromJson,
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

export const getXlsProductsHandler = async (req, res, next) => {
  const token = req.headers?.authorization?.split(' ')[1] || null;
  try {
    const productsResponse = await getProductsFromFirestore();

    if (!productsResponse.isSuccess) {
      console.log('error', productsResponse.error);

      return next(productsResponse.error);
    }
    if (token === process.env.AUTH_UID) {
      const { filePath } = createExcelFileFromJson(productsResponse.data);
      res.status(200).download(filePath); // Filename no se hace por download, tendria que crear un elemento a con href y hacerle click
    } else {
      res
        .status(401)
        .sendFile(path.resolve(process.cwd() + '/public/' + '401.html'));
    }
  } catch (error) {
    console.log('error', error);
    return next(error);
  }
};

// Actualiza los documentos que coincide el Key con el Id de la DB:
export const postCreateProductsHandler = async (req, res, next) => {
  try {
    await signIn(process.env.AUTH_EMAIL, process.env.AUTH_PASS);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  }
  try {
    const { originalname, mimetype, buffer } = req.files[0];
    const merge = req.body.merge;
    const mergeTipoProducto = req.body.mergeTipoProducto; // usar

    const collectionName = req.body.collectionName;

    const createAsyncJsonResponse = await createAsyncJsonFromDB('products'); // No collectionName por ahora, solo products
    if (!createAsyncJsonResponse.isSuccess) {
      console.log(
        'createAsyncJsonResponse.message',
        createAsyncJsonResponse.message
      );

      return next(createAsyncJsonResponse.error);
    }

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
};

export const getUpdatePriceHandler = async (req, res) => {
  const token = req.headers?.authorization?.split(' ')[1] || null;

  if (token === process.env.AUTH_UID)
    res
      .status(200)
      .sendFile(
        path.resolve(process.cwd() + '/public/' + 'update-prices.html')
      );
  else {
    res
      .status(401)
      .sendFile(path.resolve(process.cwd() + '/public/' + '401.html'));
  }
};

import { uploadFile, sendUpdatedProductsToDB } from '../utils/utils.js';

export const postUpdatePriceHandler = async (req, res, next) => {
  try {
    await signIn(process.env.AUTH_EMAIL, process.env.AUTH_PASS);
  } catch (error) {
    const errorCode = error.code;
    const errorMessage = error.message;
    console.log(errorCode, errorMessage);
  }
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

    signOutAuth();
    await res
      .status(200)
      .sendFile(path.resolve('public/' + 'success-update-prices.html'));
  } catch (error) {
    console.log('error', error);
    next(error);
  }
};

export const getCreateProductsHandler = async (req, res) => {
  const token = req.headers?.authorization?.split(' ')[1] || null;

  if (token === process.env.AUTH_UID)
    res
      .status(200)
      .sendFile(
        path.resolve(process.cwd() + '/public/' + 'create-products.html')
      );
  else {
    res
      .status(401)
      .sendFile(path.resolve(process.cwd() + '/public/' + '401.html'));
  }
};
