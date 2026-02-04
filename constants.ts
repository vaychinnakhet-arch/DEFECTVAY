import { DefectRecord } from './types';

export const INITIAL_DEFECTS: DefectRecord[] = [
  // Facade
  { id: '101', category: 'รูปด้านอาคาร', location: 'Building Facade (รูปด้านอาคาร)', totalDefects: 19, fixedDefects: 19, status: 'แก้ไขเรียบร้อย' },
  
  // Rooftop
  { id: '201', category: 'ดาดฟ้า', location: 'Rooftop (ดาดฟ้า)', totalDefects: 10, fixedDefects: 10, status: 'แก้ไขเรียบร้อย' },
  { id: '202', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Rooftop Pump Room', totalDefects: 3, fixedDefects: 3, status: 'แก้ไขเรียบร้อย' },

  // Corridor
  { id: '302', category: 'โถงทางเดิน', location: 'Floor 2', totalDefects: 16, fixedDefects: 16, status: 'แก้ไขเรียบร้อย' },
  { id: '303', category: 'โถงทางเดิน', location: 'Floor 3', totalDefects: 23, fixedDefects: 23, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', note: 'รอ CM ตัด' },
  { id: '304', category: 'โถงทางเดิน', location: 'Floor 4', totalDefects: 23, fixedDefects: 23, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', note: 'รอ CM ตัด' },
  { id: '305', category: 'โถงทางเดิน', location: 'Floor 5', totalDefects: 39, fixedDefects: 39, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '5/2/69', note: 'เก็บงานแล้วเสร็จ' },
  { id: '306', category: 'โถงทางเดิน', location: 'Floor 6', totalDefects: 39, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '1/3/69' },
  { id: '307', category: 'โถงทางเดิน', location: 'Floor 7', totalDefects: 32, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '1/3/69' },
  { id: '308', category: 'โถงทางเดิน', location: 'Floor 8', totalDefects: 9, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '26/2/69' },

  // Stairs
  { id: '401', category: 'บันได', location: 'Stairs ST-1', totalDefects: 43, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '10/2/69' },
  { id: '402', category: 'บันได', location: 'Stairs ST-2', totalDefects: 32, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '13/2/69' },

  // Common Rooms
  { id: '501', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'ลานจอดชั้น 1', totalDefects: 13, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '6/2/69', note: 'แล้วเสร็จ 6/2/69' },
  { id: '502', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Security Room (ห้องรปภ.)', totalDefects: 4, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '5/2/69', note: 'แก้ไขแล้วเสร็จ 5/2/69' },
  { id: '503', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'MDB Room', totalDefects: 9, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '7/2/69' },
  { id: '504', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Juristic Room (นิติ)', totalDefects: 17, fixedDefects: 17, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '4/2/69' },
  { id: '505', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Laundry Room (ซักรีด)', totalDefects: 10, fixedDefects: 10, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '4/2/69' },
  { id: '506', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Pump Room Floor 1', totalDefects: 9, fixedDefects: 9, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '4/2/69' },
  { id: '507', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Security Toilet (น้ำรปภ)', totalDefects: 5, fixedDefects: 5, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '4/2/69' },
  { id: '508', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Garbage Room (Main)', totalDefects: 19, fixedDefects: 0, status: 'รอดำเนินการ', targetDate: '19/2/69' },

  // Garbage Rooms per floor
  { id: '602', category: 'ห้องขยะประจำชั้น', location: 'Floor 2', totalDefects: 0, fixedDefects: 0, status: 'ไม่มี Defect' },
  { id: '603', category: 'ห้องขยะประจำชั้น', location: 'Floor 3', totalDefects: 0, fixedDefects: 0, status: 'ไม่มี Defect' },
  { id: '604', category: 'ห้องขยะประจำชั้น', location: 'Floor 4', totalDefects: 0, fixedDefects: 0, status: 'ยังไม่ตรวจ', targetDate: '5/2/69', note: 'เก็บของงานระบบ' },
  { id: '605', category: 'ห้องขยะประจำชั้น', location: 'Floor 5', totalDefects: 7, fixedDefects: 7, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '5/2/69' },
  { id: '606', category: 'ห้องขยะประจำชั้น', location: 'Floor 6', totalDefects: 8, fixedDefects: 8, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '5/2/69' },
  { id: '607', category: 'ห้องขยะประจำชั้น', location: 'Floor 7', totalDefects: 9, fixedDefects: 9, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '5/2/69' },
  { id: '608', category: 'ห้องขยะประจำชั้น', location: 'Floor 8', totalDefects: 9, fixedDefects: 9, status: 'แก้ไขเรียบร้อย รอนัดตรวจ', targetDate: '5/2/69' },

  // Electrical Rooms (New)
  { id: '702', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 2', totalDefects: 2, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '703', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 3', totalDefects: 2, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '704', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 4', totalDefects: 3, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '705', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 5', totalDefects: 2, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '706', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 6', totalDefects: 3, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '707', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 7', totalDefects: 3, fixedDefects: 0, status: 'รอดำเนินการ' },
  { id: '708', category: 'ห้องไฟฟ้าประจำชั้น', location: 'Floor 8', totalDefects: 3, fixedDefects: 0, status: 'รอดำเนินการ' },
];

export const STATUS_COLORS: Record<string, string> = {
  'แก้ไขเรียบร้อย': 'bg-green-100 text-green-800 border-green-200',
  'รอดำเนินการ': 'bg-red-100 text-red-800 border-red-200',
  'แก้ไขเรียบร้อย รอนัดตรวจ': 'bg-amber-100 text-amber-800 border-amber-200',
  'ไม่มี Defect': 'bg-blue-100 text-blue-800 border-blue-200',
  'ยังไม่ตรวจ': 'bg-gray-100 text-gray-800 border-gray-200',
};