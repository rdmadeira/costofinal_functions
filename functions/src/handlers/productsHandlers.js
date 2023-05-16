import { getProductsFromFirestore } from '../firebase/utils.js';
export const getProductsHandler = async (req, res) => {
  const products = await getProductsFromFirestore();
  console.log(products);
  res.json({ data: products });
};
