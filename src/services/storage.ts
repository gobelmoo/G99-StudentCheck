import AsyncStorage from '@react-native-async-storage/async-storage';
import { AttendanceSession, Student } from '@/types/attendance';
import {
  DEFAULT_COURSE,
  DEFAULT_SESSION,
  INITIAL_STUDENTS,
  getTodayDateString,
} from '@/constants/initial-data';

const STORAGE_KEY_STUDENTS = 'classcheck_students';
const STORAGE_KEY_COURSE = 'classcheck_course';
const STORAGE_KEY_SESSION = 'classcheck_session';
const STORAGE_KEY_DATE = 'classcheck_date';

export async function loadAttendanceData(): Promise<AttendanceSession> {
  try {
    const [studentsJson, course, session, date] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY_STUDENTS),
      AsyncStorage.getItem(STORAGE_KEY_COURSE),
      AsyncStorage.getItem(STORAGE_KEY_SESSION),
      AsyncStorage.getItem(STORAGE_KEY_DATE),
    ]);

    const students: Student[] = studentsJson ? JSON.parse(studentsJson) : INITIAL_STUDENTS;
    return {
      courseName: course || DEFAULT_COURSE,
      sessionTitle: session || DEFAULT_SESSION,
      classDate: date || getTodayDateString(),
      students,
    };
  } catch (error) {
    console.error('Failed to load attendance data:', error);
    return {
      courseName: DEFAULT_COURSE,
      sessionTitle: DEFAULT_SESSION,
      classDate: getTodayDateString(),
      students: INITIAL_STUDENTS,
    };
  }
}

export async function saveAttendanceData(data: AttendanceSession): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_STUDENTS, JSON.stringify(data.students)),
      AsyncStorage.setItem(STORAGE_KEY_COURSE, data.courseName),
      AsyncStorage.setItem(STORAGE_KEY_SESSION, data.sessionTitle),
      AsyncStorage.setItem(STORAGE_KEY_DATE, data.classDate),
    ]);
  } catch (error) {
    console.error('Failed to save attendance data:', error);
  }
}

export async function resetAttendanceData(): Promise<AttendanceSession> {
  const initialData: AttendanceSession = {
    courseName: DEFAULT_COURSE,
    sessionTitle: DEFAULT_SESSION,
    classDate: getTodayDateString(),
    students: INITIAL_STUDENTS.map((s) => ({ ...s })),
  };
  await saveAttendanceData(initialData);
  return initialData;
}
