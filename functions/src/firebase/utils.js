import { initializeApp } from 'firebase/app';
import { getDocs, collection, getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getProductsFromFirestore = async () => {
  const productsArray = await getDocs(collection(db, 'products'));
  const products = {};
  productsArray.forEach((doc) => (products[doc.id] = doc.data()));
  console.log(products);
  return products;
};
