/**
 * StockHeader Bileşeni
 * Hisse detay sayfası başlık bileşeni
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatCurrency, formatPercentChange, formatNumber } from '../../utils/formatters';
import { StockData } from '../../store/stockStore';

interface StockHeaderProps {
  stock: StockData;
  isOnWatchlist: boolean;
  onToggleWatchlist: () => void;
}

export const StockHeader: React.FC<StockHeaderProps> = ({
  stock,
  isOnWatchlist,
  onToggleWatchlist,
}) => {
  const isPositive = (stock.changePercent || 0) >= 0;
  const changeColor = isPositive ? Colors.positive : Colors.negative;

  return (
    <View style={styles.container}>
      <View style={styles.mainInfo}>
        <View style={styles.symbolRow}>
          <Text style={styles.symbol}>{stock.symbol}</Text>
          <View style={[styles.exchangeBadge, { backgroundColor: stock.exchange === 'BIST' ? Colors.primary : Colors.positive }]}>
            <Text style={styles.exchangeText}>{stock.exchange}</Text>
          </View>
        </View>
        <Text style={styles.name}>{stock.name}</Text>
        <Text style={styles.sector}>{stock.sector}</Text>
      </View>

      <View style={styles.priceSection}>
        <Text style={styles.price}>
          {stock.currentPrice
            ? formatCurrency(stock.currentPrice, stock.currency as 'TRY' | 'USD')
            : '-'}
        </Text>
        <View style={[styles.changeContainer, { backgroundColor: changeColor + '20' }]}>
          <Ionicons
            name={isPositive ? 'trending-up' : 'trending-down'}
            size={18}
            color={changeColor}
          />
          <Text style={[styles.changeText, { color: changeColor }]}>
            {stock.changePercent ? formatPercentChange(stock.changePercent) : '-'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Hacim</Text>
          <Text style={styles.statValue}>
            {stock.volume ? formatNumber(stock.volume) : '-'}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Para Birimi</Text>
          <Text style={styles.statValue}>{stock.currency}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.watchlistButton, isOnWatchlist && styles.watchlistButtonActive]}
        onPress={onToggleWatchlist}
      >
        <Ionicons
          name={isOnWatchlist ? 'star' : 'star-outline'}
          size={24}
          color={isOnWatchlist ? Colors.neutral : Colors.textSecondary}
        />
        <Text style={[styles.watchlistText, isOnWatchlist && styles.watchlistTextActive]}>
          {isOnWatchlist ? 'Takip Listesinde' : 'Takip Listesine Ekle'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  mainInfo: {
    marginBottom: 16,
  },
  symbolRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  symbol: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  exchangeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  exchangeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  name: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  sector: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  priceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  price: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.text,
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  changeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceLight,
    gap: 8,
  },
  watchlistButtonActive: {
    backgroundColor: Colors.neutral + '20',
  },
  watchlistText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  watchlistTextActive: {
    color: Colors.neutral,
  },
});

export default StockHeader;
