/**
 * TechnicalReportCard
 * Bir hissenin teknik analiz raporunu detaylı şekilde gösterir:
 * sinyal rozeti, skor çubuğu, gösterge ızgarası, boğa/ayı faktörleri ve özet.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Card } from '../ui/Card';
import { TechnicalReport, SignalStrength } from '../../services/analysis/technicalReport';

interface Props {
  report: TechnicalReport;
}

const signalColor = (signal: SignalStrength): string => {
  switch (signal) {
    case 'GÜÇLÜ AL':
      return Colors.positive;
    case 'AL':
      return '#4ADE80';
    case 'SAT':
      return '#F87171';
    case 'GÜÇLÜ SAT':
      return Colors.negative;
    default:
      return Colors.neutral;
  }
};

const Indicator = ({ label, value, color }: { label: string; value: string; color?: string }) => (
  <View style={styles.indicator}>
    <Text style={styles.indicatorLabel}>{label}</Text>
    <Text style={[styles.indicatorValue, color ? { color } : null]}>{value}</Text>
  </View>
);

export const TechnicalReportCard: React.FC<Props> = ({ report }) => {
  const title = `📊 ${report.symbol ?? 'Teknik Rapor'}`;

  if (!report.hasEnoughData || !report.snapshot) {
    return (
      <Card title={title} subtitle="Teknik analiz">
        <Text style={styles.emptyText}>{report.summary}</Text>
      </Card>
    );
  }

  const s = report.snapshot;
  const color = signalColor(report.signal);
  // Skoru 0..100 çubuk genişliğine çevir (-100..100 → 0..100)
  const barWidth = Math.round((report.score + 100) / 2);

  const rsiColor =
    s.rsi === null
      ? Colors.textSecondary
      : s.rsi <= 30
      ? Colors.positive
      : s.rsi >= 70
      ? Colors.negative
      : Colors.text;

  return (
    <Card title={title} subtitle={`Bileşik skor ${report.score}/100`}>
      {/* Sinyal rozeti */}
      <View style={styles.signalRow}>
        <View style={[styles.signalBadge, { backgroundColor: color + '22', borderColor: color }]}>
          <Ionicons
            name={report.score >= 18 ? 'trending-up' : report.score <= -18 ? 'trending-down' : 'remove'}
            size={18}
            color={color}
          />
          <Text style={[styles.signalText, { color }]}>{report.signal}</Text>
        </View>
        <Text style={styles.trendText}>Trend: {s.trend}</Text>
      </View>

      {/* Skor çubuğu */}
      <View style={styles.scoreBarTrack}>
        <View style={[styles.scoreBarFill, { width: `${barWidth}%`, backgroundColor: color }]} />
      </View>
      <View style={styles.scoreScale}>
        <Text style={styles.scaleText}>Sat</Text>
        <Text style={styles.scaleText}>Nötr</Text>
        <Text style={styles.scaleText}>Al</Text>
      </View>

      {/* Gösterge ızgarası */}
      <View style={styles.grid}>
        <Indicator label="Fiyat" value={`${s.lastClose}`} />
        <Indicator label="RSI(14)" value={s.rsi !== null ? `${s.rsi}` : '—'} color={rsiColor} />
        <Indicator
          label="MACD"
          value={s.macdCross === 'al' ? 'AL ▲' : s.macdCross === 'sat' ? 'SAT ▼' : 'nötr'}
          color={s.macdCross === 'al' ? Colors.positive : s.macdCross === 'sat' ? Colors.negative : Colors.text}
        />
        <Indicator label="SMA20" value={s.sma20 !== null ? `${s.sma20}` : '—'} />
        <Indicator label="SMA50" value={s.sma50 !== null ? `${s.sma50}` : '—'} />
        <Indicator
          label="MA Kesişim"
          value={s.maCross === 'altın kesişim' ? 'Altın ✨' : s.maCross === 'ölüm kesişimi' ? 'Ölüm ⚠️' : '—'}
          color={s.maCross === 'altın kesişim' ? Colors.positive : s.maCross === 'ölüm kesişimi' ? Colors.negative : Colors.text}
        />
        <Indicator label="Destek" value={`${s.support}`} color={Colors.positive} />
        <Indicator label="Direnç" value={`${s.resistance}`} color={Colors.negative} />
        <Indicator label="Volatilite" value={`%${s.volatility}`} />
      </View>

      {/* Boğa faktörleri */}
      {report.bullishFactors.length > 0 && (
        <View style={styles.factorBlock}>
          <Text style={[styles.factorTitle, { color: Colors.positive }]}>▲ Olumlu</Text>
          {report.bullishFactors.map((f, i) => (
            <Text key={`b${i}`} style={styles.factorText}>• {f}</Text>
          ))}
        </View>
      )}

      {/* Ayı faktörleri */}
      {report.bearishFactors.length > 0 && (
        <View style={styles.factorBlock}>
          <Text style={[styles.factorTitle, { color: Colors.negative }]}>▼ Olumsuz</Text>
          {report.bearishFactors.map((f, i) => (
            <Text key={`r${i}`} style={styles.factorText}>• {f}</Text>
          ))}
        </View>
      )}

      {/* Özet */}
      <Text style={styles.summary}>{report.summary}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  signalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  signalText: {
    fontSize: 15,
    fontWeight: '800',
  },
  trendText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  scoreBarTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.surfaceLight,
    overflow: 'hidden',
  },
  scoreBarFill: {
    height: 8,
    borderRadius: 4,
  },
  scoreScale: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  scaleText: {
    fontSize: 10,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  indicator: {
    width: '33.33%',
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  indicatorLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginBottom: 2,
  },
  indicatorValue: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  factorBlock: {
    marginTop: 12,
  },
  factorTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  factorText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  summary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 14,
    fontStyle: 'italic',
  },
});

export default TechnicalReportCard;
