/**
 * DetailedChart
 * "En detaylı" fiyat grafiği:
 *  - Dönem seçici (1A / 3A / 6A — mevcut veriye göre)
 *  - Fiyat + SMA20 + SMA50 + Bollinger üst/alt bant overlay'leri
 *  - Ayrı RSI(14) alt grafiği (30/70 referans bölgeleri)
 *  - Hacim bar grafiği
 *
 * react-native-chart-kit LineChart çoklu dataset desteğini kullanır.
 * Göstergeler fiyat penceresine `alignTail` ile hizalanır.
 */

import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { PricePoint } from '../../store/stockStore';
import { formatCurrency, formatLargeNumber } from '../../utils/formatters';
import {
  calculateSMA,
  calculateRSI,
  calculateBollingerBands,
} from '../../utils/calculations';

interface Props {
  data: PricePoint[];
  currency?: 'TRY' | 'USD';
}

type PeriodKey = '1A' | '3A' | '6A';
const PERIODS: { key: PeriodKey; days: number; label: string }[] = [
  { key: '1A', days: 22, label: '1 Ay' },
  { key: '3A', days: 66, label: '3 Ay' },
  { key: '6A', days: 132, label: '6 Ay' },
];

/** Bir göstergeyi fiyat penceresinin son W değerine hizalar; kısa ise baştan doldurur. */
const alignTail = (series: number[], w: number): number[] => {
  if (series.length === 0) return new Array(w).fill(0);
  if (series.length >= w) return series.slice(-w);
  const pad = new Array(w - series.length).fill(series[0]);
  return [...pad, ...series];
};

const toAscending = (history: PricePoint[]): PricePoint[] => {
  const copy = [...history];
  copy.sort((a, b) => {
    const ta = new Date(a.date).getTime();
    const tb = new Date(b.date).getTime();
    if (Number.isNaN(ta) || Number.isNaN(tb)) return 0;
    return ta - tb;
  });
  return copy;
};

