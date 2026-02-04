export type DefectStatus = 'Completed' | 'Pending' | 'Fixed (Wait CM)' | 'No Defect' | 'Not Checked';

export interface DefectRecord {
  id: string;
  category: string;
  location: string;
  totalDefects: number;
  fixedDefects: number;
  status: DefectStatus;
  targetDate?: string;
  note?: string;
}

export interface SummaryStats {
  total: number;
  fixed: number;
  remaining: number;
  percentage: number;
}