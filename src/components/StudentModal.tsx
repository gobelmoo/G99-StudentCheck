import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { Student } from '@/types/attendance';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';

interface StudentModalProps {
  visible: boolean;
  student: Student | null; // null = Add mode, Student = Edit mode
  onClose: () => void;
}

export function StudentModal({ visible, student, onClose }: StudentModalProps) {
  const { addStudent, updateStudent, deleteStudent } = useAttendance();
  const theme = useTheme();

  const isEditMode = student !== null;
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [group, setGroup] = useState('1');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (visible) {
      if (student) {
        setId(student.id);
        setName(student.name);
        setGroup(student.group || '1');
      } else {
        setId('');
        setName('');
        setGroup('1');
      }
      setErrorMsg('');
    }
  }, [visible, student]);

  const handleSave = () => {
    setErrorMsg('');
    if (isEditMode) {
      const res = updateStudent(student.id, { name, group });
      if (!res.success) {
        setErrorMsg(res.error || 'เกิดข้อผิดพลาด');
        return;
      }
    } else {
      const res = addStudent({ id, name, group });
      if (!res.success) {
        setErrorMsg(res.error || 'เกิดข้อผิดพลาด');
        return;
      }
    }
    onClose();
  };

  const handleDelete = () => {
    if (!student) return;

    const doDelete = () => {
      deleteStudent(student.id);
      onClose();
    };

    if (Platform.OS === 'web') {
      if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ ${student.name} (${student.id})?`)) {
        doDelete();
      }
    } else {
      Alert.alert(
        'ลบนักเรียน',
        `คุณแน่ใจหรือไม่ว่าต้องการลบ ${student.name} (${student.id}) ออกจากรายชื่อ?`,
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ลบ', style: 'destructive', onPress: doDelete },
        ]
      );
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.dialogHeader}>
            <Text style={[styles.dialogTitle, { color: theme.text }]}>
              {isEditMode ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มนักเรียนใหม่'}
            </Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </Pressable>
          </View>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#e05252" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Student ID */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>
                รหัสนักเรียน / นักศึกษา
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isEditMode
                      ? theme.backgroundSelected
                      : theme.backgroundElement,
                    color: isEditMode ? theme.textSecondary : theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={id}
                onChangeText={setId}
                placeholder="เช่น 66009"
                placeholderTextColor={theme.textSecondary}
                editable={!isEditMode}
                autoCapitalize="none"
              />
            </View>

            {/* Name */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>ชื่อ-นามสกุล</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={name}
                onChangeText={setName}
                placeholder="เช่น สมชาย ใจดี"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            {/* Group */}
            <View style={styles.field}>
              <Text style={[styles.label, { color: theme.textSecondary }]}>กลุ่ม / ห้องเรียน</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundElement,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={group}
                onChangeText={setGroup}
                placeholder="เช่น 1 หรือ 2"
                placeholderTextColor={theme.textSecondary}
              />
            </View>
          </ScrollView>

          <View style={styles.dialogActions}>
            {isEditMode ? (
              <Pressable style={styles.deleteButton} onPress={handleDelete}>
                <Ionicons name="trash-outline" size={16} color="#e05252" />
                <Text style={styles.deleteText}>ลบ</Text>
              </Pressable>
            ) : null}

            <View style={styles.rightButtons}>
              <Pressable
                style={[
                  styles.cancelButton,
                  { borderColor: theme.border, backgroundColor: theme.backgroundElement },
                ]}
                onPress={onClose}>
                <Text style={[styles.cancelText, { color: theme.text }]}>ยกเลิก</Text>
              </Pressable>

              <Pressable style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>{isEditMode ? 'บันทึก' : 'เพิ่มนักเรียน'}</Text>
              </Pressable>
            </View>
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
    marginBottom: 14,
  },
  dialogTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fff0f0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#e05252',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  body: {
    maxHeight: 340,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    gap: 10,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff0f0',
  },
  deleteText: {
    color: '#e05252',
    fontSize: 13,
    fontWeight: '700',
  },
  rightButtons: {
    flexDirection: 'row',
    gap: 10,
    marginLeft: 'auto',
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
