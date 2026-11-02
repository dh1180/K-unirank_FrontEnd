import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import * as originPolicy from '../src/lib/request-origin.mjs';
const require = createRequire(import.meta.url);
const {NextRequest} = require('next/server');

test('AI BFF bounds actual bodies, throttles calls and keeps credentials and cookies private', async () => {
  const exports = {}, calls = [];
  const env = {NODE_ENV:'production',AI_FRONTEND_ENABLED:'true',API_INTERNAL_URL:'http://private',AI_FRONTEND_TOKEN:'test-private-token-at-least-thirty-two-characters'};
  const code = ts.transpileModule(readFileSync(new URL('../src/app/api/ai/questions/route.ts',import.meta.url),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  vm.runInNewContext(code, {exports, require:name=>name==='@/lib/request-origin.mjs'?originPolicy:require(name),process:{env},Buffer,URL,AbortSignal,fetch:async (url,options)=>{
    calls.push({url,options}); return new Response('{"filters":{}}',{headers:{'Content-Type':'application/json'}});
  }});
  const request = (body,origin='https://frontend.test') => new NextRequest('http://localhost/api/ai/questions', {method:'POST',headers:{host:'frontend.test',origin,'content-type':'application/json','x-real-ip':'127.0.0.1',cookie:'sessionid=private'},body});
  assert.equal((await exports.POST(request('{}','https://attacker.test'))).status,403);
  assert.equal((await exports.POST(request('x'.repeat(2049)))).status,413);
  assert.equal((await exports.POST(request('{invalid'))).status,400);
  assert.equal((await exports.POST(request('{"question":"짧음"}'))).status,422);
  const body=JSON.stringify({question:'내신 3등급 서울 간호학과 찾아줘'});
  assert.equal((await exports.POST(request(body))).status,200);
  assert.equal((await exports.POST(request(body))).status,200);
  assert.equal((await exports.POST(request(body))).status,429);
  assert.equal(calls.length,2);
  assert.equal(calls[0].options.headers.Cookie,undefined);
  assert.equal(calls[0].options.headers['X-Frontend-Service-Token'],env.AI_FRONTEND_TOKEN);
  assert.equal(JSON.parse(calls[0].options.body).limit,5);
  env.AI_FRONTEND_ENABLED='false';
  assert.equal((await exports.POST(request(body))).status,503);
});

