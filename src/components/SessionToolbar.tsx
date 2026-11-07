import React, { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';
import { EditSessionModal } from './EditSessionModal';

export function SessionToolbar() {
  const { session, markAll, resetAll } = useAttendance();
  const theme = useTheme();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);

  const handleMarkAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('คุณต้องการเช็กชื่อนักเรียน "มาเรียน" ครบทุกคนใช่หรือไม่?')) {
        markAll('present');
      }
    } else {
      Alert.alert(
        'มาครบทุกคน',
        'คุณต้องการตั้งสถานะนักเรียนทั้งหมดเป็น "มาเรียน" ใช่หรือไม่?',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ตกลง', onPress: () => markAll('present') },
        ]
      );
    }
  };

  const handleResetAll = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('คุณต้องการล้างสถานะการเช็กชื่อทั้งหมดใช่หรือไม่? (ตั้งเป็นขาดเรียน)')) {
        resetAll();
      }
    } else {
      Alert.alert(
        'ล้างสถานะ',
        'คุณต้องการล้างสถานะการเช็กชื่อทั้งหมดใช่หรือไม่? (ตั้งเป็นขาดเรียน)',
        [
          { text: 'ยกเลิก', style: 'cancel' },
          { text: 'ล้างสถานะ', style: 'destructive', onPress: () => resetAll() },
        ]
      );
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.sessionHeader}>
        <View style={styles.sessionInfo}>
          <Text style={[styles.sessionTopic, { color: theme.text }]} numberOfLines={1}>
            {session.sessionTitle}
          </Text>
          <Text style={[styles.courseSubtitle, { color: theme.textSecondary }]} numberOfLines={1}>
            {session.courseName}
          </Text>
        </View>

        <Pressable
          style={[styles.editButton, { backgroundColor: theme.backgroundElement }]}
          onPress={() => setIsEditModalVisible(true)}
          accessibilityLabel="แก้ไขข้อมูลวิชา">
          <Ionicons name="create-outline" size={16} color={theme.text} />
          <Text style={[styles.editButtonText, { color: theme.text }]}>แก้ไขข้อมูล</Text>
        </Pressable>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleMarkAll}>
          <Ionicons name="checkmark-done" size={16} color="#ffffff" />
          <Text style={styles.primaryButtonText}>มาครบทุกคน</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.outlineButton,
            { borderColor: theme.border, backgroundColor: theme.backgroundElement },
            pressed && { opacity: 0.8 },
          ]}
          onPress={handleResetAll}>
          <Ionicons name="refresh-outline" size={16} color={theme.text} />
          <Text style={[styles.outlineButtonText, { color: theme.text }]}>ล้างสถานะ</Text>
        </Pressable>
      </View>

      <EditSessionModal
        visible={isEditModalVisible}
        onClose={() => setIsEditModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 10,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTopic: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 2,
  },
  courseSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  outlineButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  outlineButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
