const jwt = require('jsonwebtoken');
const config = require('../config').jwt;

exports.createAccessToken = (payload) => jwt.sign(payload, config.ACCESS_PRIVATE_KEY, {
  algorithm: 'RS256',
  expiresIn: config.ACCESS_TOKEN_LIFE
});

exports.verifyAccessToken = (token) => jwt.verify(token, config.ACCESS_PUBLIC_KEY, { 
  algorithms: ['RS256'] 
});

exports.createRefreshToken = (payload) => jwt.sign(payload, config.REFRESH_PRIVATE_KEY, {
  algorithm: 'RS256',
  expiresIn: config.REFRESH_TOKEN_LIFE
});

exports.verifyRefreshToken = (token) => jwt.verify(token, config.REFRESH_PUBLIC_KEY, { 
  algorithms: ['RS256'] 
});
