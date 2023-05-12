import fs from 'fs';
import path from 'path';
import transporter from './config.js';
import xlsx from 'xlsx';

const attachmPath = path.join(process.cwd(), 'src/nodemailer/attachments');

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
        path: path.join(attachmPath, order.id.concat('.xlsx')),
      },
    ],
  };

  transporter.sendMail(sendMailOptions, (err, info) => {
    if (err) {
      console.log(err.message);
    } else {
      fs.unlink(path.join(attachmPath, order.id + '.xlsx'), (unlinkError) => {
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
  /* const filePath = path.join(attachmPath, body.id + '.xls');
  
  let itemsToString = '';

  body.items.forEach(
    (item) =>
      (itemsToString +=
        item.CODIGO +
        ' ---- ' +
        item.MEDIDA +
        ' ---- ' +
        item.quantity +
        ' un' +
        '\n')
  ); */

  /*fs.writeFile(filePath, data, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Archivo creado con sucesso!!');
      sendEmailOrder(body.email, body, data);
      return;
    }
  }); */

  sendEmailOrder(body.email, body);
};

export const createXlsFile = (object) => {
  let aoaData = [];
  /* Object.keys(object).forEach((key) => {
    aoaData[0] = ;
  }); */
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
  aoaData[1] = ['CODIGO', 'TIPO', 'PRODUCTO', 'CANTIDAD', 'PRECIO'];
  object.items.forEach((item, index) => {
    aoaData[index + 2] = [
      item.CODIGO,
      item.TIPO,
      item.MEDIDA,
      item.quantity,
      item.PRECIO,
    ];
  });

  const workbook = xlsx.utils.book_new();
  const worksheet = xlsx.utils.aoa_to_sheet(aoaData);

  console.log(worksheet);

  xlsx.utils.book_append_sheet(workbook, worksheet, 'Pedido');

  xlsx.writeFile(workbook, path.join(attachmPath, object.id.concat('.xlsx')));
};
