const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('../config');
const { unflatten } = require('./middleware/flat_query');
const { exceptionHandler } = require('./exceptions');

const api = express();

if (config.ENVIRONMENT === 'DEVELOPMENT') {
  api.use(morgan('dev'));
  api.set('json spaces', 2);
}

api.use(cors());
api.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
})

api.disable('x-powered-by');
api.set('etag', false);

//api.use(bodyParser.urlencoded({ litmit: '18mb',extended: true }));

api.use(express.json({ limit: '18mb' }));
api.use(unflatten);

const user = require('./routes/user.routes');

api.use(user);

api.use(exceptionHandler);

module.exports = api;
