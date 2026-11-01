import type { AdmissionMetric, AdmissionResult } from './types';
export declare function publicMetricValid(metric: AdmissionMetric): boolean;
export declare function summaryMetrics(row: Pick<AdmissionResult,'phase'|'metrics'>): AdmissionMetric[];
