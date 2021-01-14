const config = require('./config');
const api = require('./api');
const HttpServer = require('./http-server');

const port = config.server.LISTEN_PORT;

const server = new HttpServer(api);
server.listen(port);
