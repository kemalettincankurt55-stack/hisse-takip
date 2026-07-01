# 📊 Hisse Takip Uygulaması - Kapsamlı Analiz Raporu

**Tarih:** 1 Temmuz 2026  
**Uygulama:** Hisse Takip v1.0.0  
**Platform:** React Native + Expo (Android/iOS/Web)

---

## 📋 İçindekiler

1. [Özet](#özet)
2. [Kritik Hatalar](#1--kritik-hatalar)
3. [Mantık Hataları](#2--mantık-hataları)
4. [Eksik Özellikler](#3--eksik-özellikler-planmdeye-göre)
5. [Performans Sorunları](#4--performans-sorunları)
6. [Güvenlik Sorunları](#5--güvenlik-sorunları)
7. [UI/UX Sorunları](#6--uiux-sorunları)
8. [İyileştirme Önerileri](#7--iyileştirme-önerileri)
9. [İstatistikler](#8--istatistikler)

---

## 🔎 Özet

Uygulama genel olarak iyi bir mimariye sahip: Temiz bileşen yapısı, Zustand ile state yönetimi, proxy üzerinden veri çekme ve teknik analiz motoru doğru kurgulanmış. Ancak kritik birkaç mantık hatası, eksik özellikler ve bazı performans/güvenlik açıkları mevcut.

**Toplam Tespit Edilen Sorun: 37**

| Kategori | Kritik | Orta | Düşük | Toplam |
|----------|--------|------|-------|--------|
| Hata / Mantık Hatası | 5 | 6 | 0 | 11 |
| Eksik Özellik | 0 | 6 | 0 | 6 |
| Performans | 0 | 4 | 0 | 4 |
| Güvenlik | 2 | 1 | 0 | 3 |
| UI/UX | 0 | 4 | 3 | 7 |
| Kod Kalitesi | 0 | 2 | 4 | 6 |

---

## 🔴 1. Kritik Hatalar

### 1.1 `isGeminiConfigured()` her zaman `true` dönüyor

**Dosya:** `src/services/ai/gemini.ts`  
**Satır:** 11

```typescript
// ❌ HATALI
export const isGeminiConfigured = (): boolean => true;

// ✅ DOĞRU
export const isGeminiConfigured = (): boolean => {
  return !!(process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY);
};
```

**Etki:** Gemini API anahtarı sunucuda tanımlı olmasa bile `true` dönüyor. Bu, Ollama fallback'ini hiçbir zaman çalışmaz hale getiriyor. Kullanıcı Ollama kurmuş olsa bile Gemini deneniyor ve hata alınıyor.

---

### 1.2 İki ayrı seçim mekanizması çakışıyor

**Dosyalar:** `App.tsx`, `src/store/stockStore.ts`, `src/hooks/useStocks.ts`

Uygulamada iki ayrı "seçili hisse" mekanizması var:
- `App.tsx`'te `detailStock` state'i (Modal için)
- `stockStore`'da `selectedStock` + `selectStock()`

`useStocks` hook'u `selectStock` ve `loadStockDetail` döndürüyor ama App.tsx'te hiç kullanılmıyor. Bu:
- Ölü kod oluşturuyor
- Gelecekte kafa karışıklığına neden oluyor
- Olası durum tutarsızlıkları yaratıyor

---

### 1.3 `useStocks` → ölü fonksiyonlar

**Dosya:** `src/hooks/useStocks.ts`

Aşağıdaki fonksiyonlar hook'tan döndürülüyor ama hiçbir yerde çağrılmıyor:
- `loadStockDetail()`
- `loadPriceHistory()`
- `searchStocks()`
- `selectedStock`
- `priceHistory`

Bu fonksiyonlar ya kaldırılmalı ya da ilgili yerlerde kullanılmalı.

---

### 1.4 `expo-router` bağımlılığı var ama kullanılmıyor

**Dosya:** `package.json`

```json
"expo-router": "~4.0.0",
```

Uygulama tamamen `App.tsx` üzerinden çalışıyor. `expo-router` hiçbir yerde import edilmemiş. Bu gereksiz bağımlılık:
- Build süresini artırıyor
- Bundle boyutunu büyütüyor
- `react-native-gesture-handler`, `react-native-screens`, `react-native-reanimated` gibi ek bağımlılıkları da beraberinde getiriyor

---

### 1.5 `expo-sqlite` bağımlılığı var ama kullanılmıyor

**Dosya:** `package.json`

```json
"expo-sqlite": "~15.1.4",
```

`PLAN.md`'de detaylı SQLite şeması var (9 tablo) ama hiçbir yerde `expo-sqlite` import edilmemiş. `database/queries.ts` ve `database/schema.ts` dosyaları var ama kullanılmıyor.

---

## 🟠 2. Mantık Hataları

### 2.1 `useWeeklyMovers` bağımlılık dizisi eksik

**Dosya:** `src/hooks/useWeeklyMovers.ts`

```typescript
// ❌ HATALI — nameSource eksik
}, [limit]);

// ✅ DOĞRU
}, [nameSource, limit]);
```

`nameSource` bağımlılık dizisinde yok, bu yüzden `nameSource` değiştiğinde yeniden çekim yapılmıyor. Hisseler değişse bile eski liste gösterilmeye devam ediyor.

---

### 2.2 `usePriceHistories` → ESLint kuralı devre dışı

**Dosya:** `src/hooks/usePriceHistory.ts`

```typescript
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [key, limit]);
```

`stocks` bağımlılığı atlanıyor. Bu, eslint kuralının kasıtlı olarak devre dışı bırakıldığı anlamına geliyor ancak potansiyel bir hata kaynağı.

---

### 2.3 `BottomDetector` hardcoded `₺` kullanıyor

**Dosya:** `src/components/analysis/BottomDetector.tsx`

```typescript
<Text style={styles.price}>₺{currentPrice.toFixed(2)}</Text>
```

USD hisseleri için hatalı fiyat gösterir. `currency` prop'u eklenmeli.

---

### 2.4 Haber filtresinde `kap` kaldırılmış ama KAP haberleri üretilmeye devam ediliyor

**Dosya:** `App.tsx`

`newsFilters` dizisinden `{ key: 'kap', label: 'KAP' }` kaldırılmış ama `useNews.ts`'de KAP haberleri hala `newsType: 'kap'` olarak ekleniyor.

Bu durumda:
- KAP haberleri "Tümü" altında görünüyor
- Ayrı bir KAP filtresi yok
- Kullanıcı KAP haberlerini filtreleyemiyor

---

### 2.5 `bottomDetectionAlerts` ayarı yok sayılıyor

**Dosya:** `App.tsx`

```typescript
autoNotify: settings.pushNotifications, // ❌ bottomDetectionAlerts kontrol edilmiyor
```

`settingsStore`'da `bottomDetectionAlerts` toggle'ı var ama `useTechnicalReports`'a geçirilmiyor. Ayarlar sayfasındaki toggle etkisiz.

---

### 2.6 `useNews` → `kapNews` sonucu `newsType: 'kap'` olarak ekleniyor ama filtre seçeneklerinde `kap` yok

**Dosya:** `src/hooks/useNews.ts`

KAP haberleri `newsType: 'kap'` ile ekleniyor:
```typescript
allNews.push({
  // ...
  newsType: 'kap',
  // ...
});
```

Ama App.tsx'teki filtre seçenekleri:
```typescript
const newsFilters = [
  { key: 'all', label: 'Tümü' },
  { key: 'economic', label: 'Ekonomi' },
  { key: 'news', label: 'Borsa' },
  { key: 'social', label: 'Sosyal' },
];
```

`kap` filtresi yok — KAP haberleri filtrelenemiyor.

---

## 📦 3. Eksik Özellikler (PLAN.md'ye göre)

### 3.1 SQLite Veritabanı

**Durum:** Hiç kullanılmıyor  
**PLAN.md'de:** 9 tablo, indeksler, tam şema planlanmış

`expo-sqlite` bağımlılığı var ama hiçbir yerde import edilmemiş. Offline çalışma, veri kalıcılığı ve performans için önemli bir eksik.

---

### 3.2 Ekonomik Takvim

**Durum:** Hiç implemente edilmemiş  
**PLAN.md'de:** Ekonomik takvim tablosu, bildirimler planlanmış

TCMB faiz kararları, ABD istihdam verileri gibi önemli ekonomik olaylar takip edilemiyor.

---

### 3.3 Kullanıcı Profili / Kişiselleştirme

**Durum:** Hiç implemente edilmemiş  
**PLAN.md'de:** "Favori sectors", "Kullanıcı adı" planlanmış

Kullanıcı tercihlerine göre kişiselleştirme yok.

---

### 3.4 Haftalık AI Analiz Raporu Üretimi

**Durum:** Fonksiyon var ama tetiklenmiyor  
**Dosya:** `src/services/ai/aiProvider.ts`

`generateWeeklyAnalysis` fonksiyonu mevcut ama ne bir zamanlayıcı ile ne de bir buton ile çağrılıyor. Kullanıcı bu özelliği kullanamıyor.

---

### 3.5 Hisse Arama Ekranı

**Durum:** Header'da ikon var ama çalışmıyor

```typescript
// Header'da
<TouchableOpacity style={styles.headerButton}>
  <Ionicons name="search" size={20} color={Colors.text} />
</TouchableOpacity>
```

`onPress` prop'u yok — sadece görsel.

---

### 3.6 Bildirim Merkezi / Geçmişi

**Durum:** Bildirimler gönderiliyor ama gösterilmiyor

Bildirimler `expo-notifications` ile gönderiliyor ama uygulama içinde bir bildirim merkezi/geçmişi ekranı yok.

---

## ⚡ 4. Performans Sorunları

### 4.1 `usePriceHistories` → paralel API çağrıları

**Dosya:** `src/hooks/usePriceHistory.ts`

10 hisse için paralel olarak proxy üzerinden fiyat çekiliyor. Proxy yoksa hepsi 12 saniye timeout ile bekliyor.

**Öneri:** Batch request veya kademeli yükleme.

---

### 4.2 `scrapeAllNews` → 4 paralel scraping

**Dosya:** `src/services/scraper/newsScraper.ts`

BloombergHT, Dünya, Investing.com, Yahoo Finance — hepsi paralel çalıştırılıyor. Birinde rate-limit olursa diğerlerini de etkileyebilir.

---

### 4.3 `computeBistMovers` → 150+ sembol için Yahoo spark

**Dosya:** `server/socialProxy.mjs`

Tüm BIST100 sembolleri için Yahoo spark çağrısı yapılıyor. Bu çok yavaş olabilir ve Yahoo rate-limit'i aşabilir.

**Öneri:** Önbellek süresini artır veya sadece BIST30 gibi küçük bir evren kullan.

---

### 4.4 `useAI` → debounce eksik

**Dosya:** `src/hooks/useAI.ts`

```typescript
useEffect(() => {
  checkConnection();
}, [settings.ollamaUrl]);
```

URL her değiştiğinde yeni bir istek başlatılıyor — debounce gerekli.

---

## 🔒 5. Güvenlik Sorunları

### 5.1 `EXPO_PUBLIC_SOCIAL_PROXY` varsayılanı `localhost:8787`

Production'da proxy çalışmıyorsa uygulama sessizce başarısız oluyor — kullanıcıya açık hata gösterilmiyor.

---

### 5.2 `getPushToken` → hardcoded `projectId`

**Dosya:** `src/utils/notifications.ts`

```typescript
const token = await Notifications.getExpoPushTokenAsync({
  projectId: 'your-project-id', // ❌ Gerçek ID olmalı
});
```

Gerçek push bildirimleri çalışmaz.

---

### 5.3 Gemini API anahtarı proxy'de açık

**Dosya:** `server/socialProxy.mjs`

Proxy açıksa (0.0.0.0) herkes Gemini anahtarını kullanabilir. IP kısıtlaması veya auth token eklenebilir.

---

## 🎨 6. UI/UX Sorunları

### 6.1 Header butonları çalışmıyor

**Dosya:** `App.tsx`

Bildirim ve arama butonlarında `onPress` yok — sadece görsel.

---

### 6.2 Ana sayfa "Popüler Hisseler" → watchlist butonu görünmüyor

**Dosya:** `App.tsx`

```typescript
{stocks.slice(0, 5).map(stock => (
  <StockCard
    key={stock.symbol}
    stock={stock}
    onPress={() => setDetailStock(stock)}
    // ❌ onAddToWatchlist geçirilmemiş
  />
))}
```

---

### 6.3 Haber detay ekranı yok

**Dosya:** `src/components/news/NewsCard.tsx`

Tıklandığında sadece `sourceUrl` açılıyor. Haber içeriği uygulama içinde gösterilmiyor.

---

### 6.4 `theme: 'dark'` ayarı var ama light tema implemente edilmemiş

**Dosya:** `src/store/settingsStore.ts`

Hem `dark` hem `light` tema seçenekleri var ama sadece dark tema çalışıyor.

---

### 6.5 Detail modal safe area handling eksik

**Dosya:** `App.tsx`

Modal'da SafeAreaView kullanılmamış — üst bar ile iç içe olabilir.

---

### 6.6 Skeleton loading yok

**Dosya:** `src/components/ui/Loading.tsx`

Sadece `ActivityIndicator` gösteriyor. Kullanıcı deneyimi için skeleton loading daha iyi olurdu.

---

### 6.7 RSI grafiğinde `fromZero` kullanımı

**Dosya:** `src/components/stock/DetailedChart.tsx`

RSI 0-100 aralığında ama grafik 0'dan başlıyor. 30/70 çizgilerinin konumu görsel olarak bozulabilir.

---

## 💡 7. İyileştirme Önerileri

### 7.1 Merkezi Hata Yönetimi

Her service dosyasında ayrı `try-catch` var. Merkezi bir hata işleyici (Axios interceptor veya `apiClient`) oluşturulmalı.

---

### 7.2 Retry Mekanizması

Gemini proxy'de retry var ama client tarafında (priceFeed, socialFeed, newsFeed) retry yok. Exponential backoff eklenebilir.

---

### 7.3 Cache Stratejisi

Fiyat verileri her yenilemede tekrar çekiliyor. Kısa süreli cache (örn. 5 dakika) eklenebilir. Zaten proxy tarafında `Cache-Control: public, max-age=60` var ama client tarafında da useMemo cache'i güçlendirilebilir.

---

### 7.4 Kullanılmayan Bağımlılıkların Kaldırılması

| Bağımlılık | Durum |
|------------|-------|
| `expo-router` | Kullanılmıyor — kaldırılabilir |
| `expo-sqlite` | Kullanılmıyor — kaldırılabilir |
| `react-native-gesture-handler` | expo-router için gerekli — kaldırılabilir |
| `react-native-reanimated` | expo-router için gerekli — kaldırılabilir |
| `react-native-screens` | expo-router için gerekli — kaldırılabilir |
| `react-native-safe-area-context` | expo-router için gerekli — kaldırılabilir |
| `react-native-svg` | react-native-chart-kit için gerekli — KALMALI |
| `react-native-chart-kit` | Grafikler için kullanılıyor — KALMALI |

---

### 7.5 TypeScript Strict Mode

**Dosya:** `tsconfig.json`

```json
"strict": true
```

Zaten aktif — bu iyi. Ancak bazı dosyalarda `any` kullanımı var:
- `ollama.ts`: `response.data.models.map((m: any) => m.name)`
- `newsScraper.ts`: `result.status === 'fulfilled'`
- `bigPara.ts`: regex tabanlı parsing

---

### 7.6 Test Kapsamı

**Mevcut testler:**
- `analysis.test.ts`: Teknik analiz, alert engine, sample data
- `components.test.tsx`: TechnicalReportCard, DetailedChart

**Eksik test alanları:**
- Hook'lar (useStocks, useNews, useAI)
- Store'lar (stockStore, newsStore, settingsStore)
- Formatters (formatCurrency, formatRelativeTime)
- API servisleri (priceFeed, socialFeed, newsFeed)
- Bileşenler (StockCard, NewsCard, SocialFeedCard, BottomDetector)

---

### 7.7 Accessibility

- Touch target boyutları yeterli mi? (hitSlop kullanılmış — iyi)
- Renk kontrastları yeterli mi? (Dark tema için iyi görünüyor)
- Screen reader desteği var mı? (accessibilityLabel'lar eksik)

---

## 📊 8. İstatistikler

### Kod Boyutu

| Dosya | Satır |
|-------|-------|
| `App.tsx` | ~700 |
| `technicalReport.ts` | ~350 |
| `calculations.ts` | ~250 |
| `socialProxy.mjs` | ~400 |
| `newsScraper.ts` | ~250 |
| `ollama.ts` | ~150 |
| `gemini.ts` | ~80 |

### Bağımlılıklar

- **Toplam:** 23 (dependencies) + 7 (devDependencies)
- **Kullanılmayan:** ~6 (expo-router, expo-sqlite, gesture-handler, reanimated, screens, safe-area-context)
- **Aktif Kullanılan:** ~17

### Test Kapsamı

- **Test dosyası sayısı:** 2
- **Test sayısı:** ~12
- **Kapsanan alan:** Teknik analiz motoru, 2 bileşen

---

## 🎯 Öncelik Sıralaması

### Hemen Düzeltilmeli (Kritik)
1. `isGeminiConfigured()` düzeltmesi
2. Kullanılmayan bağımlılıkların kaldırılması
3. `useWeeklyMovers` bağımlılık düzeltmesi

### Kısa Vadeli (1-2 hafta)
4. Header butonlarının çalıştırılması
5. KAP filtresinin geri eklenmesi
6. `bottomDetectionAlerts` ayarının bağlanması
7. Haber detay ekranının eklenmesi

### Orta Vadeli (1-2 ay)
8. SQLite entegrasyonu
9. Ekonomik takvim
10. Bildirim merkezi
11. Haftalık AI rapor zamanlayıcısı

### Uzun Vadeli (3+ ay)
12. Light tema desteği
13. Kullanıcı profili / kişiselleştirme
14. Test kapsamının artırılması
15. Accessibility iyileştirmeleri

---

*Rapor Buffy tarafından otomatik olarak oluşturulmuştur.*  
*1 Temmuz 2026*
