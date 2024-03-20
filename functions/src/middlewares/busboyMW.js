import Busboy from 'busboy';
import path from 'path';

// Usando bulboy, falta terminar:

export const fileUpload = (req, res, next) => {
  const busboy = new Busboy({
    headers: req.headers,
    limits: { fileSize: 10 * 1024 * 1024 },
  });

  const fields = {};
  const files = [];
  fileWrites = [];

  const tmpdir = os.tmpdir();

  busboy.on('field', (key, value) => {
    fields[key] = value;
  });

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    const filepath = path.join(tmpdir, filename);
    console.log(
      `Handling file upload field ${fieldname}: ${filename} (${filepath})`
    );
    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    fileWrites.push();
  });
};
