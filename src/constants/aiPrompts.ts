/**
 * AI Prompt Şablonları - Ollama için
 */

export const AI_PROMPTS = {
  // Hisse analiz prompt'u
  stockAnalysis: (stockName: string, prices: string, news: string): string => `
Sen deneyimli bir borsa analistisin. Aşağıdaki hisse senedini detaylıca analiz et.

## Hisse: ${stockName}

### Son Fiyat Verileri:
${prices}

### İlgili Haberler:
${news}

### Analiz İsteği:
1. **Genel Değerlendirme**: Hissenin mevcut durumu
2. **Teknik Analiz**: Fiyat hareketleri, destek-direnç seviyeleri
3. **Haber Etkisi**: Haberlerin fiyata olası etkisi
4. **Risk Değerlendirmesi**: Olası riskler
5. **Kısa Vadeli Tahmin**: 1-2 haftalık beklenti

Lütfen yanıtını Türkçe ver,professionel ve anlaşılır ol. Max 300 kelime ile özetle.
`,

  // Taban tespit analizi
  bottomAnalysis: (stockName: string, bottomDays: number, priceData: string): string => `
Sen bir borsa analistisin. ${stockName} hissesi son ${bottomDays} gündür taban yapıyor.

### Fiyat Verileri:
${priceData}

### Analiz İsteği:
1. **Taban Nedeni**: Neden taban yapıyor olabilir?
2. **Yükselme Potansiyeli**: Ne kadar yükselme potansiyeli var?
3. **Destek Seviyesi**: Alt destek noktası neresi?
4. **Direnç Seviyesi**: Üst direnç noktası neresi?
5. **Tavsiye**: Takip listesine eklenmeli mi?

Yanıtını Türkçe ver, max 200 kelime.
`,

  // Haftalık piyasa analizi
  weeklyMarketAnalysis: (bistData: string, usData: string, economicNews: string): string => `
Sen bir piyasa analistisin. Aşağıdaki verilere göre haftalık piyasa analizi yap.

### BIST100 Verileri:
${bistData}

### ABD Piyasası Verileri:
${usData}

### Ekonomik Haberler:
${economicNews}

### Analiz İsteği:
1. **BIST100 Özeti**: Bu hafta BIST100'de neler oldu?
2. **ABD Piyasası Özeti**: ABD borsalarının durumu
3. **Ekonomik Göstergeler**: Önemli ekonomik veriler
4. **Sektör Analizi**: Hangi sektörler öne çıkıyor?
5. **Gelecek Hafta Tahmini**: Gelecek hafta için beklentiler
6. **Öne Çıkan Hisseler**: Dikkat çekici hisseler

Yanıtını Türkçe ver, profesyonel ve kapsamlı ol. Max 500 kelime.
`,

  // Haber özeti
  newsSummary: (newsContent: string, source: string): string => `
Sen bir finansal haber editörüsün. Aşağıdaki haberi özetle ve değerlendir.

### Haber İçeriği:
${newsContent}

### Haber Kaynağı: ${source}

### İstenenler:
1. **Özet**: Haberin kısa özeti (2-3 cümle)
2. **Etki**: Piyasaya olası etkisi (olumlu/olumsuz/nötr)
3. **İlgili Sektörler**: Hangi sektörleri etkiliyor?
4. **AI Yorumu**: Kendi değerlendirmen

Yanıtını Türkçe ver, max 150 kelime.
`,

  // Günlük piyasa özeti
  dailyMarketSummary: (topStocks: string, newsHighlights: string): string => `
Sen bir borsa yazarısın. Günlük piyasa özeti hazırla.

### Günün Öne Çıkan Hisseleri:
${topStocks}

### Günün Önemli Haberleri:
${newsHighlights}

### Format:
1. **Piyasa Özeti**: Genel piyasa havası
2. **En Çok Yükselenler**: Yükselen hisseler
3. **En Çok Düşenler**: Düşen hisseler
4. **Haber Özeti**: Günlük önemli haberler
5. **Yarın İçin Beklenti**: Yarın için kısa tahmin

Yanıtını Türkçe ver, max 300 kelime.
`,
};

export default AI_PROMPTS;
