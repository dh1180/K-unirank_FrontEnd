import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import ts from 'typescript';
import {legacyTarget} from '../src/lib/legacy-target.mjs';
const require=createRequire(import.meta.url);
test('retired Django bridge performs no network requests and native targets never loop',async()=>{
 const exports={};
 const source=readFileSync(new URL('../src/app/legacy-bridge/[...path]/route.ts',import.meta.url),'utf8');
 vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,{exports,require,fetch:()=>{throw new Error('Django must not be contacted');}});
 assert.equal((await exports.GET()).status,404);
 assert.equal((await exports.POST()).status,404);
 for(const [old,target] of [['/accounts/signup/','/register/'],['/accounts/me/vs-history/','/mypage/history/'],['/accounts/me/university-compare/','/mypage/compare/'],['/admissions/results/','/']]){
  assert.equal(legacyTarget(old),target);assert.equal(legacyTarget(target),null);
 }
 assert.equal(legacyTarget('//attacker.test/'),null);
 assert.equal(legacyTarget('/support/'),null);
});
