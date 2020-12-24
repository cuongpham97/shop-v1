const http = require('http');
const config = require('./config');
const logger = require('./utilities/logger');
const api = require('./api');

const server = http.createServer(api);
const port = normalizePort(config.server.LISTEN_PORT);

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}

server.on('error', function (error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;

  switch (error.code) {
    case 'EACCES':
      logger.error(bind + ' requires elevated privileges');
      process.exit(1);

    case 'EADDRINUSE':
      logger.error(bind + ' is already in use');
      process.exit(1);
    
    default:
      throw error;
  }
});

server.on('listening', function () {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe: ' + addr
    : 'port: ' + addr.port;

  logger.info('Listening on ' + bind);
});

server.listen(port);
