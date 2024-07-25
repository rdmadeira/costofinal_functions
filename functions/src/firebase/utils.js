/* import { firebaseApp } from '../../index.js'; */

// import these as needed..
import '@firebase/auth';

import '@firebase/firestore';
import {
  getDocs,
  collection,
  setDoc,
  getFirestore,
  doc,
} from 'firebase/firestore';

import { initializeApp } from 'firebase/app';

import { firebaseConfig } from './config.js';

import { getStorage, ref, getDownloadURL, uploadBytes } from 'firebase/storage';

import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';

// Initialize Firebase

const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp);
const storages1 = getStorage(firebaseApp, 'gs://costofinal-b391b.appspot.com');
export const db = getFirestore(firebaseApp);

export const getImageStorage = async (path) => {
  const url = await getDownloadURL(ref(storages1, 'assets/' + path));
  return url;
};

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
          let tipoSubProdToDBArray = products[key][subKey] || [];
          newProductsJson[key][subKey].forEach((newProdObject) => {
            console.log('tipoSubProdToDBArray', tipoSubProdToDBArray);

            const productExistsIndex = tipoSubProdToDBArray.findIndex(
              // no va find, tengo que usar el indice el array original:
              (prodObject) => newProdObject.id === prodObject?.id
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
  // forEach no funciona para async await!!!
  /* Object.keys(jsonFile).forEach((key) => {
      await setDoc(doc(db, collectionName, key), jsonFile[key]);
      console.log('setDoc', collectionName, key);
    }); */
  let promises = [];
  try {
    for (const key in jsonFile) {
      promises.push(setDoc(doc(db, collectionName, key), jsonFile[key]));
    }
    await Promise.all(promises); // Junta todas las promesas si alguna falla, aciona el catch, o cuando termina todos los resultados de las promesas, aciona el try

    const message = 'Actualizado con exito en la base de datos';
    console.log(message);
    return { isSuccess: true, message };
  } catch (error) {
    console.log('error', error);
    return { isSuccess: false, error };
  }
};

export const uploadFileToStorageFirebase = async (
  mimetype,
  buffer,
  filename
) => {
  // Función para transformar el file.buffer en Arraybuffer porque daba error en el uploadBytes en bytesLength como undefined
  function toArrayBuffer(buffer) {
    const arrayBuffer = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(arrayBuffer);
    for (let i = 0; i < buffer.length; ++i) {
      view[i] = buffer[i];
    }
    return arrayBuffer;
  }

  const arrayBuffer = toArrayBuffer(buffer);

  const xlsStorageRef = ref(storages1, 'xls/' + filename);

  const metaData = {
    contentType: mimetype,
  };

  uploadBytes(xlsStorageRef, arrayBuffer, metaData)
    .then((snapshot) => {
      return snapshot.ref.fullPath;
    })
    .catch((error) => {
      console.log('error', error);

      return 'Error al hacer upload en Storage';
    });
};

export const signIn = async (mail, pw) => {
  try {
    const signInResponse = await signInWithEmailAndPassword(auth, mail, pw);

    return signInResponse;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const signOutAuth = () => {
  signOut(auth)
    .then(() => {
      console.log('Signout succesfully');
    })
    .catch((error) => {
      console.log('error', error);
    });
};
