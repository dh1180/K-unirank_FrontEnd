import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";
import ts from "typescript";
const require=createRequire(import.meta.url);
const React=require("react");
const {renderToStaticMarkup}=require("react-dom/server");
const exports={};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL("../src/components/AiAdmissionsClient.tsx",import.meta.url),"utf8"),{
  fileName:"AiAdmissionsClient.tsx",compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}
}).outputText,{exports,URL,require:name=>name==="next/link"?{__esModule:true,default:({children,...props})=>React.createElement("a",props,children)}:require(name)});
const row={resultId:1,universityName:"대학",recruitmentUnitName:"컴퓨터공학과",recruitmentUnitId:2,selectionCategory:"학생부교과",selectionName:"일반",sourceName:"대학 입학처",cut50:2.1,cut70:2.4,referenceCut:2.4,referenceBasis:"70% 컷"};
const render=(grade,url="https://official.ac.kr/source")=>renderToStaticMarkup(React.createElement(exports.AdmissionEvidenceResults,{
 data:{selectedYear:2026,totalCount:1,items:[row]},reply:{filters:{grade},evidence:[{resultId:1,sourceUrl:url,recruitmentCount:0,competitionRate:0,explanation:"공개 70% 컷 근거"}]}
}));
test("grade-free evidence shows both cuts, unknown counts and the official source without an invented gap",()=>{
 const html=render(null);
 assert.match(html,/50% 컷/);assert.match(html,/70% 컷/);assert.match(html,/2.10/);assert.match(html,/2.40/);
 assert.match(html,/모집인원 미공개/);assert.match(html,/경쟁률 미공개/);assert.match(html,/official.ac.kr/);
 assert.doesNotMatch(html,/내 등급|NaN|0명|0.00 : 1/);
});
test("grade comparison explains the numeric difference and rejects executable source URLs",()=>{
 const html=render(2.8,"javascript:alert(1)");
 assert.match(html,/0.40등급 차이/);assert.match(html,/이 결과를 보여준 이유/);assert.doesNotMatch(html,/javascript:|공식 원문/);
});
