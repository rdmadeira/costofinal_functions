import fs from 'fs';
import path from 'path';
import transporter from './config.js';
import xlsx from 'xlsx';
import os from 'os';

// GCFunctions solo acepta escribir archivos que no son de la app, los de la app son solo READ.
// Se crea un directorio /tmp para escribir estos archivos. Tiene vida solamente en durante la instancia de la función.
const tmpPath = os.tmpdir();

export const sendEmailOrder = async (email, order) => {
  let itemsToString = '';

  order.items.forEach(
    (item) =>
      (itemsToString +=
        item.CODIGO +
        ' ---- ' +
        item.MEDIDA +
        ' ---- ' +
        item.quantity +
        ' un \n')
  );
  const orderText = `
  Order ID: ${order.id};

  Items: ${itemsToString}

  Creado el: ${order.createdAt}`;

  const sendMailOptions = {
    from: 'compras.costofinal@gmail.com',
    to: email,
    cc: 'costofinalbronce@gmail.com',
    subject: `${order.name} Gracias por su pedido!!`,
    html: `
    <h2>Pedido n° ${order.id} registrado con suceso...</h2>
    <p>Entraremos en contato en la brevedad para seguir los próximos pasos</p>
    <p>${orderText}</p>
    `,
    text: `
      Pedido enviado con suceso...
      Entraremos en contato en la brevedad para seguir los próximos pasos. 
      ${orderText}
      `,

    attachments: [
      {
        filename: order.id.concat('.xlsx'),
        path: path.join(tmpPath, order.id.concat('.xlsx')),
      },
    ],
  };

  transporter.sendMail(sendMailOptions, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      fs.unlink(path.join(tmpPath, order.id + '.xlsx'), (unlinkError) => {
        if (unlinkError) {
          console.log('No se pudo borrar el archivo - error al borrar');
        } else {
          console.log(info.response);
        }
      });
    }
  });
};

export const createFileandSend = async (body) => {
  console.log(body);
  await createXlsFile(body);

  await sendEmailOrder(body.email, body);
  return;
};

export const createXlsFile = async (object) => {
  let aoaData = [];
  let Total = 0;

  aoaData[0] = [
    'PEDIDO N° ',
    object.id,
    '',
    'FECHA: ',
    object.createdAt,
    '',
    'CLIENTE: ',
    object.email,
  ];
  aoaData[1] = ['_____', '_____', '_____', '_____', '_____'];
  aoaData[2] = ['CODIGO', 'TIPO', 'PRODUCTO', 'CANTIDAD', 'PRECIO', 'SUBTOTAL'];

  object.items.forEach((item, index) => {
    aoaData[index + 3] = [
      item.CODIGO,
      item.TIPO,
      item.MEDIDA,
      item.quantity,
      item.PRECIO,
      item.PRECIO * item.quantity,
    ];
    Total += item.PRECIO * item.quantity;
  });
  aoaData.push(['XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX']);
  aoaData.push(['', '', '', '', 'TOTAL: ', Total]);
  const addressData = [
    ['Nombre: ', `${object.name} ${object.lastname}`],
    [
      'Dirección: ',
      `${object.address.calle} ${object.address.numero} ${
        object.address.complemento || ''
      }`,
    ],
    ['Localidad: ', `${object.address.localidad}`],
    ['CP: ', `${object.address.CP}`],
    ['Telefono: ', `${object.phone}`],
  ];
  /* aoaData.push(addressData); */

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(aoaData);
  xlsx.utils.sheet_add_aoa(worksheet, addressData, {
    origin: `A${aoaData.length + 2}`,
  });
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Pedido');

  // Error en el ejecutar writeAsyncFile:
  xlsx.writeFile(workbook, path.join(tmpPath, object.id.concat('.xlsx')));
};
