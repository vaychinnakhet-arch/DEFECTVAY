export type DefectStatus = 'แก้ไขเรียบร้อย' | 'รอดำเนินการ' | 'แก้ไขเรียบร้อย รอนัดตรวจ' | 'ไม่มี Defect' | 'ยังไม่ตรวจ';

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