import path from 'path';
import fs from 'fs';
// import fs from 'fs-extra';

import {
  getProductsFromFirestore,
  sendAllDataToDB,
  uploadFileToStorageFirebase,
} from '../firebase/utils.js';
import XLSX from 'xlsx';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

const tmpPath = os.tmpdir();

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
  const createJsonFileFromObject = (jsonObject) => {
    const jsonStringfy = JSON.stringify(jsonObject);
    const jsonPath = path.join(tmpPath, 'db_products.json');
    console.log('jsonPath', jsonPath);

    fs.writeFileSync(jsonPath, jsonStringfy);

    return jsonPath;
  };

  try {
    const productsFromDB = await getProductsFromFirestore(collectionName);
    const createdJsonPath = createJsonFileFromObject(productsFromDB.data);
    console.log('Json file created from DB!');

    return {
      isSuccess: true,
      message: 'Json file created from DB!',
      path: createdJsonPath,
      data: productsFromDB.data,
    };
  } catch (error) {
    console.log(error);

    return {
      isSuccess: false,
      message: 'Json file failed to created from DB!',
      error,
    };
  }
};

export const updatePrices = (excelFile) => {
  let products;
  const jsonPath = path.join(tmpPath, 'db_products.json');

  try {
    const data = fs.readFileSync(jsonPath);

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

    const message = 'updated_products.json created!';

    console.log(`
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        !!!!!!!!!!!!!!  JSON ACTUALIZADO CREADO CON EXITO !!!!!!!!!!!!!!!!!!!
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        !!!! Path: ${updatedJsonPath}
      `);

    return { isSuccess: true, message };
  } catch (error) {
    console.log(error);

    return {
      isSuccess: false,
      message: 'Failed to update prices to json!',
      error,
    };
  }
};

export const sendUpdatedProductsToDB = async (collectionName) => {
  try {
    const updatedJsonPath = path.join(tmpPath, 'updated_products.json');
    const updatedJsonFile = JSON.parse(fs.readFileSync(updatedJsonPath));
    await sendAllDataToDB(updatedJsonFile, collectionName);
    const message = 'Your new prices is now available!';

    console.log(`
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        !!!!!!!!!!!!!!  DATABASE ACTUALIZADO CON EXITO!!!!!!!!!!!!!!!!!!!!!!!
        !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
      `);
    return {
      isSuccess: true,
      message,
    };
  } catch (error) {
    console.log('error', error);

    return {
      isSuccess: false,
      message: 'Failed to update prices to json!',
      error,
    };
  }
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

export const uploadFile = (originalname, mimetype, buffer) => {
  const filename = set_Date_To_String() + '.' + originalname.split('.').pop(); // agarra la extensión
  const filePath = path.join(tmpPath, filename);

  try {
    uploadFileToStorageFirebase(mimetype, buffer, filename);
    fs.writeFileSync(filePath, buffer);

    console.log(`File ${filename} uploaded in filesystem!!!`);

    return filePath;
  } catch (error) {
    console.log('error', error);

    throw error;
  }
};

export const productsExcelToJson = (excelFilePath, products) => {
  const excel = XLSX.readFile(excelFilePath);

  let sheetNames = excel.SheetNames;

  if (sheetNames.find((sheetName) => sheetName === 'PAGINA DE INICIO')) {
    sheetNames.splice(0, 1); // PRIMERA HOJA 'PAGINA DE INICIO' NO ESTOY USANDO
  }

  const transformProductsFirebaseJsonToFlatArray = () => {
    const subMenuKeys = Object.keys(products);
    let allProductsArray = [];

    subMenuKeys.forEach((subMenuKey) => {
      const subSubMenuKeys = Object.keys(products[subMenuKey]);

      subSubMenuKeys.forEach((subSubMenuKey) => {
        allProductsArray.push(products[subMenuKey][subSubMenuKey]);
      });
    });

    const allProductsFlattenArray = allProductsArray.flatMap(
      (arrayOfProducts) => arrayOfProducts
    );

    return allProductsFlattenArray;
  };

  function transformToNewObject() {
    let newJson = {};
    const allFirebaseProductsFlattenArray =
      transformProductsFirebaseJsonToFlatArray();

    sheetNames.forEach((sheetName) => {
      let newJsonDataObject = {};
      let sheet = excel.Sheets[sheetName];
      let datosSheetName = XLSX.utils.sheet_to_json(sheet);

      /* Chequear si el codigo ya existe, usar el mismo ID */
      datosSheetName.forEach((product) => {
        let productWithId = {};
        const existentProduct = allFirebaseProductsFlattenArray.find(
          (firebaseProduct) => firebaseProduct.CODIGO === product.CODIGO
        );

        if (existentProduct) {
          productWithId = { ...product, id: existentProduct.id };
        } else {
          productWithId = { ...product, id: uuidv4() };
        }

        const typeOfProduct = product['TIPO'];
        if (typeOfProduct) {
          if (newJsonDataObject[typeOfProduct]) {
            newJsonDataObject[typeOfProduct].push(productWithId);
          } else {
            newJsonDataObject[typeOfProduct] = [productWithId];
          }

          return;
        }
        if (newJsonDataObject['Sin nombre']) {
          newJsonDataObject['Sin nombre'].push(productWithId);
        } else {
          newJsonDataObject['Sin nombre'] = [productWithId];
        }
      });
      newJson[sheetName] = newJsonDataObject;
    });

    return newJson;
  }

  const jsonpath = path.join(tmpPath, 'newProducts.json');

  /* if (sheetNames.length < 1) {
    console.log(
      `
    ----------------- No coincide el argumento menuName con ninguna sheetName!! ----------------     `
    );
    return;
  } */

  const dataToJson = transformToNewObject();

  try {
    fs.writeFileSync(jsonpath, JSON.stringify(dataToJson));

    const message = `
    ------------------------------------------------------------------------
      ----------------- Json productos creado con exito!! ----------------  
    ------------------------------------------------------------------------   
      `;

    console.log(message);

    return { data: dataToJson, path: jsonpath, isSuccess: true, message };
  } catch (error) {
    const message = error.message || 'Error al crear newProducts.json';
    console.log(message);

    return {
      error: new Error(error.message),
      path: null,
      isSuccess: false,
      message,
    };
  }
};

export const createExcelFileFromJson = (parsedJson) => {
  const filename = set_Date_To_String() + '.xlsx';

  let workbook = XLSX.utils.book_new();

  const jsonFileKeys = Object.keys(parsedJson);

  jsonFileKeys.forEach((key) => {
    const jsonFileSubkeys = Object.keys(parsedJson[key]);
    let subProdArray = [];

    jsonFileSubkeys.forEach((subkey) => {
      subProdArray.push(parsedJson[key][subkey]);
    });

    const flatSubProdArray = subProdArray.flatMap((item) => item);

    const worksheet = XLSX.utils.json_to_sheet(flatSubProdArray);
    XLSX.utils.book_append_sheet(workbook, worksheet, key.toUpperCase());
  });

  const filePath = path.join(tmpPath, filename);

  XLSX.writeFile(workbook, filePath);

  return { filePath, filename };
};
