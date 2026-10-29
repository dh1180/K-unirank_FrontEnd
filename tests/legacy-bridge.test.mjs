import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as policy from '../src/lib/site-policy.mjs';
const require=createRequire(import.meta.url);
const {NextRequest}=require('next/server');

test('legacy bridge preserves CSRF origin, body, Host and independent session cookies', async()=>{
 const received=[];
 const server=http.createServer((req,res)=>{let body='';req.on('data',b=>body+=b);req.on('end',()=>{
  received.push({headers:req.headers,body,path:req.url});
  if(req.url.startsWith('/static/')){res.writeHead(200,{'Content-Type':'text/css','Cache-Control':'public,max-age=31536000,immutable'});res.end('body{color:black}');return;}
  res.writeHead(302,{'Location':'/accounts/me/','Set-Cookie':['sessionid=rotated; HttpOnly; Secure; SameSite=Lax','csrftoken=token; Secure; SameSite=Lax']});res.end('');
 });});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try{
  const source=readFileSync(new URL('../src/app/legacy-bridge/[...path]/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  vm.runInNewContext(code,{exports,require:name=>name==='@/lib/site-policy.mjs'?policy:require(name),process:{env:{...process.env,SITE_MODE:'auto',LEGACY_INTERNAL_URL:`http://127.0.0.1:${server.address().port}`}},Buffer,ReadableStream,Headers,URL});
  const request=new NextRequest('http://localhost/legacy-bridge/accounts/login/',{method:'POST',headers:{host:'k-unirank.com',origin:'https://k-unirank.com',cookie:'sessionid=original','content-type':'application/x-www-form-urlencoded'},body:'username=sample&csrfmiddlewaretoken=token'});
  const response=await exports.POST(request,{params:Promise.resolve({path:['accounts','login']})});
  assert.equal(response.status,302); assert.equal(response.headers.get('location'),'/accounts/me/');
  assert.equal(response.headers.getSetCookie().length,2);
  assert.ok(response.headers.getSetCookie()[0].includes('HttpOnly; Secure; SameSite=Lax'));
  assert.equal(received[0].headers.host,'k-unirank.com'); assert.equal(received[0].headers.origin,'https://k-unirank.com');
  assert.equal(received[0].headers.cookie,'sessionid=original'); assert.equal(received[0].headers['x-forwarded-proto'],'https');
  assert.equal(received[0].body,'username=sample&csrfmiddlewaretoken=token');
  assert.equal(await response.text(),'');
  const asset=await exports.GET(new NextRequest('http://localhost/legacy-bridge/static/css/app.css',{headers:{host:'k-unirank.com'}}),{params:Promise.resolve({path:['static','css','app.css']})});
  assert.equal(asset.status,200); assert.equal(asset.headers.get('cache-control'),'public,max-age=31536000,immutable');assert.equal(await asset.text(),'body{color:black}');
  const denied=await exports.GET(new NextRequest('http://localhost/legacy-bridge/accounts/login/',{headers:{host:'preview.test'}}),{params:Promise.resolve({path:['accounts','login']})});
  assert.equal(denied.status,404);assert.equal(received.length,2);
 }finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
