const wrap = require('async-middleware').wrap;
const mongoose = require('mongoose');

function _flatten(o, skipTrace = []) {
  let result = {};

  function _recursive(o, path) {
    for (const [key, value] of Object.entries(o)) {
      
      let currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null && !skipTrace.some(fn => fn(value))) {
        _recursive(value, currentPath); 
      }
      else {
        result[currentPath] = value;
      }
    }
  }

  _recursive(o, null);

  return result;
}

exports.updateDocument = function (document, data) {
  
  const skip = [Array.isArray, v => v instanceof ObjectId || v instanceof mongoose.Model];

  for (const [key, value] of Object.entries(_flatten(data, skip))) {
    document.set(key, value);
  }

  return document;
}

exports.applyRoutes = function (router, routes) {
  for (let [method, route, ...middleware] of routes) {

    method = method.toLowerCase();
    middleware = middleware.map(m => wrap(m));
    
    router[method](route, ...middleware);
  }

  return router;
}
