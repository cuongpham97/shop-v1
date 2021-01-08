const { readFileSync } = require('fs');
const { join } = require('path');

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
  ACCESS_TOKEN_LIFE: 7200, 
  REFRESH_TOKEN_LIFE: '30d',

  ACCESS_PRIVATE_KEY: secretKey.access.private,
  ACCESS_PUBLIC_KEY: secretKey.access.public,

  REFRESH_PRIVATE_KEY: secretKey.refresh.private,
  REFRESH_PUBLIC_KEY: secretKey.refresh.public
};
