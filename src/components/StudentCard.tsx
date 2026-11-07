import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AttendanceStatus, STATUS_CONFIG, Student } from '@/types/attendance';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';

interface StudentCardProps {
  student: Student;
  index: number;
  onEditStudent: (student: Student) => void;
}

export function StudentCard({ student, index, onEditStudent }: StudentCardProps) {
  const { setStudentStatus } = useAttendance();
  const theme = useTheme();
  const statusCfg = STATUS_CONFIG[student.status] || STATUS_CONFIG.absent;

  const handleStatusSelect = (status: AttendanceStatus) => {
    setStudentStatus(student.id, status);
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.topRow}>
        {/* Number & Student Details */}
        <View style={styles.leftInfo}>
          <View style={[styles.indexCircle, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.indexText, { color: theme.textSecondary }]}>{index + 1}</Text>
          </View>
          <View style={styles.nameContainer}>
            <View style={styles.nameRow}>
              <Text style={[styles.nameText, { color: theme.text }]} numberOfLines={1}>
                {student.name}
              </Text>
              <View style={[styles.groupBadge, { backgroundColor: theme.backgroundElement }]}>
                <Text style={[styles.groupText, { color: theme.textSecondary }]}>
                  กลุ่ม {student.group}
                </Text>
              </View>
            </View>
            <Text style={[styles.codeText, { color: theme.textSecondary }]}>
              รหัส: {student.id}
            </Text>
          </View>
        </View>

        {/* Options / Edit trigger */}
        <Pressable
          style={styles.moreButton}
          onPress={() => onEditStudent(student)}
          hitSlop={8}
          accessibilityLabel="แก้ไขข้อมูลนักเรียน">
          <Ionicons name="ellipsis-vertical" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Bottom Row: Status Badge + Check Action Buttons */}
      <View style={[styles.bottomRow, { borderTopColor: theme.border }]}>
        <View
          style={[
            styles.statusPill,
            {
              backgroundColor:
                theme.background === '#0f172a'
                  ? statusCfg.bgColorDark
                  : statusCfg.bgColorLight,
            },
          ]}>
          <View style={[styles.statusDot, { backgroundColor: statusCfg.color }]} />
          <Text style={[styles.statusText, { color: statusCfg.color }]}>
            {statusCfg.label}
          </Text>
        </View>

        <View style={styles.actionButtonGroup}>
          {/* มา */}
          <Pressable
            style={({ pressed }) => [
              styles.markButton,
              student.status === 'present'
                ? styles.presentActive
                : [styles.inactiveButton, { borderColor: theme.border }],
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleStatusSelect('present')}>
            <Ionicons
              name="checkmark"
              size={13}
              color={student.status === 'present' ? '#ffffff' : '#16a36a'}
            />
            <Text
              style={[
                styles.markText,
                student.status === 'present'
                  ? styles.markTextActive
                  : { color: '#16a36a' },
              ]}>
              มา
            </Text>
          </Pressable>

          {/* สาย */}
          <Pressable
            style={({ pressed }) => [
              styles.markButton,
              student.status === 'late'
                ? styles.lateActive
                : [styles.inactiveButton, { borderColor: theme.border }],
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleStatusSelect('late')}>
            <Ionicons
              name="time"
              size={13}
              color={student.status === 'late' ? '#ffffff' : '#d58b18'}
            />
            <Text
              style={[
                styles.markText,
                student.status === 'late'
                  ? styles.markTextActive
                  : { color: '#d58b18' },
              ]}>
              สาย
            </Text>
          </Pressable>

          {/* ขาด */}
          <Pressable
            style={({ pressed }) => [
              styles.markButton,
              student.status === 'absent'
                ? styles.absentActive
                : [styles.inactiveButton, { borderColor: theme.border }],
              pressed && { opacity: 0.8 },
            ]}
            onPress={() => handleStatusSelect('absent')}>
            <Ionicons
              name="close"
              size={13}
              color={student.status === 'absent' ? '#ffffff' : '#e05252'}
            />
            <Text
              style={[
                styles.markText,
                student.status === 'absent'
                  ? styles.markTextActive
                  : { color: '#e05252' },
              ]}>
              ขาด
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  leftInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  indexCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  indexText: {
    fontSize: 12,
    fontWeight: '700',
  },
  nameContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
  },
  groupBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  groupText: {
    fontSize: 11,
    fontWeight: '600',
  },
  codeText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  moreButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionButtonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  markButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  inactiveButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  presentActive: {
    backgroundColor: '#16a36a',
  },
  lateActive: {
    backgroundColor: '#d58b18',
  },
  absentActive: {
    backgroundColor: '#e05252',
  },
  markText: {
    fontSize: 12,
    fontWeight: '700',
  },
  markTextActive: {
    color: '#ffffff',
  },
});
