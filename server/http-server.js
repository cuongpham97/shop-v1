const http = require('http');
const logger = require('./utilities/logger');

function HttpServer(app) {
  this.server = http.createServer(app);
}

HttpServer.prototype.constructor = HttpServer;

HttpServer.prototype.normalizePort = function (val) {
  const port = parseInt(val, 10);

  switch (true) {
    case isNaN(port):
      return val;

    case port >= 0:
      return port;

    default:
      return false;
  }
} 

HttpServer.prototype.listen = function (port) {

  this.port = this.normalizePort(port);
  const server = this.server;

  server.on('error', function (error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
  
    const bind = (typeof port === 'string' ? 'Pipe ' : 'Port ') + port;
  
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
    const addr = server.address();
    const bind = typeof addr === 'string'
      ? 'pipe: ' + addr
      : 'port: ' + addr.port;
  
    logger.info('Listening on ' + bind);
  });

  return server.listen(port);
}

module.exports = HttpServer;
