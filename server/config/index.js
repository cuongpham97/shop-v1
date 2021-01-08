const dotenv = require('dotenv');
const { join } = require('path');

const env = dotenv.config({ path: join(__dirname, "../.env") });
if (env.error) {
  throw env.error;
}

const environment = require('./environment');
const server = require('./server');
const jwt = require('./jwt');
const database = require('./database');
const imgur = require('./imgur');

module.exports = {
  ...environment, server, jwt, database, imgur
};
