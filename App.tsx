/**
 * Ana Uygulama Giriş Noktası
 * Borsa Takip Uygulaması
 */

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, RefreshControl, Modal, Switch, TextInput, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from './src/constants/colors';
import { Spacing, Radius, Shadows, Gradients, Typography } from './src/constants/theme';
import { useStocks } from './src/hooks/useStocks';
import { useNews } from './src/hooks/useNews';
import { useAI } from './src/hooks/useAI';
import { StockCard } from './src/components/stock/StockCard';
import { NewsCard } from './src/components/news/NewsCard';
import { BottomDetector } from './src/components/analysis/BottomDetector';
import { TechnicalReportCard } from './src/components/analysis/TechnicalReportCard';
import { AIAnalysisCard } from './src/components/analysis/AIAnalysisCard';
import { EconomicCalendarCard } from './src/components/analysis/EconomicCalendarCard';
import { analyzeStock as aiAnalyzeStock, generateWeeklyAnalysis, providerLabel } from './src/services/ai/aiProvider';
import { DetailedChart } from './src/components/stock/DetailedChart';
import { SocialFeedCard } from './src/components/social/SocialFeedCard';
import { useSocialPosts } from './src/hooks/useSocialPosts';
import { usePriceHistory, usePriceHistories } from './src/hooks/usePriceHistory';
import { useMarketSummary } from './src/hooks/useMarketSummary';
import { useWeeklyMovers } from './src/hooks/useWeeklyMovers';
import { Loading } from './src/components/ui/Loading';
import { Card } from './src/components/ui/Card';
import { useTechnicalReports } from './src/hooks/useTechnicalReports';
import { ALL_STOCKS } from './src/constants/stockList';
import { StockData } from './src/store/stockStore';
import { generateTechnicalReport } from './src/services/analysis/technicalReport';
import { notifyNews, requestNotificationPermission, scheduleDailyDigest, cancelDailyDigest } from './src/utils/notifications';
import { useSettingsStore } from './src/store/settingsStore';

