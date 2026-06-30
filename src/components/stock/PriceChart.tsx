/**
 * PriceChart Bileşeni
 * Fiyat grafiği - Candlestick ve Line chart
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { PricePoint } from '../../store/stockStore';
import { formatCurrency } from '../../utils/formatters';

interface PriceChartProps {
  data: PricePoint[];
  currency?: 'TRY' | 'USD';
  height?: number;
}

export const PriceChart: React.FC<PriceChartProps> = ({
  data,
  currency = 'TRY',
  height = 220,
}) => {
  if (data.length === 0) {
    return (
      <View style={[styles.container, { height }]}>
        <Text style={styles.emptyText}>Grafik verisi bulunamadı</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width - 64;

  // Grafik verilerini hazırla
  const chartData = {
    labels: data.slice(-7).map(d => {
      const date = new Date(d.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: data.slice(-7).map(d => d.close),
        color: () => Colors.primary,
        strokeWidth: 2,
      },
    ],
  };

  // Son fiyat ve değişim
  const lastPrice = data[data.length - 1].close;
  const firstPrice = data[0].close;
  const totalChange = ((lastPrice - firstPrice) / firstPrice) * 100;
  const isPositive = totalChange >= 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Son Fiyat</Text>
          <Text style={styles.price}>{formatCurrency(lastPrice, currency)}</Text>
        </View>
        <View style={styles.changeContainer}>
          <Text style={[styles.changeText, { color: isPositive ? Colors.positive : Colors.negative }]}>
            {isPositive ? '+' : ''}{totalChange.toFixed(2)}%
          </Text>
          <Text style={styles.periodText}>Son 7 gün</Text>
        </View>
      </View>

      <LineChart
        data={chartData}
        width={screenWidth}
        height={height}
        chartConfig={{
          backgroundColor: Colors.surface,
          backgroundGradientFrom: Colors.surface,
          backgroundGradientTo: Colors.surface,
          decimalPlaces: currency === 'TRY' ? 2 : 2,
          color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
          labelColor: () => Colors.textSecondary,
          style: {
            borderRadius: 16,
          },
          propsForDots: {
            r: '4',
            strokeWidth: '2',
            stroke: Colors.primary,
          },
          propsForBackgroundLines: {
            strokeDasharray: '',
            stroke: Colors.border,
            strokeWidth: 1,
          },
        }}
        bezier
        style={styles.chart}
      />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>En Yüksek</Text>
          <Text style={styles.statValue}>
            {formatCurrency(Math.max(...data.map(d => d.high)), currency)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>En Düşük</Text>
          <Text style={styles.statValue}>
            {formatCurrency(Math.min(...data.map(d => d.low)), currency)}
          </Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Ortalama</Text>
          <Text style={styles.statValue}>
            {formatCurrency(data.reduce((a, d) => a + d.close, 0) / data.length, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  changeContainer: {
    alignItems: 'flex-end',
  },
  changeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  periodText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.textSecondary,
    padding: 40,
  },
});

export default PriceChart;
