/**
 * AIAnalysisCard
 * Hisse için yapay zeka (Gemini) yorumu. İstek üzerine analiz üretir;
 * teknik göstergeler + sosyal duyarlılık girdi olarak verilir.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/theme';
import { Card } from '../ui/Card';

interface Props {
  text: string | null;
  isLoading: boolean;
  provider: string;
  onGenerate: () => void;
}

export const AIAnalysisCard: React.FC<Props> = ({ text, isLoading, provider, onGenerate }) => {
  return (
    <Card
      title="🤖 AI Yorumu"
      subtitle={`${provider} ile teknik + duyarlılık analizi`}
      accent={Colors.accentPurple}
    >
      {text ? (
        <>
          <Text style={styles.text}>{text}</Text>
          <TouchableOpacity style={styles.regen} onPress={onGenerate} disabled={isLoading}>
            <Ionicons name="refresh" size={14} color={Colors.textSecondary} />
            <Text style={styles.regenText}>Yeniden üret</Text>
          </TouchableOpacity>
        </>
      ) : isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accentPurple} />
          <Text style={styles.loadingText}>AI analiz ediyor…</Text>
        </View>
      ) : (
        <TouchableOpacity style={styles.button} onPress={onGenerate} activeOpacity={0.85}>
          <Ionicons name="sparkles" size={18} color={Colors.text} />
          <Text style={styles.buttonText}>AI ile Analiz Et</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.disclaimer}>
        AI yorumu yalnızca teknik göstergelere dayanır; yatırım tavsiyesi değildir.
      </Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 21,
  },
  center: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  loadingText: { fontSize: 13, color: Colors.textSecondary },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.accentPurple,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  buttonText: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  regen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: Spacing.md,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceLight,
  },
  regenText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  disclaimer: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.md,
    fontStyle: 'italic',
  },
});

export default AIAnalysisCard;
