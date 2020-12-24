const dotenv = require('dotenv');
const { readFileSync } = require('fs');
const { join } = require('path');
const logger = require('../utilities/logger');

const env = dotenv.config({ path: join(__dirname, "../.env") });
if (env.error) {
  throw env.error;
}

['APP_ENV', 'DB_MONGODB_URI'].forEach(params => {
  if (!process.env[params]) {
    logger.error('Missing enviroment params: ' + params);
    process.exit(0);
  }
});

const secretKey = {
  access: {
    private: readFileSync(join(__dirname, '../keys/access/private.key')),
    public: readFileSync(join(__dirname, '../keys/access/public.key'))
  },

  refresh: {
    private: readFileSync(join(__dirname, '../keys/refresh/private.key')),
    public: readFileSync(join(__dirname, '../keys/refresh/public.key'))
  }
};

module.exports = {
  ENVIROMENT: process.env.APP_ENV,

  ROOT_PATH: join(__dirname, '..'),

  server: {
    LISTEN_PORT: process.env.APP_PORT,
  },

  jwt: {
    ACCESS_TOKEN_LIFE: 7200, 
    REFRESH_TOKEN_LIFE: '30d',

    ACCESS_PRIVATE_KEY: secretKey.access.private,
    ACCESS_PUBLIC_KEY: secretKey.access.public,

    REFRESH_PRIVATE_KEY: secretKey.refresh.private,
    REFRESH_PUBLIC_KEY: secretKey.refresh.public
  },

  database: {
    mongodb: {
      URI: process.env.DB_MONGODB_URI,
      Opts: {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useFindAndModify: false
      }
    }
  }
}
