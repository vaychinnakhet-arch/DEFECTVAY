import { DefectRecord } from './types';

export const INITIAL_DEFECTS: DefectRecord[] = [
  // Rooftop
  { id: '1', category: 'ดาดฟ้า', location: 'Rooftop (ดาดฟ้า)', totalDefects: 10, fixedDefects: 10, status: 'Completed' },
  
  // Hallway
  { id: '2', category: 'โถงทางเดิน', location: 'Floor 2', totalDefects: 16, fixedDefects: 16, status: 'Completed' },
  { id: '3', category: 'โถงทางเดิน', location: 'Floor 3', totalDefects: 23, fixedDefects: 0, status: 'Fixed (Wait CM)' },
  { id: '4', category: 'โถงทางเดิน', location: 'Floor 4', totalDefects: 23, fixedDefects: 0, status: 'Pending', targetDate: '10 ก.พ.' },
  { id: '5', category: 'โถงทางเดิน', location: 'Floor 5', totalDefects: 39, fixedDefects: 0, status: 'Pending', targetDate: '14 ก.พ.' },
  { id: '6', category: 'โถงทางเดิน', location: 'Floor 6', totalDefects: 39, fixedDefects: 0, status: 'Pending', targetDate: '19 ก.พ.' },
  { id: '7', category: 'โถงทางเดิน', location: 'Floor 7', totalDefects: 32, fixedDefects: 0, status: 'Pending', targetDate: '23 ก.พ.' },
  { id: '8', category: 'โถงทางเดิน', location: 'Floor 8', totalDefects: 9, fixedDefects: 0, status: 'Pending', targetDate: '28 ก.พ.' },

  // Garbage Rooms per floor (Moved here)
  { id: '19', category: 'ห้องขยะประจำชั้น', location: 'Floor 2', totalDefects: 0, fixedDefects: 0, status: 'No Defect' },
  { id: '20', category: 'ห้องขยะประจำชั้น', location: 'Floor 3', totalDefects: 0, fixedDefects: 0, status: 'No Defect' },
  { id: '21', category: 'ห้องขยะประจำชั้น', location: 'Floor 4', totalDefects: 0, fixedDefects: 0, status: 'Not Checked', note: 'System storage', targetDate: '10 ก.พ.' },
  { id: '22', category: 'ห้องขยะประจำชั้น', location: 'Floor 5', totalDefects: 7, fixedDefects: 0, status: 'Pending', targetDate: '14 ก.พ.' },
  { id: '23', category: 'ห้องขยะประจำชั้น', location: 'Floor 6', totalDefects: 8, fixedDefects: 0, status: 'Pending', targetDate: '19 ก.พ.' },
  { id: '24', category: 'ห้องขยะประจำชั้น', location: 'Floor 7', totalDefects: 9, fixedDefects: 0, status: 'Pending', targetDate: '23 ก.พ.' },
  { id: '25', category: 'ห้องขยะประจำชั้น', location: 'Floor 8', totalDefects: 9, fixedDefects: 0, status: 'Pending', targetDate: '28 ก.พ.' },

  // Stairs
  { id: '9', category: 'บันได', location: 'Stairs ST-1', totalDefects: 43, fixedDefects: 0, status: 'Fixed (Wait CM)' },
  { id: '10', category: 'บันได', location: 'Stairs ST-2', totalDefects: 32, fixedDefects: 0, status: 'Pending', targetDate: '6 ก.พ.' },

  // Rooms
  { id: '11', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Security Room (ห้องรปภ.)', totalDefects: 4, fixedDefects: 0, status: 'Pending', targetDate: '6 ก.พ.' },
  { id: '12', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'MDB Room', totalDefects: 9, fixedDefects: 0, status: 'Pending', targetDate: '6 ก.พ.' },
  { id: '13', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Juristic Room (นิติ)', totalDefects: 17, fixedDefects: 17, status: 'Fixed (Wait CM)', note: 'Completed, Waiting CM' },
  { id: '14', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Laundry Room (ซักรีด)', totalDefects: 10, fixedDefects: 10, status: 'Fixed (Wait CM)', note: 'Completed, Waiting CM' },
  { id: '15', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Pump Room Floor 1', totalDefects: 9, fixedDefects: 0, status: 'Pending', targetDate: '10 ก.พ.' },
  { id: '16', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Security Toilet', totalDefects: 5, fixedDefects: 0, status: 'Pending', targetDate: '10 ก.พ.' },
  { id: '17', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Garbage Room (Main)', totalDefects: 19, fixedDefects: 0, status: 'Pending', targetDate: '16 ก.พ.' },
  { id: '18', category: 'ห้องเครื่อง/ห้องส่วนกลาง', location: 'Rooftop Pump Room', totalDefects: 3, fixedDefects: 0, status: 'Pending', targetDate: '13 ก.พ.' },

  // Facade
  { id: '26', category: 'รูปด้านอาคาร', location: 'Building Facade (รูปด้านอาคาร)', totalDefects: 19, fixedDefects: 17, status: 'Pending', targetDate: '6 ก.พ.' },
];

export const STATUS_COLORS: Record<string, string> = {
  'Completed': 'bg-green-100 text-green-800 border-green-200',
  'Pending': 'bg-red-100 text-red-800 border-red-200',
  'Fixed (Wait CM)': 'bg-amber-100 text-amber-800 border-amber-200',
  'No Defect': 'bg-blue-100 text-blue-800 border-blue-200',
  'Not Checked': 'bg-gray-100 text-gray-800 border-gray-200',
};