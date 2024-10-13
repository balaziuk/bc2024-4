const http = require('http');
const { Command } =  require('commander');
const fs =  require('fs').promises;

const program = new Command();
program 
.requiredOption('-h, --host <host>', 'serverhost')
.requiredOption('-p, --port <port>', 'server port')
.requiredOption('-c, --cache <cache>', 'cache directory');

program.parse(process.argv);
const options =  program.opts();
const host = options.host;
const port =  options.port;
const cache =  options.cache;

const server =  http.createServer(async(req, res) => {
res.end('this proxy server is working ;)')
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`)
});




