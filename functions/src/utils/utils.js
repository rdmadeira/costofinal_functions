export const updateAllPrices = (factorAumento, productsJson) => {
  let updatedProductsJson = {};
  for (const prodType in productsJson) {
    updatedProductsJson[prodType] = {};
    for (const subType in productsJson[prodType]) {
      updatedProductsJson[prodType][subType] = [];
      productsJson[prodType][subType].forEach((producto, index) => {
        updatedProductsJson[prodType][subType].push(producto);
        updatedProductsJson[prodType][subType][index].PRECIO =
          parseFloat(productsJson[prodType][subType][index].PRECIO) *
          (1 + factorAumento / 100);
      });
      /* console.log(
          'updatedProductsJson[prodType][subType][index]',
          productsJson[prodType][subType]
          ); */
    }
    console.log('updated' + ': ', updatedProductsJson);
  }
  return updatedProductsJson;
};
