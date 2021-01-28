
function MiddlewareChain(chain) {
  this.chain = chain;
  return this.createMiddleware();
}

MiddlewareChain.prototype.fnChain = function (context) {
  
  const prototype = {};

  for (const [name, fn] of Object.entries(this.chain)) {
    prototype[name] = function (...args) {

      context.chain.push(fn.call(context, ...args));
      return this;
    }
  }

  return prototype;
}

MiddlewareChain.prototype.createMiddleware = function () {

  const context = { chain: [], context: {} }

  const middleware = async function (req, res, next) {

    const _context = { 
      chain: [...context.chain], 
      context: { ...context.context }
    };

    const func = _context.chain.shift();

    return new Promise(function (resolve) {

      func.call(_context, req, res, function nextFn(error) {
        if (error) return next(error);

        const _next = _context.chain.shift();
        return _next ? _next.call(_context, req, res, next) : next();
      });

      return resolve();
    })
    .catch(error => next(error));
  }

  return Object.assign(middleware, this.fnChain(context));
}

module.exports = function (chain) {

  return new Proxy({}, {
    get: function (_target, property, _receiver) {

      const middleware = new MiddlewareChain(chain);
      return middleware[property].bind(middleware);
    }
  });
}