export const DetailedChart: React.FC<Props> = ({ data, currency = 'TRY' }) => {
  const [period, setPeriod] = useState<PeriodKey>('3A');

  const ascending = useMemo(() => toAscending(data), [data]);
  const screenWidth = Dimensions.get('window').width - 64;

  const view = useMemo(() => {
    if (ascending.length < 2) return null;
    const days = PERIODS.find((p) => p.key === period)!.days;
    const w = Math.min(days, ascending.length);
    const windowData = ascending.slice(-w);
    const closes = ascending.map((d) => d.close);

    // Göstergeleri TÜM seri üzerinde hesaplayıp pencereye hizala
    const sma20Full = calculateSMA(closes, 20);
    const sma50Full = calculateSMA(closes, 50);
    const rsiFull = calculateRSI(closes, 14);
    const bb = calculateBollingerBands(closes, 20, 2);

    return {
      windowData,
      w,
      closeWindow: windowData.map((d) => d.close),
      sma20: alignTail(sma20Full, w),
      sma50: alignTail(sma50Full, w),
      bbUpper: alignTail(bb.upper, w),
      bbLower: alignTail(bb.lower, w),
      rsi: alignTail(rsiFull, w),
      volume: windowData.map((d) => d.volume || 0),
    };
  }, [ascending, period]);

  if (!view) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Grafik için yeterli veri yok</Text>
      </View>
    );
  }

  // X ekseni etiketleri: ~6 etiket göster, gerisini boş bırak
  const labelEvery = Math.max(1, Math.floor(view.w / 6));
  const labels = view.windowData.map((d, i) => {
    if (i % labelEvery !== 0 && i !== view.w - 1) return '';
    const dt = new Date(d.date);
    return `${dt.getDate()}/${dt.getMonth() + 1}`;
  });

  const baseConfig = {
    backgroundColor: Colors.surface,
    backgroundGradientFrom: Colors.surface,
    backgroundGradientTo: Colors.surface,
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`,
    labelColor: () => Colors.textSecondary,
    propsForDots: { r: '0' },
    propsForBackgroundLines: { stroke: Colors.border, strokeDasharray: '' },
  };

  const lastClose = view.closeWindow[view.closeWindow.length - 1];
  const firstClose = view.closeWindow[0];
  const change = ((lastClose - firstClose) / firstClose) * 100;
  const isPos = change >= 0;
  const lastRsi = view.rsi[view.rsi.length - 1];

  return (
    <View style={styles.container}>
      {/* Başlık */}
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>Son Fiyat</Text>
          <Text style={styles.price}>{formatCurrency(lastClose, currency)}</Text>
        </View>
        <View style={styles.changeBox}>
          <Text style={[styles.change, { color: isPos ? Colors.positive : Colors.negative }]}>
            {isPos ? '+' : ''}{change.toFixed(2)}%
          </Text>
          <Text style={styles.periodHint}>{PERIODS.find((p) => p.key === period)!.label}</Text>
        </View>
      </View>

      {/* Dönem seçici */}
      <View style={styles.periodRow}>
        {PERIODS.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[styles.periodBtn, period === p.key && styles.periodBtnActive]}
            onPress={() => setPeriod(p.key)}
          >
            <Text style={[styles.periodBtnText, period === p.key && styles.periodBtnTextActive]}>
              {p.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Fiyat + hareketli ortalamalar + Bollinger */}
      <LineChart
        data={{
          labels,
          datasets: [
            { data: view.closeWindow, color: (o = 1) => `rgba(59,130,246,${o})`, strokeWidth: 2 },
            { data: view.sma20, color: (o = 1) => `rgba(34,197,94,${o})`, strokeWidth: 1 },
            { data: view.sma50, color: (o = 1) => `rgba(245,158,11,${o})`, strokeWidth: 1 },
            { data: view.bbUpper, color: (o = 0.4) => `rgba(139,92,246,${o})`, strokeWidth: 1 },
            { data: view.bbLower, color: (o = 0.4) => `rgba(139,92,246,${o})`, strokeWidth: 1 },
          ],
          legend: ['Fiyat', 'SMA20', 'SMA50', 'BB Üst', 'BB Alt'],
        }}
        width={screenWidth}
        height={240}
        chartConfig={baseConfig}
        withDots={false}
        style={styles.chart}
      />

      {/* RSI alt grafiği */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>RSI (14)</Text>
        <Text
          style={[
            styles.subValue,
            { color: lastRsi <= 30 ? Colors.positive : lastRsi >= 70 ? Colors.negative : Colors.text },
          ]}
        >
          {lastRsi.toFixed(1)}
        </Text>
      </View>
      <LineChart
        data={{
          labels,
          datasets: [
            { data: view.rsi, color: (o = 1) => `rgba(139,92,246,${o})`, strokeWidth: 2 },
            { data: new Array(view.w).fill(70), color: (o = 0.5) => `rgba(239,68,68,${o})`, strokeWidth: 1 },
            { data: new Array(view.w).fill(30), color: (o = 0.5) => `rgba(34,197,94,${o})`, strokeWidth: 1 },
          ],
        }}
        width={screenWidth}
        height={130}
        chartConfig={{ ...baseConfig, decimalPlaces: 0 }}
        withDots={false}
        fromZero
        segments={4}
        style={styles.chart}
      />

      {/* Hacim */}
      <View style={styles.subHeader}>
        <Text style={styles.subTitle}>Hacim</Text>
        <Text style={styles.subValue}>{formatLargeNumber(view.volume[view.volume.length - 1])}</Text>
      </View>
      <BarChart
        data={{ labels, datasets: [{ data: view.volume }] }}
        width={screenWidth}
        height={120}
        yAxisLabel=""
        yAxisSuffix=""
        chartConfig={{
          ...baseConfig,
          decimalPlaces: 0,
          color: (o = 1) => `rgba(100,116,139,${o})`,
          formatYLabel: (y) => formatLargeNumber(Number(y)),
        }}
        style={styles.chart}
        fromZero
        withInnerLines={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16, marginBottom: 12 },
  empty: { backgroundColor: Colors.surface, borderRadius: 16, padding: 40, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  label: { fontSize: 13, color: Colors.textSecondary },
  price: { fontSize: 26, fontWeight: '700', color: Colors.text, marginTop: 2 },
  changeBox: { alignItems: 'flex-end' },
  change: { fontSize: 18, fontWeight: '700' },
  periodHint: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  periodRow: { flexDirection: 'row', gap: 8, marginVertical: 12 },
  periodBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: Colors.surfaceLight,
  },
  periodBtnActive: { backgroundColor: Colors.primary },
  periodBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },
  periodBtnTextActive: { color: Colors.text },
  chart: { marginVertical: 8, borderRadius: 16 },
  subHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  subTitle: { fontSize: 14, fontWeight: '700', color: Colors.text },
  subValue: { fontSize: 14, fontWeight: '700', color: Colors.text },
});

export default DetailedChart;
