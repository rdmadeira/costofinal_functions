import bcrypt from 'bcryptjs';

bcrypt.genSalt(10, function (err, salt) {
  if (err) return { name: err.name, message: err.message, err };
  bcrypt.hash(process.env.AUTH_PASSWORD, salt, function (errhash, hash) {
    if (errhash)
      return { message: errhash.message, name: errhash.name, errhash };
    return hash;
  });
});
