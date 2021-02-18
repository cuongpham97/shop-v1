const database = require('~database');
const subscribers = require('~subscribers');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const config = require('~config');
const { unflatten } = require('~middleware/flat-query');
const { exceptionHandler } = require('~exceptions');

function createApp() {

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
  const customer = require('~routes/customer.routes');
  const admin = require('~routes/admin.routes');
  const auth = require('~routes/auth.routes');
  const role = require('~routes/role.routes');
  const image = require('~routes/image.routes');
  const product = require('~routes/product.routes');
  const category = require('~routes/category.routes');
  const permission = require('~routes/permission.routes');
  
  api.use(customer);
  api.use(admin);
  api.use(auth);
  api.use(role);
  api.use(image);
  api.use(product);
  api.use(category);
  api.use(permission);
  
  api.use('*', () => { 
    throw new NotFoundException({ message: 'Request does not match any route' });
  });
  
  api.use(exceptionHandler);

  return api;
}

exports.init = async function () {

  await database.init();
  await subscribers.init();

  return createApp();
}
