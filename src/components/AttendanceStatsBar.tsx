import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAttendance } from '@/context/AttendanceContext';
import { useTheme } from '@/hooks/use-theme';

export function AttendanceStatsBar() {
  const { stats, statusFilter, setStatusFilter } = useAttendance();
  const theme = useTheme();

  const total = stats.total || 0;
  const presentPct = total > 0 ? (stats.present / total) * 100 : 0;
  const latePct = total > 0 ? (stats.late / total) * 100 : 0;
  const absentPct = total > 0 ? (stats.absent / total) * 100 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={styles.grid}>
        <View style={[styles.statCell, { borderRightColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: theme.textSecondary }]}>ทั้งหมด</Text>
          <Text style={[styles.statNumber, { color: theme.text }]}>{stats.total}</Text>
          <Text style={[styles.statSub, { color: theme.textSecondary }]}>คน</Text>
        </View>

        <View style={[styles.statCell, { borderRightColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: '#16a36a' }]}>มาเรียน</Text>
          <Text style={[styles.statNumber, { color: '#16a36a' }]}>{stats.present}</Text>
          <Text style={[styles.statSub, { color: '#16a36a' }]}>
            {total > 0 ? `${Math.round(presentPct)}%` : '0%'}
          </Text>
        </View>

        <View style={[styles.statCell, { borderRightColor: theme.border }]}>
          <Text style={[styles.statLabel, { color: '#d58b18' }]}>มาสาย</Text>
          <Text style={[styles.statNumber, { color: '#d58b18' }]}>{stats.late}</Text>
          <Text style={[styles.statSub, { color: '#d58b18' }]}>
            {total > 0 ? `${Math.round(latePct)}%` : '0%'}
          </Text>
        </View>

        <View style={styles.statCell}>
          <Text style={[styles.statLabel, { color: '#e05252' }]}>ขาดเรียน</Text>
          <Text style={[styles.statNumber, { color: '#e05252' }]}>{stats.absent}</Text>
          <Text style={[styles.statSub, { color: '#e05252' }]}>
            {total > 0 ? `${Math.round(absentPct)}%` : '0%'}
          </Text>
        </View>
      </View>

      {/* Visual percentage progress bar */}
      <View style={styles.progressBarWrapper}>
        <View style={styles.progressBar}>
          <View style={[styles.barSegment, { flex: stats.present, backgroundColor: '#16a36a' }]} />
          <View style={[styles.barSegment, { flex: stats.late, backgroundColor: '#d58b18' }]} />
          <View style={[styles.barSegment, { flex: stats.absent, backgroundColor: '#e05252' }]} />
          {total === 0 && <View style={[styles.barSegment, { flex: 1, backgroundColor: theme.border }]} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    paddingTop: 12,
    paddingBottom: 10,
    paddingHorizontal: 12,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
    borderRightWidth: 1,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 26,
  },
  statSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  progressBarWrapper: {
    marginTop: 10,
    paddingHorizontal: 4,
  },
  progressBar: {
    height: 6,
    borderRadius: 4,
    overflow: 'hidden',
    flexDirection: 'row',
    backgroundColor: '#e2e8f0',
  },
  barSegment: {
    height: '100%',
  },
});
