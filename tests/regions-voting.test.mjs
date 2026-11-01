import test from 'node:test';
import assert from 'node:assert/strict';
import { regionOptions } from '../src/lib/regions.mjs';
import { legacyPath } from '../src/lib/site-policy.mjs';
test('every stored region remains selectable including Jeonnam and less common regions',()=>{
 const values=['전남광주특별광역시','충청북도','경상북도','울산광역시','세종특별자치시','전북특별자치도','새 지역'];
 const options=regionOptions([...values,values[0],'']);
 assert.deepEqual(options.map(x=>x[0]),values);
 assert.equal(options[0][1],'전남·광주');
});
test('native voting page never falls through to the old domain bridge',()=>{
 assert.equal(legacyPath('/vs/'),false);
 assert.equal(legacyPath('/vs/overall/'),false);
 assert.equal(legacyPath('/vs/overall/submit/'),true);
});
