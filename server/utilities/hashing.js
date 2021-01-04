const bcrypt = require('bcrypt');

exports.hashPassword = async function (password) {
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);

  return hash;
}
