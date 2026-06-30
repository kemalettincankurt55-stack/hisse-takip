/**
 * BottomDetector Bileşeni
 * Taban tespit göstergesi bileşeni
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

interface BottomDetectorProps {
  symbol: string;
  stockName: string;
  days: number;
  currentPrice: number;
  lowestPrice: number;
  potential: 'high' | 'medium' | 'low';
  onPress?: () => void;
}

export const BottomDetector: React.FC<BottomDetectorProps> = ({
  symbol,
  stockName,
  days,
  currentPrice,
  lowestPrice,
  potential,
  onPress,
}) => {
  const getPotentialConfig = () => {
    switch (potential) {
      case 'high':
        return { color: Colors.positive, label: 'Yüksek Potansiyel', icon: 'trending-up' as const };
      case 'medium':
        return { color: Colors.warning, label: 'Orta Potansiyel', icon: 'remove' as const };
      case 'low':
        return { color: Colors.textSecondary, label: 'Düşük Potansiyel', icon: 'trending-down' as const };
    }
  };

  const config = getPotentialConfig();

  const Content = (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View style={[styles.iconContainer, { backgroundColor: Colors.bottom + '20' }]}>
          <Ionicons name="pulse" size={24} color={Colors.bottom} />
        </View>
        <View style={styles.info}>
          <View style={styles.symbolRow}>
            <Text style={styles.symbol}>{symbol}</Text>
            <Text style={styles.daysBadge}>{days} gün</Text>
          </View>
          <Text style={styles.name} numberOfLines={1}>{stockName}</Text>
          <Text style={styles.price}>₺{currentPrice.toFixed(2)}</Text>
        </View>
      </View>

      <View style={styles.rightSection}>
        <View style={[styles.potentialBadge, { backgroundColor: config.color + '20' }]}>
          <Ionicons name={config.icon} size={16} color={config.color} />
          <Text style={[styles.potentialText, { color: config.color }]}>{config.label}</Text>
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{Content}</TouchableOpacity>;
  }

  return Content;
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: Colors.bottom,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  daysBadge: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.bottom,
    backgroundColor: Colors.bottom + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  name: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 2,
  },
  rightSection: {
    alignItems: 'flex-end',
  },
  potentialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  potentialText: {
    fontSize: 10,
    fontWeight: '700',
  },
});

export default BottomDetector;
