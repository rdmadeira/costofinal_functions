import fs from 'fs';
import path from 'path';
import transporter from './config.js';
import xlsx from 'xlsx';
import os from 'os';

// GCFunctions solo acepta escribir archivos que no son de la app, los de la app son solo READ.
// Se crea un directorio /tmp para escribir estos archivos. Tiene vida solamente en durante la instancia de la función.
const tmpPath = os.tmpdir();

export const sendEmailOrder = (email, order) => {
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
    cc: 'compras.costofinal@gmail.com',
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

export const createFileandSend = (body) => {
  console.log(body);
  createXlsFile(body);

  sendEmailOrder(body.email, body);
};

export const createXlsFile = (object) => {
  let aoaData = [];

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
  aoaData[2] = ['CODIGO', 'TIPO', 'PRODUCTO', 'CANTIDAD', 'PRECIO'];
  object.items.forEach((item, index) => {
    aoaData[index + 3] = [
      item.CODIGO,
      item.TIPO,
      item.MEDIDA,
      item.quantity,
      item.PRECIO,
    ];
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(aoaData);

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Pedido');

  // Error en el ejecutar writeAsyncFile:
  xlsx.writeFile(workbook, path.join(tmpPath, object.id.concat('.xlsx')));
};
