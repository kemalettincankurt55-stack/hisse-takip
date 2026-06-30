/**
 * AnalysisCard Bileşeni
 * Analiz raporu kartı bileşeni
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatRelativeTime } from '../../utils/formatters';

interface AnalysisCardProps {
  title: string;
  content: string;
  type: 'weekly' | 'daily' | 'stock' | 'bottom';
  stockSymbol?: string;
  stockName?: string;
  createdAt: string;
}

export const AnalysisCard: React.FC<AnalysisCardProps> = ({
  title,
  content,
  type,
  stockSymbol,
  stockName,
  createdAt,
}) => {
  const getTypeConfig = () => {
    switch (type) {
      case 'weekly':
        return { icon: 'calendar', color: Colors.primary, label: 'Haftalık Analiz' };
      case 'daily':
        return { icon: 'today', color: Colors.positive, label: 'Günlük Özet' };
      case 'stock':
        return { icon: 'analytics', color: Colors.warning, label: 'Hisse Analizi' };
      case 'bottom':
        return { icon: 'trending-down', color: Colors.bottom, label: 'Taban Tespiti' };
      default:
        return { icon: 'document-text', color: Colors.textSecondary, label: 'Analiz' };
    }
  };

  const config = getTypeConfig();

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon as any} size={16} color={config.color} />
          <Text style={[styles.typeText, { color: config.color }]}>{config.label}</Text>
        </View>
        <Text style={styles.time}>{formatRelativeTime(createdAt)}</Text>
      </View>

      {stockSymbol && (
        <View style={styles.stockInfo}>
          <Text style={styles.stockSymbol}>{stockSymbol}</Text>
          {stockName && <Text style={styles.stockName}>{stockName}</Text>}
        </View>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.content}>{content}</Text>

      <View style={styles.footer}>
        <View style={styles.aiIndicator}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.aiText}>AI Destekli Analiz</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 6,
  },
  typeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stockSymbol: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary,
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockName: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  content: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  aiIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiText: {
    fontSize: 12,
    color: Colors.primary,
    fontStyle: 'italic',
  },
});

export default AnalysisCard;
