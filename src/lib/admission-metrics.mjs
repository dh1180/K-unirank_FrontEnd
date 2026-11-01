export function publicMetricValid({code,unit,value}) {
  if (!Number.isFinite(value) || code.includes('REFERENCE_MEAN')) return false;
  if ((code.includes('PERCENTILE') || unit==='백분위') && (value<=0 || value>100)) return false;
  if ((code.includes('GRADE') || unit==='등급') && !code.includes('STDDEV') && (value<1 || value>9)) return false;
  if (code.startsWith('CSAT_PERCENTILE_MEAN') && (value<=1 || (value>=99.985 && value<99.995))) return false;
  return true;
}
export function summaryMetrics(row) {
  const metrics=row.metrics.filter(publicMetricValid);
  const families=row.phase==='JEONGSI'
    ? ['CSAT_PERCENTILE_MEAN','CSAT_PERCENTILE','CSAT_GRADE','CSAT_CONVERTED_SCORE','CSAT_SCORE']
    : ['STUDENT_GRADE','CONVERTED_SCORE','ESSAY_SCORE'];
  for (const family of families) {
    const pair=[50,70].flatMap(cut=>metrics.filter(m=>m.code===`${family}_${cut}_CUT`));
    if (pair.length) return pair;
  }
  const fallback=row.phase==='JEONGSI'?['COLLEGE_CSAT_AVERAGE','COLLEGE_CSAT_MINIMUM']:['COLLEGE_STUDENT_AVERAGE','COLLEGE_STUDENT_MINIMUM'];
  const chosen=fallback.flatMap(code=>metrics.filter(m=>m.code===code));
  return (chosen.length?chosen:metrics).slice(0,2);
}
