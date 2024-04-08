import path from 'path';
import fs from 'fs';
import { getProductsFromFirestore } from '../firebase/utils.js';
import XLSX from 'xlsx';

/* const products = require(path.resolve('productsFirebaseJson.json'));
 */

export const updateAllPrices = (productsJson) => {
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
  const createJsonFileFromObject = (jsonObject) => {
    const jsonStringfy = JSON.stringify(jsonObject);
    const jsonPath = path.resolve('src/temp/files', 'db_products.json');

    fs.writeFileSync(jsonPath, jsonStringfy);
  };

  const productsFromDB = await getProductsFromFirestore(collectionName);
  console.log(productsFromDB);

  createJsonFileFromObject(productsFromDB.data);
};

export const updatePrices = async (excelFile) => {
  let products;
  const jsonPath = path.resolve('src/temp/files', 'db_products.json');
  console.log('jsonPath', jsonPath);

  fs.readFile(jsonPath, 'utf-8', (err, data) => {
    if (err) {
      console.log('err', err);

      throw err;
    }
    products = JSON.parse(data);
    const productsKeys = Object.keys(products);

    console.log('products', products);

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
    fs.writeFileSync(
      jsonPath.replace('db', 'updated'),
      JSON.stringify(products)
    );
    console.log('updatedPrices', products);

    console.log(`
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!  ACTUALIZADO CON EXITO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    `);
  });

  // PRODUCTS ---> UNDEFINED ---> RESOLVER..........
  //
  // ACA............................................................
  //
  //
  //
};
