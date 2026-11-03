import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url);
const React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
const dashboard={};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/components/AdminDashboard.tsx',import.meta.url),'utf8'),{fileName:'dashboard.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports:dashboard,URLSearchParams,require:name=>name==='next/link'?{__esModule:true,default:({children,href})=>React.createElement('a',{href},children)}:require(name)});
test('admin page checks current server identity before fetching any operational data',async()=>{
  let identity=null;const calls=[];const exports={};
  const code=ts.transpileModule(readFileSync(new URL('../src/app/admin/page.tsx',import.meta.url),'utf8'),{fileName:'page.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
  vm.runInNewContext(code,{exports,URLSearchParams,require:name=>{
    if(name==='@/components/AdminDashboard')return dashboard;
    if(name==='@/lib/admin-server')return {adminServiceHealth:async()=>[{name:'조회 API',status:'UP'}]};
    if(name==='next/link')return {__esModule:true,default:({children,href})=>React.createElement('a',{href},children)};
    if(name==='@/lib/member-server')return {memberRead:async path=>{
      calls.push(path);return path.endsWith('/me')?new Response(JSON.stringify(identity),{status:identity?200:401}):new Response(JSON.stringify({operator:'test-admin',generatedAt:'2026-11-02T06:00:00Z',latestAdmissionYear:2026,stats:[{label:'전체 회원',value:31}],suspiciousPercentiles:1,shingyeongjuExcluded:2,votesToday:3,skipsToday:4}));
    }};
    return require(name);
  }});
  let html=renderToStaticMarkup(await exports.default());
  assert.match(html,/관리자 로그인/);assert.deepEqual(calls,['/api/v1/member/me']);
  identity={id:2,username:'ordinary',admin:false};calls.length=0;
  html=renderToStaticMarkup(await exports.default());
  assert.match(html,/관리자 권한이 필요/);assert.deepEqual(calls,['/api/v1/member/me']);
  assert.doesNotMatch(html,/전체 회원|최근 7일 대학 투표/);
  identity={id:1,username:'test-admin',admin:true};calls.length=0;
  html=renderToStaticMarkup(await exports.default());
  assert.match(html,/사이트 운영 현황/);assert.match(html,/최근 7일 대학 투표/);
  assert.deepEqual(calls,['/api/v1/member/me','/api/v1/admin/overview']);
});
