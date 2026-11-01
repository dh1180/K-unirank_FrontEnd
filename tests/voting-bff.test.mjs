import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const {NextRequest}=require('next/server');
test('voting BFF forwards only voting cookie and private trust, rejects foreign origin and oversized body',async()=>{
 const received=[];
 const server=http.createServer((req,res)=>{let body='';req.on('data',b=>body+=b);req.on('end',()=>{received.push({headers:req.headers,body,path:req.url});res.writeHead(200,{'Content-Type':'application/json','Set-Cookie':'kunirank_vs=abcdefghijklmnopqrstuvwxyz123456; HttpOnly; Secure; SameSite=Lax; Path=/'});res.end('{}');});});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const source=readFileSync(new URL('../src/app/api/vs/[action]/route.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};
  const token='isolated-test-token-at-least-thirty-two-characters';
  vm.runInNewContext(code,{exports,require,process:{env:{VS_FRONTEND_ENABLED:'true',VS_API_INTERNAL_URL:`http://127.0.0.1:${server.address().port}`,VS_FRONTEND_TOKEN:token}},Buffer,fetch,AbortSignal,URL});
  const context={params:Promise.resolve({action:'vote'})};
  const request=(origin,body='{}')=>new NextRequest('http://localhost:3000/api/vs/vote/',{method:'POST',headers:{host:'frontend.test',origin,'content-type':'application/json',cookie:'sessionid=private-account; kunirank_vs=abcdefghijklmnopqrstuvwxyz123456','x-real-ip':'127.0.0.1'},body});
  const response=await exports.POST(request('https://frontend.test'),context);
  assert.equal(response.status,200);
  assert.match(response.headers.get('set-cookie'),/HttpOnly; Secure; SameSite=Lax/);
  assert.equal(received[0].headers.cookie,'kunirank_vs=abcdefghijklmnopqrstuvwxyz123456');
  assert.equal(received[0].headers.origin,'https://frontend.test');
  assert.equal(received[0].headers['x-vs-frontend-token'],token);
  assert.match(received[0].headers['x-vs-network-key'],/^[a-f0-9]{64}$/);
  assert.equal((await exports.POST(request('https://attacker.test'),context)).status,403);
  assert.equal((await exports.POST(request('https://frontend.test','x'.repeat(2049)),context)).status,413);
  assert.equal(received.length,1);
 }finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});

test('next pair keeps signature and cookie while optional references fail independently',async()=>{
 const server=http.createServer((req,res)=>{
  res.setHeader('Content-Type','application/json');
  if(req.url.endsWith('/next')) {res.setHeader('Set-Cookie','kunirank_vs=sample; HttpOnly; Secure');res.end(JSON.stringify({pair:[{id:1,name:'A'},{id:2,name:'B'}],challenge:'signed',voteCount:0}));}
  else if(req.url.includes('/1/admission-reference')) {assert.equal(req.headers['x-vs-frontend-token'],undefined);res.end(JSON.stringify({year:2026,cuts:[{label:'교과 등급',unit:'등급',value50:null,value70:3.25}]}));}
  else {res.statusCode=503;res.end('{}');}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  const code=ts.transpileModule(readFileSync(new URL('../src/app/api/vs/[action]/route.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const exports={};const base=`http://127.0.0.1:${server.address().port}`;
  vm.runInNewContext(code,{exports,require,process:{env:{VS_FRONTEND_ENABLED:'true',VS_API_INTERNAL_URL:base,API_INTERNAL_URL:base,VS_FRONTEND_TOKEN:'isolated-test-token-at-least-thirty-two-characters'}},Buffer,fetch,AbortSignal,URL});
  const response=await exports.GET(new NextRequest('https://frontend.test/api/vs/next/'),{params:Promise.resolve({action:'next'})});
  assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/HttpOnly/);
  const match=await response.json();assert.equal(match.challenge,'signed');
  assert.equal(match.pair[0].admissionReference.cuts[0].value70,3.25);
  assert.equal(match.pair[1].admissionReference,null);
 } finally {server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}
});
