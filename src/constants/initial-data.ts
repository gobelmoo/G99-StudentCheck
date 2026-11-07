import { Student } from '@/types/attendance';

export const INITIAL_STUDENTS: Student[] = [
  { id: '66001', name: 'กมลชนก ใจดี', group: '1', status: 'present' },
  { id: '66002', name: 'ธนกร แสงทอง', group: '1', status: 'absent' },
  { id: '66003', name: 'ปวีณา สุขใจ', group: '1', status: 'late' },
  { id: '66004', name: 'ณัฐพล มีสุข', group: '2', status: 'present' },
  { id: '66005', name: 'ศิริพร พูนผล', group: '2', status: 'absent' },
  { id: '66006', name: 'ภาคิน วัฒนะ', group: '2', status: 'present' },
  { id: '66007', name: 'ชลธิชา รุ่งเรือง', group: '1', status: 'present' },
  { id: '66008', name: 'พีรพัฒน์ คำดี', group: '2', status: 'absent' },
];

export const DEFAULT_COURSE = 'นวัตกรรมและเทคโนโลยีดิจิทัลเพื่อการเรียนรู้';
export const DEFAULT_SESSION = 'ครั้งที่ 1 — แนะนำรายวิชา';

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
