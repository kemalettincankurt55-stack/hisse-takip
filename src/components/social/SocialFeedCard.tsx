/**
 * SocialFeedCard
 * Bir hisse için sosyal medya gönderilerini (StockTwits/Reddit) sentiment
 * etiketleriyle listeler. Veri proxy üzerinden gelir; yoksa bilgilendirme gösterir.
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Spacing, Radius } from '../../constants/theme';
import { Card } from '../ui/Card';
import { Loading } from '../ui/Loading';
import { SocialPost, SocialSentiment } from '../../services/social/socialFeed';
import { formatRelativeTime } from '../../utils/formatters';

interface Props {
  posts: SocialPost[];
  isLoading: boolean;
  loaded: boolean;
}

const sentimentMeta = (s: SocialSentiment): { label: string; color: string } => {
  if (s === 'positive') return { label: 'Yükseliş', color: Colors.positive };
  if (s === 'negative') return { label: 'Düşüş', color: Colors.negative };
  return { label: 'Nötr', color: Colors.textMuted };
};

const sourceLabel = (source: SocialPost['source']) =>
  source === 'reddit' ? 'Reddit' : 'StockTwits';

export const SocialFeedCard: React.FC<Props> = ({ posts, isLoading, loaded }) => {
  return (
    <Card title="💬 Sosyal Medya" subtitle="StockTwits / Reddit" accent={Colors.accentPurple}>
      {isLoading ? (
        <Loading text="Sosyal medya yükleniyor..." />
      ) : posts.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="chatbubbles-outline" size={40} color={Colors.textMuted} />
          <Text style={styles.emptyText}>
            {loaded
              ? 'Bu hisse için sosyal medya gönderisi bulunamadı. (BIST hisseleri StockTwits’te sınırlıdır.)'
              : 'Sosyal medya için proxy çalışmıyor. `node server/socialProxy.mjs` ile başlatın.'}
          </Text>
        </View>
      ) : (
        posts.slice(0, 15).map((post) => {
          const meta = sentimentMeta(post.sentiment);
          return (
            <TouchableOpacity
              key={post.id}
              style={styles.post}
              activeOpacity={0.8}
              onPress={() => post.url && Linking.openURL(post.url)}
            >
              <View style={styles.postHeader}>
                <View style={styles.authorRow}>
                  <View style={[styles.sourceDot, { backgroundColor: Colors.accentPurple }]} />
                  <Text style={styles.author}>{post.author}</Text>
                  <Text style={styles.source}>· {sourceLabel(post.source)}</Text>
                </View>
                <View style={[styles.sentimentPill, { backgroundColor: meta.color + '1A' }]}>
                  <Text style={[styles.sentimentText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
              <Text style={styles.content} numberOfLines={4}>
                {post.content}
              </Text>
              <View style={styles.postFooter}>
                <Text style={styles.time}>{formatRelativeTime(post.publishedAt)}</Text>
                {post.likes > 0 && (
                  <View style={styles.likes}>
                    <Ionicons name="heart" size={12} color={Colors.textMuted} />
                    <Text style={styles.time}>{post.likes}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  empty: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  emptyText: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: Spacing.md,
  },
  post: {
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  sourceDot: { width: 6, height: 6, borderRadius: 3 },
  author: { fontSize: 13, fontWeight: '700', color: Colors.text },
  source: { fontSize: 12, color: Colors.textMuted },
  sentimentPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.pill,
  },
  sentimentText: { fontSize: 11, fontWeight: '700' },
  content: { fontSize: 13, color: Colors.textSecondary, lineHeight: 19 },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: 8,
  },
  time: { fontSize: 11, color: Colors.textMuted },
  likes: { flexDirection: 'row', alignItems: 'center', gap: 3 },
});

export default SocialFeedCard;
