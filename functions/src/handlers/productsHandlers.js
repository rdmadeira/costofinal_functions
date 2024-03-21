import {
  getProductsFromFirestore,
  updateProductsToFirestore,
  createNewProductsToFirestore,
} from '../firebase/utils.js';

import { updateAllPrices } from '../utils/utils.js';

import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const storage = getStorage();

export const getProductsHandler = async (req, res, next) => {
  const products = await getProductsFromFirestore();
  console.log('productsHandler', products);

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

export const getUpdatePriceHandler = async (req, res, next) => {
  res.sendFile(path.resolve('src/pages/index.html'));
};

// Todavia falta:
export const postUpdatePriceHandler = async (req, res, next) => {
  console.log('req', req.file);

  try {
    const dataTime = '19/03/2024 22:30:25';
    const storageRef = ref(
      storage,
      `uploads/${req.file.originalname} - ${dataTime}`
    );
    const metadata = {
      contentType: req.file.mimetype,
    };

    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    const message = 'File succesfully uploaded.';
    console.log(message);

    return res.json({
      message,
      name: req.file.originalname,
      type: req.file.mimetype,
      downloadURL: downloadURL,
    });
  } catch (error) {
    console.log('error', error);
    next(error);
  }

  /* const updatedProducts = updateAllPrices(products.data); */

  /* res.status(200).json({
    message: 'Successful Updated Prices!',
    data: updatedProducts,
  }); */
};
