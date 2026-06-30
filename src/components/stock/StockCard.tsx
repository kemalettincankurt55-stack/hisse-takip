/**
 * StockCard Bileşeni
 * Gradient avatar, değişim pill'i ve derinlikli premium hisse kartı.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Radius, Spacing, Shadows } from '../../constants/theme';
import { formatCurrency, formatPercentChange, formatLargeNumber } from '../../utils/formatters';
import { StockData } from '../../store/stockStore';

interface StockCardProps {
  stock: StockData;
  onPress: () => void;
  onAddToWatchlist?: () => void;
  onRemoveFromWatchlist?: () => void;
  isOnWatchlist?: boolean;
}

export const StockCard: React.FC<StockCardProps> = ({
  stock,
  onPress,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  isOnWatchlist = false,
}) => {
  const isPositive = (stock.changePercent || 0) >= 0;
  const changeColor = isPositive ? Colors.positive : Colors.negative;
  const avatarColor = stock.exchange === 'BIST' ? Colors.primary : Colors.accentPurple;

  return (
    <TouchableOpacity style={[styles.card, Shadows.card]} onPress={onPress} activeOpacity={0.85}>
      {/* Avatar — ince tonlu */}
      <View style={[styles.avatar, { backgroundColor: avatarColor + '1F', borderColor: avatarColor + '33' }]}>
        <Text style={[styles.avatarText, { color: avatarColor }]}>{stock.symbol.slice(0, 2)}</Text>
      </View>

      {/* Orta blok */}
      <View style={styles.middle}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <View style={styles.exchangeBadge}>
            <Text style={styles.exchangeText}>{stock.exchange}</Text>
          </View>
        </View>
        <Text style={styles.name} numberOfLines={1}>{stock.name}</Text>
        <Text style={styles.sector} numberOfLines={1}>
          {stock.sector}
          {stock.volume ? `  ·  Hacim ${formatLargeNumber(stock.volume)}` : ''}
        </Text>
      </View>

      {/* Sağ blok */}
      <View style={styles.right}>
        <Text style={styles.price}>
          {stock.currentPrice
            ? formatCurrency(stock.currentPrice, stock.currency as 'TRY' | 'USD')
            : '—'}
        </Text>
        <View style={[styles.changePill, { backgroundColor: changeColor + '1F' }]}>
          <Ionicons name={isPositive ? 'caret-up' : 'caret-down'} size={12} color={changeColor} />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {stock.changePercent !== undefined ? formatPercentChange(stock.changePercent) : '—'}
          </Text>
        </View>
      </View>

      {onAddToWatchlist && (
        <TouchableOpacity
          style={styles.watchlistButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={(e) => {
            e.stopPropagation?.();
            if (isOnWatchlist) onRemoveFromWatchlist?.();
            else onAddToWatchlist();
          }}
        >
          <Ionicons
            name={isOnWatchlist ? 'star' : 'star-outline'}
            size={20}
            color={isOnWatchlist ? Colors.neutral : Colors.textMuted}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  middle: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  symbol: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.3,
  },
  exchangeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  exchangeText: {
    fontSize: 9,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 3,
  },
  sector: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
  },
  right: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.text,
  },
  changePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    marginTop: 5,
    gap: 2,
  },
  changeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  watchlistButton: {
    padding: Spacing.sm,
    marginLeft: Spacing.xs,
  },
});

export default StockCard;
