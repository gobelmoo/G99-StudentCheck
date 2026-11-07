import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/AttendanceContext';

export function ClassHeader() {
  const { session, stats } = useAttendance();

  return (
    <View style={styles.header}>
      <View style={styles.topRow}>
        <View style={styles.branding}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkbox" size={24} color="#ffffff" />
          </View>
          <View>
            <Text style={styles.title}>ClassCheck</Text>
            <Text style={styles.subtitle}>ระบบเช็กชื่อผู้เรียนเข้าห้องเรียน</Text>
          </View>
        </View>

        <View style={styles.dateBadge}>
          <Ionicons name="calendar-outline" size={14} color="#e0e7ff" />
          <Text style={styles.dateText}>{session.classDate}</Text>
        </View>
      </View>

      <View style={styles.sessionPill}>
        <Ionicons name="book-outline" size={14} color="#c7d2fe" />
        <Text style={styles.courseText} numberOfLines={1}>
          {session.courseName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#3730a3',
    paddingTop: 14,
    paddingBottom: 18,
    paddingHorizontal: Spacing.four,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  branding: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 12,
    color: '#c7d2fe',
    fontWeight: '500',
    marginTop: 1,
  },
  dateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  dateText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '600',
  },
  sessionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  courseText: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
    flex: 1,
  },
});
