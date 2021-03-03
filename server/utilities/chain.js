function concat(...promises) {
  return promises.reduce((p1, p2) => p1.then(v1 => p2.then(v2 => v1.concat(v2))), Promise.resolve([]));
}

module.exports = function (target, next) {

  return new Proxy(target, {
    apply: function (target, _this, args) {

      let _context = { context: {} };
      let _chain = Promise.resolve(target.call(_context, ...args));

      const middleware = async function (req, res, next) {

        const chain = [...[].concat(await _chain)];
        const context = { ... _context };
        const func = chain.shift();
    
        await func.call(context, req, res, async error => {
          try {
            if (error) return next(error);
            const _next = chain.shift();
          
            if (!_next) return next();
            return await _next.call(context, req, res, next);
            
          } catch(e) {
            return next(e);
          }
        });
      }

      for (const [name, fn] of Object.entries(next)) {
        middleware[name] = function (...args) {
          _chain = concat(_chain, Promise.resolve(fn.call(_context, ...args)));
          _chain.catch(error => { throw error; });
          return this;
        }
      } 

      return middleware;
    }
  });
}
