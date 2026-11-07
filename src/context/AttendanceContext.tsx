import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { AttendanceSession, AttendanceStatus, StatusFilter, Student } from '@/types/attendance';
import {
  DEFAULT_COURSE,
  DEFAULT_SESSION,
  INITIAL_STUDENTS,
  getTodayDateString,
} from '@/constants/initial-data';
import { loadAttendanceData, resetAttendanceData, saveAttendanceData } from '@/services/storage';
import { exportAttendanceCSV } from '@/services/export';
import { checkSupabaseConnection } from '@/services/supabase';
import {
  loadSessionFromSupabase,
  syncSessionToSupabase,
  SyncResult,
} from '@/services/supabase-attendance';

interface AttendanceStats {
  total: number;
  present: number;
  late: number;
  absent: number;
  presentRate: number;
}

interface AttendanceContextType {
  session: AttendanceSession;
  isLoading: boolean;
  isCloudConnected: boolean;
  isSyncing: boolean;
  cloudMessage: string;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;
  groupFilter: string;
  setGroupFilter: (group: string) => void;
  stats: AttendanceStats;
  availableGroups: string[];
  filteredStudents: Student[];
  setStudentStatus: (studentId: string, status: AttendanceStatus) => void;
  markAll: (status: AttendanceStatus) => void;
  resetAll: () => void;
  updateSessionInfo: (
    updates: Partial<Pick<AttendanceSession, 'courseName' | 'sessionTitle' | 'classDate'>>
  ) => void;
  addStudent: (student: { id: string; name: string; group: string }) => {
    success: boolean;
    error?: string;
  };
  updateStudent: (
    id: string,
    updates: { name: string; group: string }
  ) => { success: boolean; error?: string };
  deleteStudent: (id: string) => void;
  resetToDefaults: () => Promise<void>;
  exportCSV: () => Promise<{ success: boolean; message?: string }>;
  syncToCloud: () => Promise<SyncResult>;
  pullFromCloud: () => Promise<{ success: boolean; message: string }>;
}

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export function AttendanceProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AttendanceSession>({
    courseName: DEFAULT_COURSE,
    sessionTitle: DEFAULT_SESSION,
    classDate: getTodayDateString(),
    students: INITIAL_STUDENTS,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isCloudConnected, setIsCloudConnected] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cloudMessage, setCloudMessage] = useState('กำลังเชื่อมต่อ Supabase...');

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // 1. Initial Load: Load local data first, then test Supabase connection
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const loaded = await loadAttendanceData();
        if (isMounted) {
          setSession(loaded);
        }
      } catch (err) {
        console.error('Error loading session from local storage:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }

      // Check Supabase connection in background
      try {
        const conn = await checkSupabaseConnection();
        if (isMounted) {
          setIsCloudConnected(conn.connected);
          setCloudMessage(conn.message);
        }
      } catch (e) {
        if (isMounted) {
          setIsCloudConnected(false);
          setCloudMessage('ไม่สามารถเชื่อมต่อ Supabase');
        }
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const persistSession = (newSession: AttendanceSession) => {
    setSession(newSession);
    saveAttendanceData(newSession).catch((err) =>
      console.error('Error saving local attendance data:', err)
    );
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    const updated = session.students.map((s) => (s.id === studentId ? { ...s, status } : s));
    persistSession({ ...session, students: updated });
  };

  const markAll = (status: AttendanceStatus) => {
    const updated = session.students.map((s) => ({ ...s, status }));
    persistSession({ ...session, students: updated });
  };

  const resetAll = () => {
    const updated = session.students.map((s) => ({ ...s, status: 'absent' as AttendanceStatus }));
    persistSession({ ...session, students: updated });
  };

  const updateSessionInfo = (
    updates: Partial<Pick<AttendanceSession, 'courseName' | 'sessionTitle' | 'classDate'>>
  ) => {
    persistSession({
      ...session,
      ...updates,
    });
  };

  const addStudent = (newStudent: { id: string; name: string; group: string }) => {
    const trimmedId = newStudent.id.trim();
    const trimmedName = newStudent.name.trim();
    const trimmedGroup = newStudent.group.trim() || '1';

    if (!trimmedId) {
      return { success: false, error: 'กรุณากรอกรหัสนักเรียน/นักศึกษา' };
    }
    if (!trimmedName) {
      return { success: false, error: 'กรุณากรอกชื่อ-นามสกุล' };
    }
    if (session.students.some((s) => s.id.toLowerCase() === trimmedId.toLowerCase())) {
      return { success: false, error: 'มีรหัสนักเรียนนี้ในระบบแล้ว' };
    }

    const studentToAdd: Student = {
      id: trimmedId,
      name: trimmedName,
      group: trimmedGroup,
      status: 'absent',
    };

    persistSession({
      ...session,
      students: [...session.students, studentToAdd],
    });

    return { success: true };
  };

  const updateStudent = (id: string, updates: { name: string; group: string }) => {
    const trimmedName = updates.name.trim();
    const trimmedGroup = updates.group.trim() || '1';

    if (!trimmedName) {
      return { success: false, error: 'กรุณากรอกชื่อ-นามสกุล' };
    }

    const updated = session.students.map((s) =>
      s.id === id ? { ...s, name: trimmedName, group: trimmedGroup } : s
    );
    persistSession({ ...session, students: updated });
    return { success: true };
  };

  const deleteStudent = (id: string) => {
    const updated = session.students.filter((s) => s.id !== id);
    persistSession({ ...session, students: updated });
  };

  const resetToDefaults = async () => {
    const reset = await resetAttendanceData();
    setSession(reset);
  };

  const exportCSV = async () => {
    return await exportAttendanceCSV(session);
  };

  // Sync session up to Supabase
  const syncToCloud = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      const res = await syncSessionToSupabase(session);
      setCloudMessage(res.message);
      if (res.success) {
        setIsCloudConnected(true);
      }
      return res;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการซิงค์';
      setCloudMessage(msg);
      return { success: false, message: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  // Pull session down from Supabase
  const pullFromCloud = async (): Promise<{ success: boolean; message: string }> => {
    setIsSyncing(true);
    try {
      const res = await loadSessionFromSupabase();
      if (res.error) {
        setCloudMessage(res.error);
        return { success: false, message: res.error };
      }
      if (!res.session || res.session.students.length === 0) {
        return {
          success: false,
          message: 'ยังไม่มีข้อมูลนักเรียนบน Supabase Cloud (สามารถกดซิงค์ข้อมูลขึ้น Cloud ได้)',
        };
      }

      persistSession(res.session);
      const msg = `ดึงข้อมูลสำเร็จ (${res.session.students.length} คน)`;
      setCloudMessage(msg);
      return { success: true, message: msg };
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการดึงข้อมูล';
      return { success: false, message: msg };
    } finally {
      setIsSyncing(false);
    }
  };

  const stats: AttendanceStats = useMemo(() => {
    const total = session.students.length;
    const present = session.students.filter((s) => s.status === 'present').length;
    const late = session.students.filter((s) => s.status === 'late').length;
    const absent = session.students.filter((s) => s.status === 'absent').length;
    const presentRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
    return { total, present, late, absent, presentRate };
  }, [session.students]);

  const availableGroups = useMemo(() => {
    const groups = new Set<string>();
    session.students.forEach((s) => {
      if (s.group) groups.add(s.group);
    });
    return Array.from(groups).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }, [session.students]);

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return session.students.filter((s) => {
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.group.toLowerCase().includes(q);

      const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
      const matchesGroup = groupFilter === 'all' || s.group === groupFilter;

      return matchesSearch && matchesStatus && matchesGroup;
    });
  }, [session.students, searchQuery, statusFilter, groupFilter]);

  return (
    <AttendanceContext.Provider
      value={{
        session,
        isLoading,
        isCloudConnected,
        isSyncing,
        cloudMessage,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        groupFilter,
        setGroupFilter,
        stats,
        availableGroups,
        filteredStudents,
        setStudentStatus,
        markAll,
        resetAll,
        updateSessionInfo,
        addStudent,
        updateStudent,
        deleteStudent,
        resetToDefaults,
        exportCSV,
        syncToCloud,
        pullFromCloud,
      }}>
      {children}
    </AttendanceContext.Provider>
  );
}

export function useAttendance() {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
}
