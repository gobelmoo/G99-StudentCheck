import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClassHeader } from '@/components/ClassHeader';
import { SessionToolbar } from '@/components/SessionToolbar';
import { AttendanceStatsBar } from '@/components/AttendanceStatsBar';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { StudentCard } from '@/components/StudentCard';
import { StudentModal } from '@/components/StudentModal';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';
import { Student } from '@/types/attendance';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const { filteredStudents, isLoading, session } = useAttendance();

  const [studentModalVisible, setStudentModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const handleOpenAddModal = () => {
    setSelectedStudent(null);
    setStudentModalVisible(true);
  };

  const handleEditStudent = (student: Student) => {
    setSelectedStudent(student);
    setStudentModalVisible(true);
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <SessionToolbar />
      <AttendanceStatsBar />
      <SearchFilterBar onOpenAddModal={handleOpenAddModal} />
      <View style={styles.listHeaderRow}>
        <Text style={[styles.listHeaderTitle, { color: theme.text }]}>
          รายชื่อนักเรียน ({filteredStudents.length} คน)
        </Text>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyContainer, { borderColor: theme.border }]}>
      <Ionicons name="search-outline" size={40} color={theme.textSecondary} />
      <Text style={[styles.emptyTitle, { color: theme.text }]}>ไม่พบรายชื่อนักเรียน</Text>
      <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
        ลองค้นหาด้วยคำอื่น หรือกดปุ่ม &quot;+ เพิ่ม&quot; เพื่อเพิ่มนักเรียนใหม่
      </Text>
    </View>
  );

  const renderFooter = () => (
    <View style={styles.footerContainer}>
      <Text style={[styles.footerText, { color: theme.textSecondary }]}>
        ClassCheck Mobile · บันทึกข้อมูลอัตโนมัติบนอุปกรณ์เครื่องนี้
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.contentWrapper}>
          <ClassHeader />

          <FlatList
            data={filteredStudents}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <StudentCard
                student={item}
                index={index}
                onEditStudent={handleEditStudent}
              />
            )}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            ListFooterComponent={renderFooter}
            contentContainerStyle={[
              styles.listContent,
              { paddingBottom: insets.bottom + BottomTabInset + Spacing.four },
            ]}
            showsVerticalScrollIndicator={false}
          />
        </View>

        <StudentModal
          visible={studentModalVisible}
          student={selectedStudent}
          onClose={() => setStudentModalVisible(false)}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  contentWrapper: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.three,
  },
  headerSection: {
    paddingBottom: 4,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 8,
    paddingHorizontal: 2,
  },
  listHeaderTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 16,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerContainer: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
