const wrap = require('async-middleware').wrap;
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

function flatten(o, skipTrace = []) {
  let result = {};

  function recursive(o, path) {
    for (const [key, value] of Object.entries(o)) {
      
      let currentPath = path ? `${path}.${key}` : key;

      if (typeof value === 'object' && value !== null && !skipTrace.some(fn => fn(value))) {
        recursive(value, currentPath); 
      }
      else {
        result[currentPath] = value;
      }
    }
  }

  recursive(o, null);

  return result;
}

exports.updateDocument = function (document, data) {
  
  const skip = [Array.isArray, v => v instanceof ObjectId];

  for (const [key, value] of Object.entries(flatten(data, skip))) {
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

exports.deepMap = function map(o, fn, traceArray = false, traceEnum = false) {

  const keys = Object[traceEnum ? 'getOwnPropertyNames' : 'keys' ](o);

  for (const key of keys) {
    
    const action = fn({ key: key, value: o[key] });

    if (!action) continue;

    const newKey = action.key;
    const value = action.value;

    // Delete key
    if (!newKey) {
      delete o[key];
      continue;
    }

    o[newKey] = value;
 
    // Rename key
    if (newKey !== key) {
      delete o[key];
    }

    if (typeof o[newKey] === 'object' && o[newKey] !== null) {

      if (traceArray || !Array.isArray(o[newKey])) {
        map(o[newKey], fn, traceArray, traceEnum);
      } 
    }
  }
}
