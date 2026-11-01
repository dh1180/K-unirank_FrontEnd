import test from 'node:test';
import assert from 'node:assert/strict';
import {summaryMetrics,publicMetricValid} from '../src/lib/admission-metrics.mjs';
const metric=(code,value=3,unit='등급')=>({code,value,unit});
test('50 and 70 grade cuts take precedence over converted scores everywhere',()=>{
 const row={phase:'SUSI',metrics:[metric('CONVERTED_SCORE_70_CUT',991,'점'),metric('STUDENT_GRADE_70_CUT'),metric('STUDENT_GRADE_50_CUT',2.7)]};
 assert.deepEqual(summaryMetrics(row).map(m=>m.code),['STUDENT_GRADE_50_CUT','STUDENT_GRADE_70_CUT']);
 row.metrics.pop();assert.deepEqual(summaryMetrics(row).map(m=>m.code),['STUDENT_GRADE_70_CUT']);
});
test('percentile pair first, converted pair used only when comparable cuts are unavailable',()=>{
 const row={phase:'JEONGSI',metrics:[metric('CSAT_CONVERTED_SCORE_50_CUT',700,'점'),metric('CSAT_CONVERTED_SCORE_70_CUT',680,'점'),metric('CSAT_PERCENTILE_MEAN_50_CUT',92,'백분위'),metric('CSAT_PERCENTILE_MEAN_70_CUT',90,'백분위')]};
 assert.deepEqual(summaryMetrics(row).map(m=>m.value),[92,90]);
 row.metrics.splice(2);assert.deepEqual(summaryMetrics(row).map(m=>m.value),[700,680]);
});
test('quarantine suspicious mean sentinel and impossible values while retaining real high scores',()=>{
 for(const value of [99.99,99.989,1,0,-1,101]) assert.equal(publicMetricValid(metric('CSAT_PERCENTILE_MEAN_70_CUT',value,'백분위')),false);
 for(const value of [99.9,100]) assert.equal(publicMetricValid(metric('CSAT_PERCENTILE_MEAN_70_CUT',value,'백분위')),true);
 assert.equal(publicMetricValid(metric('CSAT_KOREAN_PERCENTILE_70_CUT',100,'백분위')),true);
 assert.equal(publicMetricValid(metric('STUDENT_GRADE_70_CUT',99.99)),false);
 assert.equal(publicMetricValid(metric('CONVERTED_SCORE_70_CUT',1003,'점')),true);
});
