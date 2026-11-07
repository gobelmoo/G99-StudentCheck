import { supabase } from './supabase';
import { AttendanceSession, Student } from '@/types/attendance';

export interface SyncResult {
  success: boolean;
  message: string;
  isRlsError?: boolean;
}

// SQL Script that user can run in Supabase SQL Editor if RLS blocks write operations
export const SUPABASE_RLS_FIX_SQL = `-- Run this in Supabase SQL Editor to allow read/write for the Mobile App:
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read/write on courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on class_sections" ON public.class_sections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on class_sessions" ON public.class_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on enrollments" ON public.enrollments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read/write on attendance_records" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Fetch attendance session and roster from Supabase.
 * Returns null if no course/session exists in Supabase.
 */
export async function loadSessionFromSupabase(): Promise<{
  session: AttendanceSession | null;
  error?: string;
}> {
  try {
    // 1. Fetch courses
    const { data: courses, error: courseErr } = await supabase
      .from('courses')
      .select('*')
      .limit(1);

    if (courseErr) {
      return { session: null, error: courseErr.message };
    }

    if (!courses || courses.length === 0) {
      return { session: null };
    }

    const currentCourse = courses[0];

    // 2. Fetch sections for this course
    const { data: sections, error: secErr } = await supabase
      .from('class_sections')
      .select('*')
      .eq('course_id', currentCourse.id);

    if (secErr) {
      return { session: null, error: secErr.message };
    }

    const sectionMap = new Map<string, string>(); // section_id -> section_code
    (sections || []).forEach((sec) => {
      sectionMap.set(sec.id, sec.section_code || '1');
    });

    // 3. Fetch latest class session
    let sessionRecord: any = null;
    if (sections && sections.length > 0) {
      const sectionIds = sections.map((s) => s.id);
      const { data: sessions, error: sessErr } = await supabase
        .from('class_sessions')
        .select('*')
        .in('section_id', sectionIds)
        .order('session_date', { ascending: false })
        .limit(1);

      if (!sessErr && sessions && sessions.length > 0) {
        sessionRecord = sessions[0];
      }
    }

    // 4. Fetch students (profiles)
    const { data: profiles, error: profErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student');

    if (profErr) {
      return { session: null, error: profErr.message };
    }

    if (!profiles || profiles.length === 0) {
      return {
        session: {
          courseName: currentCourse.course_name,
          sessionTitle: sessionRecord?.topic || `ครั้งที่ ${sessionRecord?.session_no || 1}`,
          classDate: sessionRecord?.session_date || new Date().toISOString().slice(0, 10),
          students: [],
        },
      };
    }

    // 5. Fetch enrollments to get student group/section
    const profileIds = profiles.map((p) => p.id);
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select('*')
      .in('student_id', profileIds);

    const studentGroupMap = new Map<string, string>(); // student_id -> group ('1' or '2')
    (enrollments || []).forEach((enr) => {
      const groupCode = sectionMap.get(enr.section_id) || '1';
      studentGroupMap.set(enr.student_id, groupCode);
    });

    // 6. Fetch attendance records for this session if session exists
    const attendanceMap = new Map<string, { status: any; note?: string }>();
    if (sessionRecord) {
      const { data: attRecords } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('session_id', sessionRecord.id);

      (attRecords || []).forEach((att) => {
        attendanceMap.set(att.student_id, {
          status: att.status,
          note: att.note,
        });
      });
    }

    // Construct student list
    const students: Student[] = profiles.map((p) => {
      const att = attendanceMap.get(p.id);
      return {
        id: p.student_code || p.id.slice(0, 5),
        name: p.full_name || 'ไม่ระบุชื่อ',
        group: studentGroupMap.get(p.id) || '1',
        status: att?.status || 'absent',
        note: att?.note,
      };
    });

    return {
      session: {
        courseName: currentCourse.course_name,
        sessionTitle: sessionRecord?.topic || 'ครั้งที่ 1',
        classDate: sessionRecord?.session_date || new Date().toISOString().slice(0, 10),
        students,
      },
    };
  } catch (err) {
    console.error('Error loading from Supabase:', err);
    return {
      session: null,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

/**
 * Save / Sync the local attendance session to Supabase database.
 */
export async function syncSessionToSupabase(session: AttendanceSession): Promise<SyncResult> {
  try {
    // 1. Upsert / Get course
    let courseId: string;
    const { data: existingCourses, error: courseFetchErr } = await supabase
      .from('courses')
      .select('id')
      .eq('course_name', session.courseName)
      .limit(1);

    if (courseFetchErr) {
      if (courseFetchErr.code === '42501') {
        return {
          success: false,
          isRlsError: true,
          message: 'Supabase RLS Policy ไม่อนุญาตให้เขียนข้อมูล กรุณาตั้งค่า RLS ใน Supabase Dashboard',
        };
      }
      return { success: false, message: courseFetchErr.message };
    }

    if (existingCourses && existingCourses.length > 0) {
      courseId = existingCourses[0].id;
    } else {
      const { data: newCourse, error: courseInsertErr } = await supabase
        .from('courses')
        .insert({
          course_name: session.courseName,
          course_code: 'ED001',
          description: 'บันทึกการเข้าเรียนอัตโนมัติจาก ClassCheck Mobile',
        })
        .select('id')
        .single();

      if (courseInsertErr) {
        if (courseInsertErr.code === '42501') {
          return {
            success: false,
            isRlsError: true,
            message: 'Supabase RLS Policy ไม่อนุญาตให้เขียนข้อมูล (Code 42501)',
          };
        }
        return { success: false, message: courseInsertErr.message };
      }
      courseId = newCourse.id;
    }

    // 2. Ensure class_sections exist for each group in session
    const groups = Array.from(new Set(session.students.map((s) => s.group || '1')));
    const sectionIdMap = new Map<string, string>(); // groupCode -> sectionId

    for (const groupCode of groups) {
      const { data: existingSec } = await supabase
        .from('class_sections')
        .select('id')
        .eq('course_id', courseId)
        .eq('section_code', groupCode)
        .limit(1);

      if (existingSec && existingSec.length > 0) {
        sectionIdMap.set(groupCode, existingSec[0].id);
      } else {
        const { data: newSec, error: secErr } = await supabase
          .from('class_sections')
          .insert({
            course_id: courseId,
            section_code: groupCode,
            academic_year: new Date().getFullYear(),
            semester: 1,
          })
          .select('id')
          .single();

        if (secErr) {
          if (secErr.code === '42501') {
            return { success: false, isRlsError: true, message: secErr.message };
          }
          return { success: false, message: secErr.message };
        }
        if (newSec) sectionIdMap.set(groupCode, newSec.id);
      }
    }

    const defaultSectionId = sectionIdMap.get('1') || Array.from(sectionIdMap.values())[0];

    // 3. Upsert / Get class_session
    let sessionId: string;
    const { data: existingSessions, error: sessFetchErr } = await supabase
      .from('class_sessions')
      .select('id')
      .eq('section_id', defaultSectionId)
      .eq('session_date', session.classDate)
      .limit(1);

    if (sessFetchErr) {
      return { success: false, message: sessFetchErr.message };
    }

    if (existingSessions && existingSessions.length > 0) {
      sessionId = existingSessions[0].id;
      await supabase
        .from('class_sessions')
        .update({ topic: session.sessionTitle })
        .eq('id', sessionId);
    } else {
      const { data: newSess, error: sessInsertErr } = await supabase
        .from('class_sessions')
        .insert({
          section_id: defaultSectionId,
          session_no: 1,
          session_date: session.classDate,
          topic: session.sessionTitle,
        })
        .select('id')
        .single();

      if (sessInsertErr) {
        if (sessInsertErr.code === '42501') {
          return { success: false, isRlsError: true, message: sessInsertErr.message };
        }
        return { success: false, message: sessInsertErr.message };
      }
      sessionId = newSess.id;
    }

    // 4. Upsert student profiles & enrollments & attendance records
    for (const student of session.students) {
      let profileId: string;
      const { data: existingProf } = await supabase
        .from('profiles')
        .select('id')
        .eq('student_code', student.id)
        .limit(1);

      if (existingProf && existingProf.length > 0) {
        profileId = existingProf[0].id;
        await supabase
          .from('profiles')
          .update({ full_name: student.name })
          .eq('id', profileId);
      } else {
        const { data: newProf, error: profErr } = await supabase
          .from('profiles')
          .insert({
            student_code: student.id,
            full_name: student.name,
            role: 'student',
            email: `${student.id}@student.local`,
          })
          .select('id')
          .single();

        if (profErr) {
          if (profErr.code === '42501') {
            return { success: false, isRlsError: true, message: profErr.message };
          }
          return { success: false, message: profErr.message };
        }
        profileId = newProf.id;
      }

      // Check enrollment
      const studentSectionId = sectionIdMap.get(student.group) || defaultSectionId;
      const { data: existingEnr } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', profileId)
        .eq('section_id', studentSectionId)
        .limit(1);

      if (!existingEnr || existingEnr.length === 0) {
        await supabase.from('enrollments').insert({
          student_id: profileId,
          section_id: studentSectionId,
          status: 'enrolled',
        });
      }

      // Upsert attendance record
      const { data: existingAtt } = await supabase
        .from('attendance_records')
        .select('id')
        .eq('session_id', sessionId)
        .eq('student_id', profileId)
        .limit(1);

      if (existingAtt && existingAtt.length > 0) {
        await supabase
          .from('attendance_records')
          .update({
            status: student.status,
            note: student.note || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingAtt[0].id);
      } else {
        await supabase.from('attendance_records').insert({
          session_id: sessionId,
          student_id: profileId,
          status: student.status,
          note: student.note || null,
          checkin_at: new Date().toISOString(),
        });
      }
    }

    return {
      success: true,
      message: 'ซิงค์ข้อมูลกับ Supabase สำเร็จเรียบร้อย',
    };
  } catch (err) {
    console.error('Error syncing to Supabase:', err);
    return {
      success: false,
      message: err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase',
    };
  }
}
