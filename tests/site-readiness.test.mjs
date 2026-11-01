import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import * as query from '../src/lib/query.mjs';
import {sameOrigin} from '../src/lib/request-origin.mjs';
const require=createRequire(import.meta.url);
const compile=path=>ts.transpileModule(readFileSync(new URL(path,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
test('confirmed missing detail is 404 while upstream failure remains recoverable',async()=>{
 let mode=404;
 const exports={};
 vm.runInNewContext(compile('../src/lib/api.ts'),{exports,require:name=>{
  if(name==='server-only')return {};
  if(name==='next/navigation')return {notFound:()=>{throw Object.assign(new Error('not found'),{code:'NOT_FOUND'});}};
  if(name==='@/lib/query.mjs')return query;
  return require(name);
 },process:{env:{API_INTERNAL_URL:'https://api.test'}},URL,AbortSignal,fetch:async()=>{
  if(mode==='network')throw new Error('network offline');
  return {status:mode,ok:mode===200,json:async()=>({id:367})};
 }});
 for(const action of [()=>exports.getUniversity(999),()=>exports.unitAdmissions(999,0),()=>exports.universityAdmissions(999,0)]) await assert.rejects(action,{code:'NOT_FOUND'});
 assert.equal(await exports.searchAdmissions({}),null);
 mode=503;assert.equal(await exports.getUniversity(367),null);
 mode='network';assert.equal(await exports.getUniversity(367),null);
 mode=200;assert.equal((await exports.getUniversity(367)).id,367);
});
test('readiness includes voting only when enabled and never exposes private configuration',async()=>{
 const env={API_INTERNAL_URL:'http://read-private',VS_API_INTERNAL_URL:'http://vote-private',VS_FRONTEND_ENABLED:'true'};
 let votingUp=true;const calls=[];const exports={};
 vm.runInNewContext(compile('../src/app/api/health/route.ts'),{exports,require,process:{env},URL,AbortSignal,fetch:async(url)=>{
  calls.push(url.hostname);const up=url.hostname==='read-private'||votingUp;return {ok:up,json:async()=>({status:up?'UP':'DOWN'})};
 }});
 assert.equal((await exports.GET()).status,200);assert.deepEqual(calls.sort(),['read-private','vote-private']);
 votingUp=false;const failed=await exports.GET();assert.equal(failed.status,503);assert.deepEqual(await failed.json(),{status:'DOWN'});
 env.VS_FRONTEND_ENABLED='false';calls.length=0;assert.equal((await exports.GET()).status,200);assert.deepEqual(calls,['read-private']);
 env.API_INTERNAL_URL='';assert.equal((await exports.GET()).status,503);
});
test('Railway external HTTPS origin is checked against Host rather than internal HTTP URL',()=>{
 assert.equal(sameOrigin('https://frontend.test','frontend.test'),true);
 for(const value of ['https://frontend.test.attacker.test','https://attacker.test','http://frontend.test',null]) assert.equal(sameOrigin(value,'frontend.test'),false);
 assert.equal(sameOrigin('http://localhost:3000','localhost:3000',true),true);
});