// Sakin piyasa metrik kartı (koyu yüzey + ince renkli aksan)
const MetricCard = ({
  accent,
  label,
  value,
  change,
  up,
  icon,
}: {
  accent: string;
  label: string;
  value: string;
  change: string;
  up: boolean;
  icon: string;
}) => {
  const changeColor = up ? Colors.positive : Colors.negative;
  return (
    <View style={[styles.metricCard, Shadows.card]}>
      <View style={styles.metricTop}>
        <View style={[styles.metricIcon, { backgroundColor: accent + '1F' }]}>
          <Ionicons name={icon as any} size={14} color={accent} />
        </View>
        <View style={[styles.metricChangePill, { backgroundColor: changeColor + '1A' }]}>
          <Ionicons name={up ? 'caret-up' : 'caret-down'} size={9} color={changeColor} />
          <Text style={[styles.metricChangeText, { color: changeColor }]}>{change}</Text>
        </View>
      </View>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'home' | 'watchlist' | 'news' | 'analysis' | 'settings'>('home');
  const [refreshing, setRefreshing] = useState(false);
  const [detailStock, setDetailStock] = useState<StockData | null>(null);
  const [newsDetail, setNewsDetail] = useState<import('./src/store/newsStore').NewsItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiAnalysisLoading, setAiAnalysisLoading] = useState(false);
  const [weeklyReport, setWeeklyReport] = useState<string | null>(null);
  const [weeklyLoading, setWeeklyLoading] = useState(false);

  const {
    stocks,
    watchlist,
    isLoading: stocksLoading,
    refreshStocks,
    addToWatchlist,
    removeFromWatchlist,
    isOnWatchlist,
  } = useStocks();

  const {
    news,
    filteredNews,
    activeFilter,
    setFilter,
    usingSampleNews,
    isLoading: newsLoading,
    refreshNews,
  } = useNews();

  const {
    isConnected: aiConnected,
    isLoading: aiLoading,
  } = useAI();

  // Analiz için kaynak hisse listesi: canlı veri varsa onu, yoksa sabit listeyi kullan
  const reportStocks: StockData[] = useMemo(() => {
    if (stocks.length > 0) return stocks;
    return ALL_STOCKS.map((s, i) => ({
      id: i,
      symbol: s.symbol,
      name: s.name,
      exchange: s.exchange,
      sector: s.sector,
      currency: s.currency,
    }));
  }, [stocks]);

  // Ana sayfa piyasa özeti (gerçek endeks/kur)
  const marketMetrics = useMarketSummary();

  // Haftalık en çok yükselen/düşen hisseler (Takip sekmesi)
  const movers = useWeeklyMovers(reportStocks, 5);

  // Ayarlar (kalıcı)
  const {
    settings,
    togglePushNotifications,
    toggleDailyDigest,
    toggleWeeklyAnalysis,
    toggleBottomDetection,
    toggleNewsAlerts,
    toggleBIST,
    toggleUS,
    toggleForex,
  } = useSettingsStore();

  // Günlük özet bildirimini ayara göre planla/iptal et
  useEffect(() => {
    if (settings.dailyDigest) void scheduleDailyDigest(18, 0);
    else void cancelDailyDigest();
  }, [settings.dailyDigest]);

  // Analiz taraması için gerçek fiyat geçmişi (ilk 10 hisse), yoksa demo
  const { historyBySymbol } = usePriceHistories(reportStocks, 10);

  const {
    reports,
    alerts,
    usingSampleData,
    notifyAlerts,
  } = useTechnicalReports(reportStocks, {
    limit: 12,
    autoNotify: settings.pushNotifications,
    bottomAlerts: settings.bottomDetectionAlerts,
    priceHistoryBySymbol: historyBySymbol,
  });

  // Detay ekranı için GERÇEK fiyat geçmişi (Yahoo via proxy), yoksa demo
  const detailPrice = usePriceHistory(
    detailStock?.symbol,
    detailStock?.exchange || '',
    (detailStock?.currency as 'TRY' | 'USD') || 'TRY',
  );
  const detailData = useMemo(() => {
    if (!detailStock || detailPrice.history.length === 0) return null;
    const report = generateTechnicalReport(detailPrice.history, detailStock.symbol);
    return { history: detailPrice.history, report };
  }, [detailStock, detailPrice.history]);

  // Detay ekranındaki hisse için sosyal medya gönderileri
  const { posts: socialPosts, isLoading: socialLoading, loaded: socialLoaded } = useSocialPosts(detailStock?.symbol);

  // Hisse değişince eski AI yorumunu temizle
  useEffect(() => {
    setAiText(null);
  }, [detailStock?.symbol]);

  // AI yorumu üret (teknik göstergeler + sosyal duyarlılık girdi)
  const runAIAnalysis = async () => {
    if (!detailStock || !detailData?.report.snapshot) return;
    const s = detailData.report.snapshot;
    const r = detailData.report;
    const prices = [
      `Şirket: ${detailPrice.name || detailStock.name} — Borsa İstanbul sembolü ${detailStock.symbol}. Yalnızca bu şirket hakkında yorum yap, başka şirketle karıştırma.`,
      `Güncel fiyat: ${s.lastClose}`,
      `Trend: ${s.trend}`,
      `RSI(14): ${s.rsi} (${s.rsiState})`,
      `MACD: ${s.macdCross === 'al' ? 'al sinyali' : s.macdCross === 'sat' ? 'sat sinyali' : 'nötr'}`,
      `SMA20: ${s.sma20}, SMA50: ${s.sma50}, MA kesişim: ${s.maCross}`,
      `Bollinger: ${s.bollingerState}`,
      `Destek: ${s.support}, Direnç: ${s.resistance}, Volatilite: %${s.volatility}`,
      s.bottom ? `Konsolidasyon: ${s.bottom.days} gündür dar bantta taban (limit-down DEĞİL)` : 'Belirgin taban yok',
      `Bileşik teknik sinyal: ${r.signal} (skor ${r.score}/100)`,
    ].join('\n');
    const pos = socialPosts.filter((p) => p.sentiment === 'positive').length;
    const neg = socialPosts.filter((p) => p.sentiment === 'negative').length;
    const news =
      socialPosts.length > 0
        ? `Sosyal medya duyarlılığı (StockTwits/Reddit): ${pos} olumlu, ${neg} olumsuz, toplam ${socialPosts.length} gönderi.`
        : 'Sosyal medya verisi yok.';

    const realName = detailPrice.name || detailStock.name;
    const stockLabel = `${realName} (Borsa İstanbul sembolü: ${detailStock.symbol})`;
    setAiAnalysisLoading(true);
    try {
      const text = await aiAnalyzeStock(stockLabel, prices, news);
      setAiText(text);
    } catch (e: any) {
      setAiText(`AI analizi yapılamadı: ${e?.message || 'bilinmeyen hata'}`);
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // Haftalık AI piyasa analizi üret (movers + sinyaller + haberler girdi)
  const runWeeklyAnalysis = async () => {
    const buy = reports.filter(r => r.signal === 'AL' || r.signal === 'GÜÇLÜ AL').length;
    const sell = reports.filter(r => r.signal === 'SAT' || r.signal === 'GÜÇLÜ SAT').length;
    const bistData = [
      `En çok yükselenler: ${movers.gainers.slice(0, 5).map(g => `${g.symbol} %${g.changePercent}`).join(', ') || 'veri yok'}.`,
      `En çok düşenler: ${movers.losers.slice(0, 5).map(g => `${g.symbol} %${g.changePercent}`).join(', ') || 'veri yok'}.`,
      `Teknik tarama: ${buy} hissede AL, ${sell} hissede SAT sinyali (toplam ${reports.length}).`,
    ].join('\n');
    const usData = marketMetrics.map(m => `${m.label}: ${m.value} (%${m.changePercent})`).join(', ');
    const economicNews = news.slice(0, 6).map(n => `- ${n.title}`).join('\n');

    setWeeklyLoading(true);
    try {
      const text = await generateWeeklyAnalysis(bistData, usData, economicNews);
      setWeeklyReport(text);
    } catch (e: any) {
      setWeeklyReport(`Haftalık analiz üretilemedi: ${e?.message || 'bilinmeyen hata'}`);
    } finally {
      setWeeklyLoading(false);
    }
  };

  // Açılışta bildirim izni iste (anlık bildirimler için)
  useEffect(() => {
    void requestNotificationPermission();
  }, []);

  // Haberler yüklendiğinde en güncel önemli haberi otomatik bildir (oturumda bir kez)
  const lastNotifiedNewsId = useRef<number | null>(null);
  useEffect(() => {
    if (!settings.newsAlerts || news.length === 0) return;
    const top = news[0];
    if (lastNotifiedNewsId.current === top.id) return;
    lastNotifiedNewsId.current = top.id;
    void notifyNews(top.title, top.content.slice(0, 120), top.source);
  }, [news, settings.newsAlerts]);

  // Yenileme
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshStocks(), refreshNews()]);
    setRefreshing(false);
  };

  const pageTitles: Record<typeof activeTab, string> = {
    home: 'Hisse Takip',
    watchlist: 'Takip Listem',
    news: 'Haberler',
    analysis: 'Teknik Analiz',
    settings: 'Ayarlar',
  };

  // Tab butonu
  const TabButton = ({ tab, icon, label }: { tab: typeof activeTab; icon: string; label: string }) => {
    const active = activeTab === tab;
    return (
      <TouchableOpacity style={styles.tabButton} onPress={() => setActiveTab(tab)} activeOpacity={0.7}>
        <View style={[styles.tabIconWrap, active && styles.tabIconWrapActive]}>
          <Ionicons
            name={(active ? icon : `${icon}-outline`) as any}
            size={22}
            color={active ? Colors.primary : Colors.textMuted}
          />
        </View>
        <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Ana sayfa içeriği
  const renderHomeContent = () => (
    <ScrollView
      style={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Piyasa Özeti — gradient metrik kartlar */}
      <Text style={styles.sectionLabel}>PİYASA ÖZETİ</Text>
      <View style={styles.metricRow}>
        {marketMetrics.map((m) => {
          const meta =
            m.key === 'bist'
              ? { accent: Colors.primary, icon: 'bar-chart' }
              : m.key === 'sp500'
              ? { accent: Colors.accentPurple, icon: 'globe' }
              : { accent: Colors.neutral, icon: 'cash' };
          const change = m.loaded
            ? `${m.up ? '+' : ''}${m.changePercent.toFixed(m.key === 'usdtry' ? 2 : 1)}%`
            : '—';
          return (
            <MetricCard
              key={m.key}
              accent={meta.accent}
              label={m.label}
              value={m.value}
              change={change}
              up={m.up}
              icon={meta.icon}
            />
          );
        })}
      </View>

      {/* AI Durumu */}
      <Card>
        <View style={styles.aiStatusRow}>
          <View style={styles.aiStatusItem}>
            <Ionicons
              name={aiConnected ? 'checkmark-circle' : 'alert-circle'}
              size={20}
              color={aiConnected ? Colors.positive : Colors.negative}
            />
            <Text style={styles.aiStatusText}>
              AI ({providerLabel()}): {aiConnected ? 'Bağlı' : 'Bağlantı Yok'}
            </Text>
          </View>
          {aiLoading && <Loading size="small" text="" />}
        </View>
      </Card>

      {/* Taban Yapan Hisseler */}
      <Card title="🔔 Taban Yapan Hisseler" subtitle="Gerçek teknik tespit" accent={Colors.bottom}>
        {(() => {
          const bottoming = reports.filter(r => r.snapshot?.bottom);
          if (bottoming.length === 0) {
            return (
              <View style={styles.emptyState}>
                <Ionicons name="pulse-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Şu an taban yapan hisse tespit edilmedi</Text>
                <Text style={styles.emptySubtext}>Yatay seyreden (dip yapan) hisseler burada görünür</Text>
              </View>
            );
          }
          return bottoming.slice(0, 5).map(r => (
            <BottomDetector
              key={r.symbol}
              symbol={r.symbol || ''}
              stockName={r.symbol || ''}
              days={r.snapshot!.bottom!.days}
              currentPrice={r.snapshot!.bottom!.currentPrice}
              lowestPrice={r.snapshot!.bottom!.lowestPrice}
              potential={r.snapshot!.bottom!.potential}
              currency={(reportStocks.find(s => s.symbol === r.symbol)?.currency as 'TRY' | 'USD') || 'TRY'}
            />
          ));
        })()}
      </Card>

      {/* Son Haberler */}
      <Card title="📰 Son Haberler" subtitle={`${news.length} haber`} accent={Colors.accent}>
        {news.slice(0, 3).map(item => (
          <NewsCard key={item.id} news={item} showStock onPress={() => setNewsDetail(item)} />
        ))}
      </Card>

      {/* Popüler Hisseler — gerçek fiyatla (rapor verisinden) */}
      <Card title="📈 Popüler Hisseler" subtitle="BIST + ABD">
        {reports.slice(0, 6).map(r => {
          const base = reportStocks.find(s => s.symbol === r.symbol);
          const stock: StockData = {
            id: base?.id ?? 0,
            symbol: r.symbol || '',
            name: base?.name || r.symbol || '',
            exchange: base?.exchange || 'BIST',
            sector: base?.sector || '',
            currency: base?.currency || 'TRY',
            currentPrice: r.snapshot?.lastClose,
          };
          return (
            <StockCard
              key={r.symbol}
              stock={stock}
              onPress={() => setDetailStock(stock)}
              isOnWatchlist={isOnWatchlist(stock.symbol)}
              onAddToWatchlist={() => addToWatchlist(stock)}
              onRemoveFromWatchlist={() => removeFromWatchlist(stock.symbol)}
            />
          );
        })}
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Takip listesi içeriği
  const renderWatchlistContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* 1) Takip Listem */}
      <Card title="⭐ Takip Listem" subtitle={`${watchlist.length} hisse`} accent={Colors.neutral}>
        {watchlist.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="star-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Takip listeniz boş</Text>
            <Text style={styles.emptySubtext}>Hisse kartlarındaki yıldız simgesine tıklayarak ekleyin</Text>
          </View>
        ) : (
          watchlist.map(stock => (
            <StockCard
              key={stock.symbol}
              stock={stock}
              onPress={() => setDetailStock(stock)}
              isOnWatchlist
              onRemoveFromWatchlist={() => removeFromWatchlist(stock.symbol)}
            />
          ))
        )}
      </Card>

      {/* 2) Bu Hafta En Çok Düşenler */}
      <Card title="📉 Bu Hafta En Çok Düşenler" subtitle="Tüm BIST · haftalık" accent={Colors.negative}>
        {movers.isLoading && movers.losers.length === 0 ? (
          <Loading text="Hesaplanıyor..." />
        ) : movers.losers.length === 0 ? (
          <Text style={styles.emptySubtext}>Veri alınamadı.</Text>
        ) : (
          movers.losers.map(stock => (
            <StockCard
              key={`lose-${stock.symbol}`}
              stock={stock}
              onPress={() => setDetailStock(stock)}
              isOnWatchlist={isOnWatchlist(stock.symbol)}
              onAddToWatchlist={() => addToWatchlist(stock)}
              onRemoveFromWatchlist={() => removeFromWatchlist(stock.symbol)}
            />
          ))
        )}
      </Card>

      {/* 3) Bu Hafta En Çok Yükselenler */}
      <Card title="📈 Bu Hafta En Çok Yükselenler" subtitle="Tüm BIST · haftalık" accent={Colors.positive}>
        {movers.isLoading && movers.gainers.length === 0 ? (
          <Loading text="Hesaplanıyor..." />
        ) : movers.gainers.length === 0 ? (
          <Text style={styles.emptySubtext}>Veri alınamadı.</Text>
        ) : (
          movers.gainers.map(stock => (
            <StockCard
              key={`gain-${stock.symbol}`}
              stock={stock}
              onPress={() => setDetailStock(stock)}
              isOnWatchlist={isOnWatchlist(stock.symbol)}
              onAddToWatchlist={() => addToWatchlist(stock)}
              onRemoveFromWatchlist={() => removeFromWatchlist(stock.symbol)}
            />
          ))
        )}
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Haber filtre seçenekleri
  const newsFilters: { key: string; label: string }[] = [
    { key: 'all', label: 'Tümü' },
    { key: 'tr', label: '🇹🇷 Türk' },
    { key: 'foreign', label: '🌍 Yabancı' },
  ];

  // Kaynağa göre haber bölgesi: StockTwits/Reddit yabancı, diğerleri (BloombergHT, Dünya, KAP) Türk
  const isForeignNews = (source: string): boolean =>
    /stocktwits|reddit/i.test(source);
  const regionFilteredNews = news.filter((n) => {
    if (activeFilter === 'tr') return !isForeignNews(n.source);
    if (activeFilter === 'foreign') return isForeignNews(n.source);
    return true;
  });

  // Haberler içeriği
  const renderNewsContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {usingSampleNews && (
        <View style={styles.sampleBanner}>
          <Ionicons name="information-circle" size={18} color={Colors.warning} />
          <Text style={styles.sampleBannerText}>
            Demo haber akışı gösteriliyor. Canlı KAP/ekonomi haberleri için cihazda internet
            erişimi ve uygun kaynaklar gerekir.
          </Text>
        </View>
      )}

      {/* Filtre çipleri */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ gap: 8, paddingRight: 16 }}
      >
        {newsFilters.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, activeFilter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text
              style={[styles.filterChipText, activeFilter === f.key && styles.filterChipTextActive]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Card title="📰 Haberler" subtitle={`${regionFilteredNews.length} haber`}>
        {newsLoading ? (
          <Loading text="Haberler yükleniyor..." />
        ) : regionFilteredNews.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="newspaper-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>Bu filtrede haber yok</Text>
          </View>
        ) : (
          regionFilteredNews.map(item => <NewsCard key={item.id} news={item} showStock onPress={() => setNewsDetail(item)} />)
        )}
      </Card>

      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Analiz içeriği — gerçek teknik analiz raporları
  const renderAnalysisContent = () => {
    const buyCount = reports.filter(r => r.signal === 'AL' || r.signal === 'GÜÇLÜ AL').length;
    const sellCount = reports.filter(r => r.signal === 'SAT' || r.signal === 'GÜÇLÜ SAT').length;
    // En güçlü sinyalleri üste al (mutlak skora göre)
    const sorted = [...reports].sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {usingSampleData && (
          <View style={styles.sampleBanner}>
            <Ionicons name="information-circle" size={18} color={Colors.warning} />
            <Text style={styles.sampleBannerText}>
              Bazı hisseler için canlı veri alınamadı; o hisselerde demo veri kullanılıyor.
            </Text>
          </View>
        )}

        <Card title="📊 Teknik Tarama Özeti" subtitle={`${reports.length} hisse analiz edildi`} accent={Colors.accent}>
          <View style={styles.marketRow}>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>AL sinyali</Text>
              <Text style={[styles.marketValue, { color: Colors.positive }]}>{buyCount}</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>SAT sinyali</Text>
              <Text style={[styles.marketValue, { color: Colors.negative }]}>{sellCount}</Text>
            </View>
            <View style={styles.marketItem}>
              <Text style={styles.marketLabel}>Aktif uyarı</Text>
              <Text style={[styles.marketValue, { color: Colors.neutral }]}>{alerts.length}</Text>
            </View>
          </View>
          <TouchableOpacity activeOpacity={0.85} onPress={() => notifyAlerts()}>
            <LinearGradient
              colors={Gradients.primary}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.notifyButton}
            >
              <Ionicons name="notifications" size={18} color={Colors.text} />
              <Text style={styles.notifyButtonText}>Güçlü sinyalleri bildirim olarak gönder</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Card>

        {/* Ekonomik Takvim */}
        <EconomicCalendarCard />

        {/* Haftalık AI Analizi */}
        <Card title="🧠 Haftalık AI Analizi" subtitle={`${providerLabel()} ile piyasa yorumu`} accent={Colors.accentPurple}>
          {weeklyReport ? (
            <>
              <Text style={styles.weeklyText}>{weeklyReport}</Text>
              <TouchableOpacity style={styles.regenBtn} onPress={runWeeklyAnalysis} disabled={weeklyLoading}>
                <Ionicons name="refresh" size={14} color={Colors.textSecondary} />
                <Text style={styles.regenBtnText}>Yeniden üret</Text>
              </TouchableOpacity>
            </>
          ) : weeklyLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 20, gap: 8 }}>
              <ActivityIndicator color={Colors.accentPurple} />
              <Text style={styles.aiStatusText}>Haftalık analiz üretiliyor…</Text>
            </View>
          ) : (
            <TouchableOpacity style={styles.weeklyBtn} onPress={runWeeklyAnalysis} activeOpacity={0.85}>
              <Ionicons name="sparkles" size={18} color={Colors.text} />
              <Text style={styles.weeklyBtnText}>Haftalık Analiz Oluştur</Text>
            </TouchableOpacity>
          )}
        </Card>

        {sorted.map(report => (
          <TechnicalReportCard key={report.symbol} report={report} />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    );
  };

  // Ayarlar içeriği
  // İşlevsel ayar satırı (kalıcı toggle)
  const SettingRow = ({ label, value, onToggle, hint }: { label: string; value: boolean; onToggle: () => void; hint?: string }) => (
    <View style={styles.settingsItem}>
      <View style={{ flex: 1, paddingRight: 12 }}>
        <Text style={styles.settingsLabel}>{label}</Text>
        {hint && <Text style={styles.settingsHint}>{hint}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );

  const renderSettingsContent = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      <Card title="🔔 Bildirimler" accent={Colors.neutral}>
        <SettingRow label="Anlık bildirimler" value={settings.pushNotifications} onToggle={togglePushNotifications} hint="Teknik sinyal ve uyarılar" />
        <SettingRow label="Günlük özet" value={settings.dailyDigest} onToggle={toggleDailyDigest} hint="Her gün 18:00'de hatırlatma" />
        <SettingRow label="Haftalık analiz" value={settings.weeklyAnalysis} onToggle={toggleWeeklyAnalysis} />
        <SettingRow label="Taban tespit uyarıları" value={settings.bottomDetectionAlerts} onToggle={toggleBottomDetection} />
        <SettingRow label="Haber bildirimleri" value={settings.newsAlerts} onToggle={toggleNewsAlerts} />
      </Card>

      <Card title="📊 Borsa Tercihleri" accent={Colors.primary}>
        <SettingRow label="BIST takibi" value={settings.trackBIST} onToggle={toggleBIST} />
        <SettingRow label="ABD borsası takibi" value={settings.trackUS} onToggle={toggleUS} />
        <SettingRow label="Döviz kurları" value={settings.trackForex} onToggle={toggleForex} />
      </Card>

      <Card title="🤖 AI & Veri" accent={Colors.accentPurple}>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsLabel}>AI sağlayıcı</Text>
          <Text style={styles.settingsValue}>{providerLabel()}</Text>
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsLabel}>AI durumu</Text>
          <Text style={[styles.settingsValue, { color: aiConnected ? Colors.positive : Colors.negative }]}>
            {aiConnected ? 'Bağlı' : 'Bağlantı yok'}
          </Text>
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsLabel}>Fiyat verisi</Text>
          <Text style={styles.settingsValue}>Yahoo Finance</Text>
        </View>
        <View style={styles.settingsItem}>
          <Text style={styles.settingsLabel}>Haber</Text>
          <Text style={styles.settingsValue}>BloombergHT · Dünya</Text>
        </View>
      </Card>

      <Text style={styles.versionText}>Hisse Takip · sürüm 1.0.0</Text>
      <View style={{ height: 100 }} />
    </ScrollView>
  );

  // Aktif sayfa içeriği
  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeContent();
      case 'watchlist':
        return renderWatchlistContent();
      case 'news':
        return renderNewsContent();
      case 'analysis':
        return renderAnalysisContent();
      case 'settings':
        return renderSettingsContent();
      default:
        return renderHomeContent();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header — gradient hero */}
      <LinearGradient
        colors={Gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          <View style={styles.logoBadge}>
            <Ionicons name="trending-up" size={20} color={Colors.primaryLight} />
          </View>
          <View>
            <Text style={styles.headerKicker}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </Text>
            <Text style={styles.headerTitle}>{pageTitles[activeTab]}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerButton} onPress={() => setActiveTab('analysis')}>
            <Ionicons name="notifications-outline" size={20} color={Colors.text} />
            {alerts.length > 0 && (
              <View style={styles.notifDot}>
                <Text style={styles.notifDotText}>{Math.min(alerts.length, 9)}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setSearchOpen(true)}>
            <Ionicons name="search" size={20} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* İçerik */}
      {stocksLoading && news.length === 0 ? (
        <Loading fullScreen text="Veriler yükleniyor..." />
      ) : (
        renderContent()
      )}

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TabButton tab="home" icon="home" label="Ana Sayfa" />
        <TabButton tab="watchlist" icon="star" label="Takip" />
        <TabButton tab="news" icon="newspaper" label="Haberler" />
        <TabButton tab="analysis" icon="analytics" label="Analiz" />
        <TabButton tab="settings" icon="settings" label="Ayarlar" />
      </View>

      {/* Hisse Detay Ekranı */}
      <Modal
        visible={detailStock !== null}
        animationType="slide"
        onRequestClose={() => setDetailStock(null)}
        transparent={false}
      >
        <View style={styles.container}>
          <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.headerButton} onPress={() => setDetailStock(null)}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </TouchableOpacity>
              <View>
                <Text style={styles.headerTitle}>{detailStock?.symbol}</Text>
                <Text style={styles.detailSubtitle} numberOfLines={1}>
                  {detailPrice.name || detailStock?.name}
                </Text>
              </View>
            </View>
            {detailStock && (
              <TouchableOpacity
                style={styles.headerButton}
                onPress={() =>
                  isOnWatchlist(detailStock.symbol)
                    ? removeFromWatchlist(detailStock.symbol)
                    : addToWatchlist(detailStock)
                }
              >
                <Ionicons
                  name={isOnWatchlist(detailStock.symbol) ? 'star' : 'star-outline'}
                  size={24}
                  color={isOnWatchlist(detailStock.symbol) ? Colors.neutral : Colors.text}
                />
              </TouchableOpacity>
            )}
          </LinearGradient>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {detailPrice.usingSample && !detailPrice.isLoading && (
              <View style={styles.sampleBanner}>
                <Ionicons name="information-circle" size={18} color={Colors.warning} />
                <Text style={styles.sampleBannerText}>
                  Bu sembol için canlı fiyat alınamadı, demo veri gösteriliyor.
                </Text>
              </View>
            )}
            {detailPrice.isLoading && detailPrice.history.length === 0 ? (
              <Loading text="Canlı fiyat verisi yükleniyor..." />
            ) : (
              <>
                {detailData && <DetailedChart data={detailData.history} currency={detailPrice.currency} />}
                {detailData && <TechnicalReportCard report={detailData.report} />}
              </>
            )}
            <AIAnalysisCard text={aiText} isLoading={aiAnalysisLoading} provider={providerLabel()} onGenerate={runAIAnalysis} />
            <SocialFeedCard posts={socialPosts} isLoading={socialLoading} loaded={socialLoaded} />
            <View style={{ height: 40 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Hisse Arama Ekranı */}
      <Modal visible={searchOpen} animationType="slide" onRequestClose={() => setSearchOpen(false)}>
        <View style={styles.container}>
          <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={[styles.headerLeft, { flex: 1 }]}>
              <TouchableOpacity style={styles.headerButton} onPress={() => { setSearchOpen(false); setSearchQuery(''); }}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </TouchableOpacity>
              <TextInput
                style={styles.searchInput}
                placeholder="Hisse ara (sembol veya isim)..."
                placeholderTextColor={Colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                autoCapitalize="characters"
              />
            </View>
          </LinearGradient>
          <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
            {ALL_STOCKS.filter(s => {
              const q = searchQuery.trim().toUpperCase();
              return q.length > 0 && (s.symbol.includes(q) || s.name.toUpperCase().includes(q));
            }).slice(0, 30).map((s, i) => {
              const stock: StockData = { id: i, symbol: s.symbol, name: s.name, exchange: s.exchange, sector: s.sector, currency: s.currency };
              return (
                <StockCard
                  key={s.symbol}
                  stock={stock}
                  onPress={() => { setSearchOpen(false); setSearchQuery(''); setDetailStock(stock); }}
                  isOnWatchlist={isOnWatchlist(s.symbol)}
                  onAddToWatchlist={() => addToWatchlist(stock)}
                  onRemoveFromWatchlist={() => removeFromWatchlist(s.symbol)}
                />
              );
            })}
            {searchQuery.trim().length === 0 && (
              <Text style={styles.searchHint}>Aramak için hisse kodu veya adı yazın (ör. ASELS, Garanti)</Text>
            )}
            <View style={{ height: 60 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Haber Detay Ekranı */}
      <Modal visible={newsDetail !== null} animationType="slide" onRequestClose={() => setNewsDetail(null)}>
        <View style={styles.container}>
          <LinearGradient colors={Gradients.hero} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.header}>
            <View style={styles.headerLeft}>
              <TouchableOpacity style={styles.headerButton} onPress={() => setNewsDetail(null)}>
                <Ionicons name="arrow-back" size={22} color={Colors.text} />
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Haber</Text>
            </View>
          </LinearGradient>
          {newsDetail && (
            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.newsMetaRow}>
                <View style={styles.newsSourceBadge}>
                  <Text style={styles.newsSourceText}>{newsDetail.source}</Text>
                </View>
                {newsDetail.sentiment && (
                  <View style={[styles.newsSentiment, {
                    backgroundColor: (newsDetail.sentiment === 'positive' ? Colors.positive : newsDetail.sentiment === 'negative' ? Colors.negative : Colors.textMuted) + '1A',
                  }]}>
                    <Text style={[styles.newsSentimentText, {
                      color: newsDetail.sentiment === 'positive' ? Colors.positive : newsDetail.sentiment === 'negative' ? Colors.negative : Colors.textMuted,
                    }]}>
                      {newsDetail.sentiment === 'positive' ? 'Olumlu' : newsDetail.sentiment === 'negative' ? 'Olumsuz' : 'Nötr'}
                    </Text>
                  </View>
                )}
              </View>
              <Text style={styles.newsDetailTitle}>{newsDetail.title}</Text>
              {newsDetail.stockSymbol && (
                <TouchableOpacity
                  onPress={() => {
                    const s = ALL_STOCKS.find(x => x.symbol === newsDetail.stockSymbol);
                    if (s) { setNewsDetail(null); setDetailStock({ id: 0, symbol: s.symbol, name: s.name, exchange: s.exchange, sector: s.sector, currency: s.currency }); }
                  }}
                >
                  <Text style={styles.newsStockLink}>📈 {newsDetail.stockName || newsDetail.stockSymbol}</Text>
                </TouchableOpacity>
              )}
              <Text style={styles.newsDetailBody}>{newsDetail.content}</Text>
              {newsDetail.sourceUrl ? (
                <TouchableOpacity style={styles.newsLinkBtn} onPress={() => Linking.openURL(newsDetail.sourceUrl!)}>
                  <Ionicons name="open-outline" size={18} color={Colors.text} />
                  <Text style={styles.newsLinkText}>Kaynakta oku</Text>
                </TouchableOpacity>
              ) : null}
              <View style={{ height: 60 }} />
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 52,
    paddingBottom: 18,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoBadge: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  headerKicker: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.6)',
    textTransform: 'capitalize',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -0.3,
  },
  detailSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchHint: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 40,
    paddingHorizontal: 30,
    lineHeight: 20,
  },
  newsMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    marginBottom: 12,
  },
  newsSourceBadge: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: Radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  newsSourceText: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary },
  newsSentiment: { borderRadius: Radius.pill, paddingHorizontal: 12, paddingVertical: 4 },
  newsSentimentText: { fontSize: 12, fontWeight: '700' },
  newsDetailTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    lineHeight: 30,
    marginBottom: 12,
  },
  newsStockLink: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primaryLight,
    marginBottom: 12,
  },
  newsDetailBody: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 26,
  },
  newsLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginTop: 24,
  },
  newsLinkText: { color: Colors.text, fontSize: 15, fontWeight: '700' },
  weeklyText: { fontSize: 14, color: Colors.text, lineHeight: 22 },
  weeklyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.accentPurple,
    borderRadius: Radius.md,
    paddingVertical: 12,
  },
  weeklyBtnText: { color: Colors.text, fontSize: 14, fontWeight: '700' },
  regenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surfaceLight,
  },
  regenBtnText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifDot: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.negative,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.background,
  },
  notifDotText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  metricRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: 12,
    minHeight: 92,
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metricIcon: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricChangePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
    borderRadius: Radius.pill,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  metricChangeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  metricValue: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.surfaceAlt,
    paddingTop: 10,
    paddingBottom: 26,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabIconWrap: {
    width: 44,
    height: 32,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconWrapActive: {
    backgroundColor: Colors.primary + '22',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    marginTop: 4,
  },
  tabLabelActive: {
    color: Colors.primary,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  marketItem: {
    alignItems: 'center',
  },
  marketLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  marketValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  aiStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aiStatusText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 8,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.text,
  },
  sampleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.warning + '1A',
    borderColor: Colors.warning,
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  sampleBannerText: {
    flex: 1,
    fontSize: 12,
    color: Colors.warning,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 14,
  },
  notifyButtonText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  analysisPlaceholder: {
    alignItems: 'center',
    padding: 40,
  },
  analysisText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 12,
  },
  analysisSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  settingsSection: {
    marginBottom: 24,
  },
  settingsSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingsLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  settingsValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  settingsHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 8,
  },
});
