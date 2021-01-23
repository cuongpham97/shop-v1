const rules = {};

function register(rule) {
  const { name, expect, handler } = rule;

  switch (true) {
    case typeof name !== 'string':
      throw Error('Rule name must be a string');
    
    case typeof expect !== 'function': 
      throw Error('expect must be a function');

    case typeof handler !== 'function': 
      throw Error('handler must be a function');
  }

  rules[name] = { expect, handler };
}

function middlewareChain(handlerList) {
  const chain = {};

  for (const [ name, { expect, handler } ] of Object.entries(rules)) {

    chain[name] = function (...args) {

      const data = expect(...args);
      handlerList.push(handler.bind(this, data));

      return this;
    }
  }

  return chain;
}

function createMiddleware() {
  const handlerList = [];

  const middleware = async function (req, res, next) {
    try {
      for (const fn of handlerList) {
        await fn(req, res)
      }
      return next();

    } catch (error) {
      return next(error); 
    }
  }

  return Object.assign(middleware, middlewareChain(handlerList));
}

module.exports = new Proxy({}, { 
  get: function (_target, property, _receiver) {
    
    if (property === 'register') {
      return register;
    }

    const middleware = createMiddleware();
    return middleware[property].bind(middleware);
  }
});
