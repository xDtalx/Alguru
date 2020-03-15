const app = require('./engine/app');
const debug = require('debug')('node-angular');
const http = require('http');
const port = normalizePort(process.env.PORT || 3000);
const server = http.createServer(app);

app.set('port', port);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);

function normalizePort(val)
{
  const radix = 10;
  const port = parseInt(val, radix);

  if(isNaN(port))
  {
    // named pipe
    return val;
  }

  return port >= 0 ? port : null;
}

function onError(error)
{
  if(error.syscall !== 'listen')
  {
    throw error;
  }

  const addr = server.address;
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + port;

  switch(error.code)
  {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
    default:
      throw error;
  }
}

function onListening()
{
  const addr = server.address();
  const bind = typeof port === "string" ? "pipe " + port : "port " + port;
  debug("Listening on " + bind);
};
