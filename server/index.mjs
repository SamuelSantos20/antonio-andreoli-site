import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { googleReviewsHandler } from './google-reviews.mjs';

const root=fileURLToPath(new URL('../',import.meta.url));
const envFile=resolve(root,'.env.local');
if(existsSync(envFile))loadEnvFile(envFile);
const dist=resolve(root,'dist');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon'};
const server=createServer(async(req,res)=>{
 try {
  if(await googleReviewsHandler(req,res))return;
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end();return;}
  const pathname=decodeURIComponent(new URL(req.url||'/','http://localhost').pathname);
  let path=resolve(dist,'.'+pathname);
  if(path!==dist&&!path.startsWith(dist+sep)){res.writeHead(403);res.end();return;}
  if(path===dist||!extname(path))path=resolve(dist,'index.html');
  if(!existsSync(path)||!statSync(path).isFile()){res.writeHead(404);res.end('Not found');return;}
  res.setHeader('Content-Type',mime[extname(path)]||'application/octet-stream');
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control',extname(path)==='.html'?'no-cache':'public, max-age=3600');
  if(req.method==='HEAD'){res.end();return;}
  const stream=createReadStream(path);
  stream.on('error',()=>{if(!res.headersSent)res.writeHead(500);res.end();});
  stream.pipe(res);
 }catch{if(!res.headersSent)res.writeHead(500);res.end();}
});
const port=Number(process.env.PORT)||3002;
server.listen(port,process.env.HOST||'127.0.0.1',()=>console.log('Site disponível em http://'+(process.env.HOST||'127.0.0.1')+':'+port));
