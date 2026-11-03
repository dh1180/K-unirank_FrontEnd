import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
const require=createRequire(import.meta.url),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
test('AI page renders the input only after live membership verification',async()=>{
  let status=401;const exports={};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/app/ai/page.tsx',import.meta.url),'utf8'),{fileName:'page.tsx',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText,{exports,process:{env:{AI_FRONTEND_ENABLED:'true'}},require:name=>{
    if(name==='next/link')return {__esModule:true,default:({children,href})=>React.createElement('a',{href},children)};
    if(name==='@/components/AiAdmissionsClient')return {__esModule:true,default:()=>React.createElement('textarea',{'aria-label':'AI 질문'})};
    if(name==='@/lib/member-server')return {memberRead:async()=>new Response(null,{status})};
    return require(name);
  }});
  let html=renderToStaticMarkup(await exports.default());
  assert.match(html,/로그인하고 AI 입결/);assert.doesNotMatch(html,/<textarea/);assert.match(html,/next=%2Fai%2F/);
  status=503;html=renderToStaticMarkup(await exports.default());assert.doesNotMatch(html,/<textarea/);
  status=200;html=renderToStaticMarkup(await exports.default());assert.match(html,/<textarea/);
});
