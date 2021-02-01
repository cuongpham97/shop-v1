const config = require('./config');
const api = require('./api');
const HttpServer = require('./http-server');

(async function () {

  const port = config.server.LISTEN_PORT;
  const server = new HttpServer(await api.init());

  server.listen(port);

})();
