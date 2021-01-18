const _ = require('lodash');
const wrap = require('async-middleware').wrap;

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
