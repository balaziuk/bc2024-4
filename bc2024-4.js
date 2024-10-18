const http = require('http');
const { Command } =  require('commander');
const fs =  require('fs').promises;
const path = require('path');
const superagent =  require('superagent');


const program = new Command();
program 
.requiredOption('-h, --host <host>', 'server host')
.requiredOption('-p, --port <port>', 'server port')
.requiredOption('-c, --cache <cache>', 'cache directory');

program.parse(process.argv);
const options =  program.opts();
const host = options.host;
const port =  options.port;
const cache =  options.cache;

const getCachedFilePath = (statusCode) => path.join(cache, `${statusCode}.jpg`);

const getCatimg = async (statusCode) => {
    const url = `https://http.cat/${statusCode}`;
    try {
        const response = await superagent.get(url);
        return  response.body;
    } catch (error) {
        throw new Error ('Image not found')
    }
}
const server = http.createServer(async (req, res) => {
    const statusCode = req.url.slice(1); 
    const filePath = getCachedFilePath(statusCode);

    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Welcome to the proxy server');
        return;
    }

    if (req.method === 'PUT') {
        let body = [];
    
        req.on('data', (chunk) => {
            body.push(chunk);  
        });
    
        req.on('end', async () => {
            body = Buffer.concat(body);  
    
            try {
                await fs.writeFile(filePath, body);
                res.writeHead(201, { 'Content-Type': 'text/plain' });
                res.end('Created');  
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Internal Server Error');
            }
        });

    } else if (req.method === 'GET') {
        try {
          const image = await fs.readFile(filePath);
          res.writeHead(200, { 'Content-Type': 'image/jpeg' });
          res.end(image);
        } catch (err) {
        try {
            const imageBuffer =  await getCatimg(statusCode);
            await fs.writeFile(filePath, imageBuffer);
            res.writeHead(200, { 'Content-Type': 'image/jpeg' });
            res.end(imageBuffer);
        }   catch (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`Image not found for status code ${statusCode}.`);
        }
        }
    } else if (req.method === 'DELETE') {
        try{
            await fs.unlink(filePath);
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Deleted');
        } catch (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
        }
    } else {
        res.writeHead(405, { 'Content-Type': 'text/plain' });
        res.end('Method Not Allowed');
    }
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
