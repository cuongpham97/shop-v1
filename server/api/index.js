const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('../config');
const { unflattenQueryString } = require('./middleware/querystring');
const { exceptionHandler } = require('./exceptions');

const api = express();

api.use(morgan('dev'));
if (config.ENVIROMENT === 'DEVELOPMENT') {
  api.set('json spaces', 2);
}

api.use(cors());
api.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  next();
})

api.disable('x-powered-by');
api.set('etag', false);

api.use(bodyParser.urlencoded({ 
  extended: true 
}));
api.use(express.json());
api.use(unflattenQueryString);

const user = require('./routes/user.routes');

api.use(user);

api.use(exceptionHandler);

module.exports = api;
