/**
 * EconomicCalendarCard
 * Yaklaşan ekonomik olayları (TÜFE, faiz kararları, istihdam vb.) listeler.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/theme';
import { Card } from '../ui/Card';
import { getUpcomingEvents, EconomicEvent } from '../../services/economicCalendar';

const impactColor = (i: EconomicEvent['impact']) =>
  i === 'high' ? Colors.negative : i === 'medium' ? Colors.neutral : Colors.textMuted;

const flag = (c: EconomicEvent['country']) => (c === 'TR' ? '🇹🇷' : '🇺🇸');

const formatDay = (isoDate: string): string => {
  const d = new Date(isoDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return 'Bugün';
  if (diff === 1) return 'Yarın';
  return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', weekday: 'short' });
};

export const EconomicCalendarCard: React.FC = () => {
  const events = useMemo(() => getUpcomingEvents(45).slice(0, 8), []);
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <Card title="📅 Ekonomik Takvim" subtitle="Detay için dokun" accent={Colors.neutral}>
      {events.length === 0 ? (
        <Text style={styles.empty}>Yaklaşan olay yok</Text>
      ) : (
        events.map((e) => {
          const open = expanded === e.id;
          return (
            <View key={e.id}>
              <TouchableOpacity
                style={styles.row}
                activeOpacity={0.7}
                onPress={() => setExpanded(open ? null : e.id)}
              >
                <View style={[styles.impactBar, { backgroundColor: impactColor(e.impact) }]} />
                <View style={styles.dateBox}>
                  <Text style={styles.dateText}>{formatDay(e.date)}</Text>
                  {e.time && <Text style={styles.timeText}>{e.time}</Text>}
                </View>
                <View style={styles.info}>
                  <Text style={styles.name} numberOfLines={2}>
                    {flag(e.country)} {e.name}{e.approximate ? ' (~)' : ''}
                  </Text>
                </View>
                <View style={[styles.impactPill, { backgroundColor: impactColor(e.impact) + '1A' }]}>
                  <Text style={[styles.impactText, { color: impactColor(e.impact) }]}>
                    {e.impact === 'high' ? 'Yüksek' : e.impact === 'medium' ? 'Orta' : 'Düşük'}
                  </Text>
                </View>
                <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textMuted} />
              </TouchableOpacity>
              {open && (
                <View style={styles.descBox}>
                  <Text style={styles.descText}>{e.description}</Text>
                </View>
              )}
            </View>
          );
        })
      )}
      <Text style={styles.note}>~ işaretli tarihler yaklaşık; resmi açıklamalarla değişebilir.</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  empty: { color: Colors.textSecondary, fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
  },
  impactBar: { width: 3, height: 34, borderRadius: 2 },
  dateBox: { width: 66 },
  dateText: { fontSize: 12, fontWeight: '700', color: Colors.text },
  timeText: { fontSize: 11, color: Colors.textMuted, marginTop: 1 },
  info: { flex: 1 },
  name: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  impactPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.pill },
  impactText: { fontSize: 10, fontWeight: '700' },
  descBox: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  descText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  note: { fontSize: 11, color: Colors.textMuted, marginTop: Spacing.md, fontStyle: 'italic' },
});

export default EconomicCalendarCard;
