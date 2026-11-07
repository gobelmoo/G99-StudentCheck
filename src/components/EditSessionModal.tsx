import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';
import { getTodayDateString } from '@/constants/initial-data';

interface EditSessionModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditSessionModal({ visible, onClose }: EditSessionModalProps) {
  const { session, updateSessionInfo } = useAttendance();
  const theme = useTheme();

  const [courseName, setCourseName] = useState(session.courseName);
  const [sessionTitle, setSessionTitle] = useState(session.sessionTitle);
  const [classDate, setClassDate] = useState(session.classDate);

  useEffect(() => {
    if (visible) {
      setCourseName(session.courseName);
      setSessionTitle(session.sessionTitle);
      setClassDate(session.classDate);
    }
  }, [visible, session]);

  const handleSave = () => {
    updateSessionInfo({
      courseName: courseName.trim() || session.courseName,
      sessionTitle: sessionTitle.trim() || session.sessionTitle,
      classDate: classDate.trim() || getTodayDateString(),
    });
    onClose();
  };

  const setToday = () => {
    setClassDate(getTodayDateString());
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>แก้ไขข้อมูลวิชาและคาบเรียน</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>รายวิชา / ห้องเรียน</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={courseName}
                onChangeText={setCourseName}
                placeholder="ชื่อวิชา..."
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ครั้งที่ / หัวข้อ</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={sessionTitle}
                onChangeText={setSessionTitle}
                placeholder="เช่น ครั้งที่ 1 — แนะนำรายวิชา"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.field}>
              <View style={styles.labelRow}>
                <Text style={[styles.label, { color: theme.textSecondary }]}>วันที่เรียน (YYYY-MM-DD)</Text>
                <Pressable onPress={setToday}>
                  <Text style={styles.todayLink}>ใช้วันนี้</Text>
                </Pressable>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={classDate}
                onChangeText={setClassDate}
                placeholder="2026-11-07"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={styles.dialogActions}>
            <Pressable
              style={[
                styles.cancelButton,
                { borderColor: theme.border, backgroundColor: theme.backgroundElement },
              ]}
              onPress={onClose}>
              <Text style={[styles.cancelText, { color: theme.text }]}>ยกเลิก</Text>
            </Pressable>
            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>บันทึกข้อมูล</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  body: {
    maxHeight: 340,
  },
  field: {
    marginBottom: 14,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  todayLink: {
    fontSize: 12,
    color: '#4f46e5',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
  },
  dialogActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 16,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  saveText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
