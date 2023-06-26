import {
  getProductsFromFirestore,
  updateAllProductsToFirestore,
} from '../firebase/utils.js';
import { updateAllPrices } from '../utils/utils.js';

export const getProductsHandler = async (req, res, next) => {
  const products = await getProductsFromFirestore();

  if (!products.isSuccess) {
    res.status(500).json({ message: products.message });
    return next(products.error);
  }

  res.json({ data: products, message: products.message });
};

export const putProductsHandler = async (req, res, next) => {
  const { products: productsJson } = req.body;

  const response = await updateAllProductsToFirestore(productsJson);

  if (!response.isSuccess) {
    res.status(500).json({ message: response.message });
    return next(response.error);
  }

  res.status(200).json({ message: response.message });
};

export const postUpdatePriceHandler = async (req, res, next) => {
  const { incrementFactor } = req.body;

  const products = await getProductsFromFirestore();

  if (!products.isSuccess) {
    res.status(500).json({ message: products.message });
    return next(products.error);
  }

  const updatedProducts = updateAllPrices(incrementFactor, products);

  res.status(200).json({
    message: 'Successful Updated Prices!',
    data: updatedProducts,
  });
};
