import { initializeApp } from 'firebase/app';
import {
  getDocs,
  collection,
  setDoc,
  getFirestore,
  doc,
} from 'firebase/firestore';
import admin from 'firebase-admin';

/* import { getAuth } from 'firebase/auth'; */

import { firebaseConfig } from './config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export const getProductsFromFirestore = async () => {
  try {
    const productsArray = await getDocs(collection(db, 'products'));
    const products = {};
    productsArray.forEach((doc) => (products[doc.id] = doc.data()));

    return {
      data: products,
      message: 'Succesfully Products Request',
      isSuccess: true,
    };
  } catch (error) {
    console.log('error', error);

    return {
      error: new Error('Internal Server Error'),
      message: 'Falla en obtener los datos de productos en la base de datos',
      isSuccess: false,
    };
  }
};

export const sendNewProductsToFirestore = async (
  newProductsJson,
  collectionName,
  merge,
  mergeTipoProducto
) => {
  let message = '';
  let isMerge = merge == 'true' ? true : false;
  let isMergeTipoProducto = mergeTipoProducto == 'true' ? true : false;
  // usar getDocs y mantener todo el tipo de producto agregando los productos nuevos en tipo - if mergeTipoProducto === true
  try {
    const productsFromDbResponse = await getProductsFromFirestore();
    if (!productsFromDbResponse.isSuccess) {
      return {
        isSuccess: productsFromDbResponse.isSuccess,
        message: productsFromDbResponse.message,
        error: productsFromDbResponse.error,
      };
    }

    const newProductsJsonKeys = Object.keys(newProductsJson);
    const products = productsFromDbResponse.data;

    for (let i = 0; i < newProductsJsonKeys.length; i++) {
      const key = newProductsJsonKeys[i];
      const subProdkeys = Object.keys(newProductsJson[key]);
      // Sí el merge es nivel tipo de subproducto:
      let subProdToDB = products[key];
      if (isMergeTipoProducto && isMerge) {
        // for in bucle tambien sirve

        for (let j = 0; j < subProdkeys.length; j++) {
          // No acepta array, tendría que fabricar el nuevo array y setear el nuevo objecto
          /* await setDoc(doc(db, collectionName, key), newProductsJson[key], {
            merge: true,
          }); */
          const subKey = subProdkeys[j];
          let tipoSubProdToDBArray = products[key][subKey];
          newProductsJson[key][subKey].forEach((newProdObject) => {
            const productExistsIndex = products[key][subKey].findIndex(
              // no va find, tengo que usar el indice el array original:
              (prodObject) => newProdObject.id === prodObject.id
            );
            console.log('productExistsIndex', productExistsIndex);

            if (productExistsIndex >= 0) {
              console.log('productExists', newProdObject); //ok
              tipoSubProdToDBArray[productExistsIndex] = newProdObject;
            } else {
              console.log('productnoexists', newProdObject); //ok
              tipoSubProdToDBArray.push(newProdObject);
            }
          });
          subProdToDB[subKey] = tipoSubProdToDBArray;
        }
        await setDoc(doc(db, collectionName, key), subProdToDB, {
          merge: isMerge,
        });
      } else {
        if (isMerge && isMergeTipoProducto === false)
          await setDoc(doc(db, collectionName, key), subProdToDB, {
            merge: false,
          });
        await setDoc(doc(db, collectionName, key), newProductsJson[key], {
          merge: isMerge,
        });
      }

      message += `Producto ${key} creado con succeso! `;
    }
    console.log('message', message);

    return { isSuccess: true, message };
  } catch (error) {
    console.log('error', error);
    const message = error.message || 'Error interno en servidor';

    return { isSuccess: false, message, error: new Error(error.message) };
  }
};

export const sendAllDataToDB = async (jsonFile, collectionName) => {
  console.log('collectionName', collectionName);

  try {
    Object.keys(jsonFile).forEach(async (key) => {
      await setDoc(doc(db, collectionName, key), jsonFile[key]);
    });
    console.log('Actualizado con exito en la base de datos');
  } catch (error) {
    return console.log(error);
  }
};

import { Readable } from 'stream';

export const uploadFileToStorageFirebase = async (
  mimetype,
  buffer,
  filename
) => {
  const fileStream = Readable.from(buffer);
  const storage = admin.storage().bucket();

  const fileUpload = storage.file(filename);
  const writeStream = fileUpload.createWriteStream({
    metadata: {
      contentType: mimetype,
    },
  });
  fileStream
    .pipe(writeStream)
    .on('error', (error) => {
      console.log('error', error);
      throw error;
    })
    .on('finish', () => console.log('File upload to Storage finished'));
};
