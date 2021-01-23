
function MiddlewareChain(chain) {
  this.chain = chain;
  return this.createMiddleware();
}

MiddlewareChain.prototype.fnChain = function (expect) {
  
  const prototype = {};

  for (const [name, fn] of Object.entries(this.chain)) {
    prototype[name] = function (...args) {

      expect.push(fn(...args));
      return this;
    }
  }

  return prototype;
}

MiddlewareChain.prototype.createMiddleware = function () {

  const expect = [];

  const middleware = async function (req, res, next) {

    const _expect = [...expect];
    const func = _expect.shift();

    return new Promise(function (resolve) {

      func(req, res, function nextFn(error) {
        if (error) return next(error);

        const _next = _expect.shift();
        return _next ? _next(req, res, next) : next();
      });

      return resolve();
    })
    .catch(error => next(error));
  }

  return Object.assign(middleware, this.fnChain(expect));
}

module.exports = function (chain) {

  return new Proxy({}, {
    get: function (_target, property, _receiver) {

      const middleware = new MiddlewareChain(chain);
      return middleware[property].bind(middleware);
    }
  });
}
