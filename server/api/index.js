const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const config = require('~config');
const { unflatten } = require('~middleware/flat-query');
const { exceptionHandler, NotFoundException } = require('~exceptions');

const api = express();

if (config.ENVIRONMENT === 'DEVELOPMENT') {
  api.use(morgan('dev'));
  api.set('json spaces', 2);
}

api.use(cors());
api.use((_req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

api.disable('x-powered-by');
api.set('etag', false);

api.use(express.json({ limit: '18mb' }));
api.use(unflatten);

// Define route
const user = require('~routes/user.routes');

api.use(user);

api.use('*', () => { 
  throw new NotFoundException({ message: 'Request does not match any route' });
});

api.use(exceptionHandler);

module.exports = api;
