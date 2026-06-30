/**
 * NewsCard Bileşeni
 * Haber kartı bileşeni
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { formatRelativeTime, formatSentiment } from '../../utils/formatters';
import { NewsItem } from '../../store/newsStore';

interface NewsCardProps {
  news: NewsItem;
  onPress?: () => void;
  showStock?: boolean;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  news,
  onPress,
  showStock = true,
}) => {
  const sentiment = news.sentiment ? formatSentiment(news.sentiment) : null;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (news.sourceUrl) {
      Linking.openURL(news.sourceUrl);
    }
  };

  const getNewsTypeIcon = (): string => {
    switch (news.newsType) {
      case 'kap':
        return 'document-text';
      case 'economic':
        return 'trending-up';
      case 'social':
        return 'chatbubbles';
      case 'forum':
        return 'people';
      default:
        return 'newspaper';
    }
  };

  const getNewsTypeColor = (): string => {
    switch (news.newsType) {
      case 'kap':
        return Colors.primary;
      case 'economic':
        return Colors.warning;
      case 'social':
        return Colors.positive;
      case 'forum':
        return Colors.neutral;
      default:
        return Colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.typeBadge, { backgroundColor: getNewsTypeColor() + '20' }]}>
          <Ionicons name={getNewsTypeIcon() as any} size={14} color={getNewsTypeColor()} />
          <Text style={[styles.typeText, { color: getNewsTypeColor() }]}>
            {news.newsType.toUpperCase()}
          </Text>
        </View>
        <Text style={styles.time}>{formatRelativeTime(news.publishedAt)}</Text>
      </View>

      {showStock && news.stockSymbol && (
        <View style={styles.stockBadge}>
          <Text style={styles.stockText}>{news.stockSymbol}</Text>
        </View>
      )}

      <Text style={styles.title} numberOfLines={2}>{news.title}</Text>
      
      {news.content && news.content !== news.title && (
        <Text style={styles.content} numberOfLines={3}>{news.content}</Text>
      )}

      <View style={styles.footer}>
        <View style={styles.sourceRow}>
          <Ionicons name="link" size={14} color={Colors.textMuted} />
          <Text style={styles.source}>{news.source}</Text>
        </View>
        
        {sentiment && (
          <View style={[styles.sentimentBadge, { backgroundColor: sentiment.color + '20' }]}>
            <Text style={[styles.sentimentText, { color: sentiment.color }]}>
              {sentiment.text}
            </Text>
          </View>
        )}
      </View>

      {news.aiSummary && (
        <View style={styles.aiSummary}>
          <Ionicons name="sparkles" size={14} color={Colors.primary} />
          <Text style={styles.aiSummaryText} numberOfLines={2}>{news.aiSummary}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
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
    gap: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  stockBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.primary,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  source: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  sentimentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sentimentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  aiSummary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 8,
  },
  aiSummaryText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default NewsCard;
