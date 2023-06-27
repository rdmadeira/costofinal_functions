import { initializeApp } from 'firebase/app';
import {
  getDocs,
  collection,
  setDoc,
  getFirestore,
  doc,
} from 'firebase/firestore';
import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getProductsFromFirestore = async () => {
  try {
    const productsArray = await getDocs(collection(db, 'products'));
    const products = {};
    productsArray.forEach((doc) => (products[doc.id] = doc.data()));
    console.log(products);

    return {
      data: products,
      message: 'Succesfully Products Request',
      isSuccess: true,
    };
  } catch (error) {
    console.log('error', error);

    return {
      error: new Error('Internal Server Error'),
      message: 'Error en el servidor',
      isSuccess: false,
    };
  }
};

export const updateAllProductsToFirestore = async (productsJson) => {
  const productsDocsSnapshot = await getDocs(collection(db, 'products'));

  productsDocsSnapshot.forEach(async (docData) => {
    console.log('productsJson[doc]', productsJson[docData.id]);

    try {
      await setDoc(doc(db, 'products', docData.id), productsJson[docData.id]);

      const message = 'Productos actualizados con exito';
      console.log(message);

      return { isSuccess: true, message, error: null };
    } catch (error) {
      console.log('error', error);

      return {
        isSuccess: false,
        message: 'Error en el servidor',
        error: new Error('Internal Server Error'),
      };
    }
  });
};
