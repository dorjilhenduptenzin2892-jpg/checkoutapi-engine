const http = require('http');
const handler = require('./api/index');

const PORT = Number(process.env.PORT || 3001);
const HOST = process.env.HOST || '127.0.0.1';

const server = http.createServer((req, res) => {
  Promise.resolve(handler(req, res)).catch((err) => {
    console.error('[local-dev-server] unhandled error:', err);
    res.statusCode = 500;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end(err?.stack || err?.message || 'Server error');
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Cardzone backend local server running at http://${HOST}:${PORT}`);
});
