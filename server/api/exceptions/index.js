const exceptions = require('./classes');
const exceptionHandler = require('./handler');

// Exports exception class to global
for (const [name, exception] of _.entries(exceptions)) {
  global[name] = exception;
}

module.exports = { ...exceptions, exceptionHandler };
