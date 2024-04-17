import { initializeApp } from 'firebase/app';
import {
  getDocs,
  collection,
  setDoc,
  getFirestore,
  doc,
} from 'firebase/firestore';
import admin from 'firebase-admin';
import { getAuth } from 'firebase/auth';

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
      message: 'Error en el servidor',
      isSuccess: false,
    };
  }
};

export const sendNewProductsToFirestore = async (
  newProductsJson,
  collectionName,
  merge
) => {
  let message = '';
  let isMerge = merge == 'true' ? true : false;
  console.log('merge', merge, 'isMerge', isMerge);

  try {
    const newProductsJsonKeys = Object.keys(newProductsJson);
    for (let i = 0; i < newProductsJsonKeys.length; i++) {
      const key = newProductsJsonKeys[i];
      await setDoc(doc(db, collectionName, key), newProductsJson[key], {
        merge: isMerge,
      });
      message += `Producto ${key} creado con succeso! `;
    }
    console.log('message', message);

    return { isSuccess: true, message };
  } catch (error) {
    console.log('error', error);
    const message = error.message || 'Error interno en servidor';

    return { isSuccess: false, message, error };
  }
};

// Solo actualiza productos existentes:
/* export const updateProductsToFirestore = async (
  productsJson,
  collectionName
) => {
  const productsJsonKeys = Object.keys(productsJson);

  const productsDocsSnapshot = await getDocs(collection(db, 'products'));

  try {
    productsDocsSnapshot.forEach(async (docData) => {
      const existsKey = productsJsonKeys.find(
        (key) => key.toUpperCase() === docData.id
      );

      if (existsKey) {
        await setDoc(
          doc(db, collectionName, docData.id),
          productsJson[existsKey]
        );
      }
    });
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
}; */

// Solo crea productos nuevos: la api de firebase permite con el mismo set actualizar o crear si no existe, pero opté por hacer 2 funciones distintas.
// No estoy usando.
/* export const createNewProductsToFirestore = async (
  productsJson,
  collectionName
) => {
  const productsJsonKeys = Object.keys(productsJson);

  const productsDocsSnapshot = await getDocs(collection(db, 'products'));
  let productsDocsKeys = [];
  productsDocsSnapshot.forEach((docKey) => {
    productsDocsKeys.push(docKey.id);
  });

  try {
    let message = ''; */

/* No usar forEach, el forEach ejecutará una función asíncrona para cada elemento del arreglo lo que hace más difícil hacer 
      la espera con async/await. En cambio el for se ejecutará de forma secuencial haciendo la espera correspondiente a 
      cada petición. Entonces debemos evitar el uso de forEach en operaciones asincrónicas, parece un patrón complicado, saludos
      https://es.stackoverflow.com/questions/480163/problema-con-foreach-dentro-de-un-async-await */
/* for (let i = 0; i < productsJsonKeys.length; i++) {
      const key = productsJsonKeys[i];
      const existsKey = await productsDocsKeys.find(
        (docKey) => key.toUpperCase() === docKey
      );

      if (!existsKey) {
        await setDoc(doc(db, collectionName, key), productsJson[key]);
        message += `Producto ${key} creado con succeso! `;
      } else {
        message += `Este producto ${key} ya existe, no se actulizó porque el query isNew tiene valor true. `;
      }
    }

    console.log('message antes de return', message);
    return { isSuccess: true, message, error: null };
  } catch (error) {
    console.log('error', error);

    return {
      isSuccess: false,
      message: 'Error en el servidor',
      error: new Error('Internal Server Error'),
    };
  }
}; */

export const sendDataToDB = async (jsonFile, collectionName) => {
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
    })
    .on('finish', () => console.log('File upload to Storage finished'));
};

/* No hace falta porque la logica del updateProducts solo cambia a los que coincide 
  export const updateOneSubproductToFirestore = async (productsJson, test) => {
    try {
      const productsJsonKeys = Object.keys(productsJson);
      const productsDocsSnapshot = await getDocs(
        collection(db, test ? 'products2' : 'products')
        );
        
        productsDocsSnapshot.forEach(async (docData) => {
          const existsKey = productsJsonKeys.find(
            (key) => key.toUpperCase() === docData.id
            );
            console.log('existsKey', existsKey);
            
            if (existsKey) {
              console.log('existsKey', existsKey);
              
              await setDoc(
                doc(db, test ? 'products2' : 'products', docData.id),
                productsJson[existsKey]
                );
              }
            });
            
            const message = 'Productos actualizados con exito';
            
            return { isSuccess: true, message, error: null };
          } catch (error) {
            console.log('error', error);
    
            return {
              isSuccess: false,
              message: 'Error en el servidor',
              error: new Error('Internal Server Error'),
            };
          }
        }; */
