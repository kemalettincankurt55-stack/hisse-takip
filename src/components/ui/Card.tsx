/**
 * Card Bileşeni
 * Derinlik (gölge), ince kenarlık ve aksan çizgili premium kart.
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/colors';
import { Radius, Spacing, Shadows, Typography } from '../../constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  /** Başlık solunda ince renkli aksan çizgisi gösterir. */
  accent?: string;
  /** Gölgesiz, daha düz varyant. */
  flat?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  title,
  subtitle,
  headerRight,
  accent = Colors.primary,
  flat = false,
}) => {
  const content = (
    <View style={[styles.card, !flat && Shadows.card, style]}>
      {(title || headerRight) && (
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            {title && (
              <View style={styles.titleRow}>
                <View style={[styles.accentBar, { backgroundColor: accent }]} />
                <View style={styles.titleTexts}>
                  <Text style={styles.title}>{title}</Text>
                  {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>
              </View>
            )}
          </View>
          {headerRight && <View>{headerRight}</View>}
        </View>
      )}
      {children}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  accentBar: {
    width: 4,
    height: 22,
    borderRadius: 2,
  },
  titleTexts: {
    flex: 1,
  },
  title: {
    ...Typography.h3,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});

export default Card;
