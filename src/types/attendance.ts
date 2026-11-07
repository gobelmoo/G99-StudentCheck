export type AttendanceStatus = 'present' | 'late' | 'absent';

export interface Student {
  id: string;
  name: string;
  group: string;
  status: AttendanceStatus;
  note?: string;
}

export interface AttendanceSession {
  courseName: string;
  sessionTitle: string;
  classDate: string;
  students: Student[];
}

export type StatusFilter = 'all' | AttendanceStatus;

export const STATUS_CONFIG: Record<
  AttendanceStatus,
  {
    label: string;
    shortLabel: string;
    color: string;
    bgColorLight: string;
    bgColorDark: string;
    icon: string;
  }
> = {
  present: {
    label: 'มาเรียน',
    shortLabel: 'มา',
    color: '#16a36a',
    bgColorLight: '#e5f7ef',
    bgColorDark: '#123724',
    icon: 'checkmark-circle',
  },
  late: {
    label: 'มาสาย',
    shortLabel: 'สาย',
    color: '#d58b18',
    bgColorLight: '#fff5df',
    bgColorDark: '#3a2707',
    icon: 'time',
  },
  absent: {
    label: 'ขาดเรียน',
    shortLabel: 'ขาด',
    color: '#e05252',
    bgColorLight: '#fff0f0',
    bgColorDark: '#3b1414',
    icon: 'close-circle',
  },
};
