import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';
import { StudentModal } from '@/components/StudentModal';
import { EditSessionModal } from '@/components/EditSessionModal';
import { Student } from '@/types/attendance';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { session, stats, availableGroups, exportCSV, resetToDefaults } = useAttendance();

  const [isExporting, setIsExporting] = useState(false);
  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [sessionModalVisible, setSessionModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const res = await exportCSV();
      if (!res.success && res.message) {
        if (Platform.OS === 'web') {
          window.alert(res.message);
        } else {
          Alert.alert('ส่งออกไฟล์ไม่สำเร็จ', res.message);
        }
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleShareSummary = async () => {
    const summaryText = `📊 รายงานสรุปการเข้าเรียน — ClassCheck
วิชา: ${session.courseName}
ครั้งที่: ${session.sessionTitle}
วันที่: ${session.classDate}

👥 จำนวนนักเรียนทั้งหมด: ${stats.total} คน
✅ มาเรียน: ${stats.present} คน (${stats.total ? Math.round((stats.present / stats.total) * 100) : 0}%)
⏰ มาสาย: ${stats.late} คน (${stats.total ? Math.round((stats.late / stats.total) * 100) : 0}%)
❌ ขาดเรียน: ${stats.absent} คน (${stats.total ? Math.round((stats.absent / stats.total) * 100) : 0}%)
📈 อัตราการเข้าเรียนรวม: ${stats.presentRate}%`;

    if (Platform.OS === 'web') {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summaryText);
        window.alert('คัดลอกข้อความสรุปเรียบร้อยแล้ว');
      } else {
        window.prompt('คัดลอกข้อความสรุป:', summaryText);
      }
    } else {
      await Share.share({
        title: 'สรุปการเช็กชื่อเข้าห้องเรียน',
        message: summaryText,
      });
    }
  };

  const handleReset = () => {
    const confirmMsg =
      'คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นข้อมูลตัวอย่างเริ่มต้นใช่หรือไม่?';

    if (Platform.OS === 'web') {
      if (window.confirm(confirmMsg)) {
        resetToDefaults();
      }
    } else {
      Alert.alert('รีเซ็ตข้อมูล', confirmMsg, [
        { text: 'ยกเลิก', style: 'cancel' },
        { text: 'รีเซ็ต', style: 'destructive', onPress: resetToDefaults },
      ]);
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={[
        styles.contentContainer,
        {
          paddingTop: insets.top + Spacing.three,
          paddingBottom: insets.bottom + BottomTabInset + Spacing.four,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      <View style={styles.contentWrapper}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>รายงานและสถิติ</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            สรุปผลการเข้าเรียนและจัดการข้อมูลห้องเรียน
          </Text>
        </View>

        {/* Big Rate Card */}
        <View
          style={[
            styles.rateCard,
            { backgroundColor: '#3730a3' },
          ]}>
          <View style={styles.rateCardHeader}>
            <Text style={styles.rateCardTitle}>อัตราการเข้าเรียนรวม</Text>
            <View style={styles.rateBadge}>
              <Text style={styles.rateBadgeText}>{stats.presentRate}%</Text>
            </View>
          </View>

          <View style={styles.rateBarContainer}>
            <View
              style={[
                styles.rateBarFill,
                { width: `${Math.min(100, Math.max(0, stats.presentRate))}%` },
              ]}
            />
          </View>

          <View style={styles.rateStatsRow}>
            <View style={styles.rateStatItem}>
              <Text style={styles.rateStatLabel}>มาเรียน</Text>
              <Text style={styles.rateStatValue}>{stats.present} คน</Text>
            </View>
            <View style={styles.rateStatItem}>
              <Text style={styles.rateStatLabel}>มาสาย</Text>
              <Text style={styles.rateStatValue}>{stats.late} คน</Text>
            </View>
            <View style={styles.rateStatItem}>
              <Text style={styles.rateStatLabel}>ขาดเรียน</Text>
              <Text style={styles.rateStatValue}>{stats.absent} คน</Text>
            </View>
          </View>
        </View>

        {/* Group Breakdown */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>สถิติแยกตามกลุ่ม</Text>
          {availableGroups.map((g) => {
            const groupStudents = session.students.filter((s) => s.group === g);
            const gTotal = groupStudents.length;
            const gPresent = groupStudents.filter((s) => s.status === 'present').length;
            const gLate = groupStudents.filter((s) => s.status === 'late').length;
            const gAbsent = groupStudents.filter((s) => s.status === 'absent').length;
            const gRate = gTotal > 0 ? Math.round(((gPresent + gLate) / gTotal) * 100) : 0;

            return (
              <View
                key={g}
                style={[styles.groupRow, { borderBottomColor: theme.border }]}>
                <View style={styles.groupHeader}>
                  <View style={[styles.groupPill, { backgroundColor: theme.backgroundElement }]}>
                    <Text style={[styles.groupPillText, { color: theme.text }]}>
                      กลุ่ม {g}
                    </Text>
                  </View>
                  <Text style={[styles.groupTotalText, { color: theme.textSecondary }]}>
                    รวม {gTotal} คน · เข้าเรียน {gRate}%
                  </Text>
                </View>

                <View style={styles.groupChipsRow}>
                  <View style={[styles.statusChip, { backgroundColor: '#e5f7ef' }]}>
                    <Text style={[styles.statusChipText, { color: '#16a36a' }]}>
                      มา {gPresent}
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: '#fff5df' }]}>
                    <Text style={[styles.statusChipText, { color: '#d58b18' }]}>
                      สาย {gLate}
                    </Text>
                  </View>
                  <View style={[styles.statusChip, { backgroundColor: '#fff0f0' }]}>
                    <Text style={[styles.statusChipText, { color: '#e05252' }]}>
                      ขาด {gAbsent}
                    </Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionGrid}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleExport}
            disabled={isExporting}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#e0e7ff' }]}>
              {isExporting ? (
                <ActivityIndicator size="small" color="#4f46e5" />
              ) : (
                <Ionicons name="document-text-outline" size={22} color="#4f46e5" />
              )}
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>ส่งออก CSV</Text>
            <Text style={[styles.actionCardDesc, { color: theme.textSecondary }]}>
              ดาวน์โหลดหรือแชร์ไฟล์ Excel (.csv)
            </Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              { backgroundColor: theme.card, borderColor: theme.border },
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleShareSummary}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#e5f7ef' }]}>
              <Ionicons name="share-social-outline" size={22} color="#16a36a" />
            </View>
            <Text style={[styles.actionCardTitle, { color: theme.text }]}>แชร์สรุปผล</Text>
            <Text style={[styles.actionCardDesc, { color: theme.textSecondary }]}>
              คัดลอกข้อความสรุปเพื่อส่งเข้ากลุ่ม LINE
            </Text>
          </Pressable>
        </View>

        {/* Class Details Card */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>ข้อมูลคาบเรียน</Text>
            <Pressable
              onPress={() => setSessionModalVisible(true)}
              hitSlop={8}
              style={[styles.smallEditButton, { backgroundColor: theme.backgroundElement }]}>
              <Ionicons name="create-outline" size={14} color="#4f46e5" />
              <Text style={styles.smallEditText}>แก้ไข</Text>
            </Pressable>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>รายวิชา:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{session.courseName}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>ครั้งที่ / หัวข้อ:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{session.sessionTitle}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: theme.textSecondary }]}>วันที่เรียน:</Text>
            <Text style={[styles.detailValue, { color: theme.text }]}>{session.classDate}</Text>
          </View>
        </View>

        {/* Data Reset & Add Student */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>จัดการข้อมูล</Text>

          <Pressable
            style={({ pressed }) => [
              styles.rowButton,
              { borderBottomColor: theme.border },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => {
              setSelectedStudent(null);
              setStudentModalVisible(true);
            }}>
            <View style={styles.rowButtonLeft}>
              <Ionicons name="person-add-outline" size={20} color="#4f46e5" />
              <Text style={[styles.rowButtonText, { color: theme.text }]}>
                เพิ่มนักเรียนใหม่
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.rowButton,
              pressed && { opacity: 0.7 },
            ]}
            onPress={handleReset}>
            <View style={styles.rowButtonLeft}>
              <Ionicons name="reload-outline" size={20} color="#e05252" />
              <Text style={[styles.rowButtonText, { color: '#e05252' }]}>
                รีเซ็ตเป็นข้อมูลตัวอย่างเริ่มต้น
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
          </Pressable>
        </View>
      </View>

      <StudentModal
        visible={studentModalVisible}
        student={selectedStudent}
        onClose={() => setStudentModalVisible(false)}
      />

      <EditSessionModal
        visible={sessionModalVisible}
        onClose={() => setSessionModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: Spacing.three,
  },
  contentWrapper: {
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  rateCard: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#1e1b4b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  rateCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateCardTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  rateBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rateBadgeText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  rateBarContainer: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 14,
  },
  rateBarFill: {
    height: '100%',
    backgroundColor: '#34d399',
    borderRadius: 4,
  },
  rateStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  rateStatItem: {
    alignItems: 'center',
  },
  rateStatLabel: {
    color: '#c7d2fe',
    fontSize: 12,
    fontWeight: '500',
  },
  rateStatValue: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  smallEditButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  smallEditText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4f46e5',
  },
  groupRow: {
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  groupPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  groupPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  groupTotalText: {
    fontSize: 12,
    fontWeight: '500',
  },
  groupChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  actionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionCardDesc: {
    fontSize: 11,
    lineHeight: 15,
  },
  detailItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 100,
    fontSize: 13,
    fontWeight: '500',
  },
  detailValue: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
  },
  rowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  rowButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rowButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
