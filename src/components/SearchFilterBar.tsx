import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { StatusFilter } from '@/types/attendance';

interface SearchFilterBarProps {
  onOpenAddModal: () => void;
}

export function SearchFilterBar({ onOpenAddModal }: SearchFilterBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    groupFilter,
    setGroupFilter,
    availableGroups,
    exportCSV,
  } = useAttendance();
  const theme = useTheme();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const result = await exportCSV();
      if (!result.success && result.message) {
        if (Platform.OS === 'web') {
          window.alert(result.message);
        } else {
          Alert.alert('ส่งออกไฟล์ไม่สำเร็จ', result.message);
        }
      } else if (Platform.OS === 'web') {
        // Successful web download notification
      }
    } finally {
      setIsExporting(false);
    }
  };

  const statusFilters: { key: StatusFilter; label: string; countColor?: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'present', label: 'มาเรียน' },
    { key: 'late', label: 'มาสาย' },
    { key: 'absent', label: 'ขาดเรียน' },
  ];

  return (
    <View style={styles.container}>
      {/* Top action row: Search input + Buttons */}
      <View style={styles.topActionsRow}>
        <View
          style={[
            styles.searchWrapper,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}>
          <Ionicons name="search-outline" size={17} color={theme.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="ค้นหาชื่อ / รหัสนักเรียน..."
            placeholderTextColor={theme.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={theme.textSecondary} />
            </Pressable>
          )}
        </View>

        <View style={styles.buttonGroup}>
          <Pressable
            style={({ pressed }) => [
              styles.addButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={onOpenAddModal}
            accessibilityLabel="เพิ่มนักเรียน">
            <Ionicons name="person-add-outline" size={15} color="#4338ca" />
            <Text style={styles.addButtonText}>เพิ่ม</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.exportButton,
              pressed && { opacity: 0.8 },
            ]}
            onPress={handleExport}
            disabled={isExporting}
            accessibilityLabel="ส่งออก CSV">
            {isExporting ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <>
                <Ionicons name="download-outline" size={15} color="#ffffff" />
                <Text style={styles.exportButtonText}>CSV</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      {/* Filter Chips ScrollView */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScrollView}>
        {/* Status filters */}
        {statusFilters.map((f) => {
          const isActive = statusFilter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setStatusFilter(f.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive
                    ? '#4f46e5'
                    : theme.card,
                  borderColor: isActive ? '#4f46e5' : theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  { color: isActive ? '#ffffff' : theme.textSecondary },
                  isActive && styles.chipTextActive,
                ]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}

        {/* Group filters separator if groups exist */}
        {availableGroups.length > 1 && (
          <View style={[styles.filterSeparator, { backgroundColor: theme.border }]} />
        )}

        {/* Group filter chips */}
        {availableGroups.length > 1 && (
          <>
            <Pressable
              onPress={() => setGroupFilter('all')}
              style={[
                styles.chip,
                {
                  backgroundColor: groupFilter === 'all' && statusFilter === 'all'
                    ? theme.backgroundSelected
                    : theme.card,
                  borderColor: theme.border,
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  {
                    color: groupFilter === 'all' ? theme.text : theme.textSecondary,
                  },
                ]}>
                ทุกกลุ่ม
              </Text>
            </Pressable>

            {availableGroups.map((g) => {
              const isGroupActive = groupFilter === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => setGroupFilter(isGroupActive ? 'all' : g)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isGroupActive ? '#312e81' : theme.card,
                      borderColor: isGroupActive ? '#312e81' : theme.border,
                    },
                  ]}>
                  <Text
                    style={[
                      styles.chipText,
                      { color: isGroupActive ? '#ffffff' : theme.textSecondary },
                      isGroupActive && styles.chipTextActive,
                    ]}>
                    กลุ่ม {g}
                  </Text>
                </Pressable>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  topActionsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#eef0ff',
    paddingHorizontal: 11,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4338ca',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f46e5',
    paddingHorizontal: 12,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
  },
  exportButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  filterScrollView: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  chipTextActive: {
    fontWeight: '700',
  },
  filterSeparator: {
    width: 1,
    height: 18,
    marginHorizontal: 4,
  },
});
