import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Platform, Share } from 'react-native';
import { AttendanceSession, STATUS_CONFIG } from '@/types/attendance';

export function generateCSVContent(session: AttendanceSession): string {
  const headers = ['วันที่', 'รายวิชา', 'ครั้งที่', 'รหัส', 'ชื่อ-นามสกุล', 'กลุ่ม', 'สถานะ'];
  const rows = session.students.map((s) => [
    session.classDate,
    session.courseName,
    session.sessionTitle,
    s.id,
    s.name,
    s.group,
    STATUS_CONFIG[s.status]?.label ?? s.status,
  ]);

  const allRows = [headers, ...rows];
  const csvBody = allRows
    .map((r) => r.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  // \uFEFF is UTF-8 Byte Order Mark (BOM), ensuring Excel displays Thai characters properly
  return '\uFEFF' + csvBody;
}

export async function exportAttendanceCSV(session: AttendanceSession): Promise<{
  success: boolean;
  message?: string;
}> {
  try {
    const csvContent = generateCSVContent(session);
    const fileName = `attendance-${session.classDate || 'record'}.csv`;

    if (Platform.OS === 'web') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return { success: true };
    }

    // On iOS and Android native
    const fileUri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.writeAsStringAsync(fileUri, csvContent, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'ส่งออกรายงานการเช็กชื่อ CSV',
        UTI: 'public.comma-separated-values-text',
      });
      return { success: true };
    }

    // Fallback if sharing is unavailable
    await Share.share({
      title: fileName,
      message: csvContent,
    });
    return { success: true };
  } catch (error) {
    console.error('Export CSV failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการส่งออกไฟล์',
    };
  }
}
