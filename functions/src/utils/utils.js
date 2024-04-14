import path from 'path';
/* import fs from 'fs'; */
import fs from 'fs-extra';
import { getProductsFromFirestore, sendDataToDB } from '../firebase/utils.js';
import XLSX from 'xlsx';
import os from 'os';
const tmpPath = os.tmpdir();
import admin from 'firebase-admin';

/* const products = require(path.resolve('productsFirebaseJson.json'));
 */

export const updateAllPrices = (productsJson, factorAumento) => {
  let updatedProductsJson = {};
  for (const prodType in productsJson) {
    updatedProductsJson[prodType] = {};
    for (const subType in productsJson[prodType]) {
      updatedProductsJson[prodType][subType] = [];
      productsJson[prodType][subType].forEach((producto, index) => {
        updatedProductsJson[prodType][subType].push(producto);
        console.log(parseFloat(productsJson[prodType][subType][index].PRECIO));
        updatedProductsJson[prodType][subType][index].PRECIO =
          parseFloat(productsJson[prodType][subType][index].PRECIO) *
          (1 + factorAumento / 100);
      });
      /* console.log(
          'updatedProductsJson[prodType][subType][index]',
          productsJson[prodType][subType]
          ); */
    }
  }
  return updatedProductsJson;
};

export const createAsyncJsonFromDB = async (collectionName) => {
  const createJsonFileFromObject = async (jsonObject) => {
    const jsonStringfy = JSON.stringify(jsonObject);
    const jsonPath = path.join(tmpPath, 'db_products.json');
    console.log('jsonPath', jsonPath);

    fs.writeFileSync(jsonPath, jsonStringfy);
  };

  const productsFromDB = await getProductsFromFirestore(collectionName);
  /*   console.log(productsFromDB);
   */
  createJsonFileFromObject(productsFromDB.data);
};

export const updatePrices = async (excelFile) => {
  let products;
  const jsonPath = path.join(tmpPath, 'db_products.json');
  console.log('jsonPath', jsonPath);

  fs.readFile(jsonPath, 'utf-8', (err, data) => {
    if (err) {
      console.log('err', err);

      throw err;
    }
    products = JSON.parse(data);
    const productsKeys = Object.keys(products);

    /*  console.log('products', products); */

    const excel = XLSX.readFile(excelFile);
    const sheet = excel.Sheets['HojaParaActualizar'];
    const datosSheetName = XLSX.utils.sheet_to_json(sheet);
    productsKeys.forEach((productKey) => {
      Object.keys(products[productKey]).forEach((subProductoKey) => {
        products[productKey][subProductoKey].forEach((productItem, index) => {
          datosSheetName.forEach((item) => {
            if (
              item.CODIGO == products[productKey][subProductoKey][index].CODIGO
            ) {
              if (typeof item.PRECIO === 'string') {
                products[productKey][subProductoKey][index].PRECIO = Math.round(
                  parseFloat(item.PRECIO.replace('$', ''))
                );
              } else {
                products[productKey][subProductoKey][index].PRECIO = Math.round(
                  item.PRECIO
                );
              }
            }
          });
        });
      });
    });

    const updatedJsonPath = jsonPath.replace('db', 'updated');
    fs.writeFileSync(updatedJsonPath, JSON.stringify(products));

    console.log(`
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!  ACTUALIZADO CON EXITO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!! Path: ${updatedJsonPath}
    `);
  });
};

export const sendUpdatedProductsToDB = async (collectionName) => {
  const updatedJsonPath = path.join(tmpPath, 'updated_products.json');
  const updatedJsonFile = JSON.parse(fs.readFileSync(updatedJsonPath));

  await sendDataToDB(updatedJsonFile, collectionName);
};

const set_Date_To_String = () => {
  const now = Date.now();
  const nowAR = new Date(now - 10800000);

  const día = nowAR.getDate();
  const mes = nowAR.getMonth() + 1;
  const year = nowAR.getFullYear();
  const hora = nowAR.getHours();
  const min = nowAR.getMinutes();
  const seg = nowAR.getSeconds();

  const string = `D${día}-${mes}-${year}_T${hora}-${min}-${seg}`;

  return string;
};

import { Readable } from 'stream';
export const uploadFile = async (originalname, mimetype, buffer) => {
  const filename = set_Date_To_String() + '.' + originalname.split('.').pop(); // agarra la extensión
  console.log('filename', filename);
  const filePath = path.join(tmpPath, filename);

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
    .on('finish', () => console.log('File upload finished'));

  fs.writeFile(filePath, buffer, (err) =>
    err
      ? console.log('error', err)
      : console.log('File uploaded in filesystem!!!')
  );
  return filePath;
};
