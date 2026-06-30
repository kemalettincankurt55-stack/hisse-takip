/**
 * Örnek (Demo) Haber Akışı
 *
 * Gerçek haber kaynakları (KAP API, Bloomberg HT / Dünya scraping) RN ortamında
 * CORS / anti-bot / değişen HTML yapısı nedeniyle sık sık boş döner. Bu durumda
 * Haberler sekmesinin boş kalmaması için küratörlü, gerçekçi ve TÜRü ayrıştırılmış
 * bir demo haber akışı sağlanır. UI'da bu akışın "demo" olduğu belirtilmelidir.
 *
 * Zaman damgaları üretim anına göre yakın geçmişe yayılır (göreceli zaman düzgün
 * görünsün diye). İçerik statik ve eğitim amaçlıdır; yatırım tavsiyesi değildir.
 */

import { NewsItem } from '../../store/newsStore';

type Seed = {
  title: string;
  content: string;
  source: string;
  newsType: NewsItem['newsType'];
  sentiment: NonNullable<NewsItem['sentiment']>;
  stockSymbol?: string;
  stockName?: string;
  minutesAgo: number;
};

const SEEDS: Seed[] = [
  {
    title: 'ASELSAN yeni savunma sanayii ihracat sözleşmesi imzaladı',
    content:
      'ASELSAN, yurt dışı bir müşteriyle radar ve elektronik harp sistemleri kapsamında çok yıllı bir ihracat sözleşmesi imzaladığını KAP üzerinden duyurdu. Sözleşme bedeli şirketin yıllık cirosuna anlamlı katkı sağlayacak.',
    source: 'KAP',
    newsType: 'kap',
    sentiment: 'positive',
    stockSymbol: 'ASELS',
    stockName: 'ASELSAN',
    minutesAgo: 18,
  },
  {
    title: 'TCMB faiz kararını açıkladı: Politika faizi sabit tutuldu',
    content:
      'Türkiye Cumhuriyet Merkez Bankası para politikası kurulu toplantısının ardından politika faizini değiştirmeme kararı aldı. Karar metninde enflasyonda kalıcı düşüş sağlanana kadar sıkı duruşun korunacağı vurgulandı.',
    source: 'Bloomberg HT',
    newsType: 'economic',
    sentiment: 'neutral',
    minutesAgo: 42,
  },
  {
    title: 'BIST100 güne yükselişle başladı, bankacılık endeksi öne çıktı',
    content:
      'Borsa İstanbul’da BIST100 endeksi güne alıcılı bir seyirle başladı. Bankacılık ve holding hisselerindeki talep endeksi yukarı taşırken işlem hacmi ortalamanın üzerinde seyretti.',
    source: 'Dünya',
    newsType: 'news',
    sentiment: 'positive',
    minutesAgo: 65,
  },
  {
    title: 'THYAO yolcu trafiği verilerini açıkladı: Doluluk oranı arttı',
    content:
      'Türk Hava Yolları, aylık trafik verilerinde yolcu sayısında yıllık bazda artış ve doluluk oranında iyileşme bildirdi. Dış hat seferlerindeki toparlanma operasyonel görünümü destekliyor.',
    source: 'KAP',
    newsType: 'kap',
    sentiment: 'positive',
    stockSymbol: 'THYAO',
    stockName: 'Türk Hava Yolları',
    minutesAgo: 95,
  },
  {
    title: 'ABD enflasyon verisi beklentilerin hafif altında geldi',
    content:
      'ABD’de açıklanan tüketici fiyat endeksi (TÜFE) verisi piyasa beklentilerinin bir miktar altında kaldı. Veri, Fed’in faiz patikasına ilişkin beklentileri yumuşatarak küresel risk iştahını destekledi.',
    source: 'Bloomberg HT',
    newsType: 'economic',
    sentiment: 'positive',
    minutesAgo: 130,
  },
  {
    title: 'EREGL çeyreklik finansallarını açıkladı: Marjlarda baskı sürüyor',
    content:
      'Ereğli Demir Çelik, çelik fiyatlarındaki zayıflık ve maliyet baskısı nedeniyle çeyreklik karında gerileme bildirdi. Yönetim, talep koşullarının yıl ikinci yarısında toparlanmasını bekliyor.',
    source: 'KAP',
    newsType: 'kap',
    sentiment: 'negative',
    stockSymbol: 'EREGL',
    stockName: 'Ereğli Demir Çelik',
    minutesAgo: 175,
  },
  {
    title: 'Dolar/TL yatay seyrediyor, altın gram fiyatı rekor tazeledi',
    content:
      'Döviz piyasasında dolar/TL dar bir bantta hareket ederken, ons altındaki yükseliş ve kur etkisiyle gram altın yeni zirvesini gördü. Kıymetli metallerde güvenli liman talebi sürüyor.',
    source: 'Dünya',
    newsType: 'economic',
    sentiment: 'neutral',
    minutesAgo: 220,
  },
  {
    title: 'GARAN temettü politikasına ilişkin açıklama yaptı',
    content:
      'Garanti BBVA, güçlü sermaye yapısı ve karlılığına dayanarak nakit temettü dağıtımına ilişkin yönetim kurulu değerlendirmesini paylaştı. Açıklama yatırımcı ilgisini artırdı.',
    source: 'KAP',
    newsType: 'kap',
    sentiment: 'positive',
    stockSymbol: 'GARAN',
    stockName: 'Garanti Bankası',
    minutesAgo: 260,
  },
  {
    title: 'Sosyal medyada KCHOL enerji yatırımları gündemde',
    content:
      'Yatırımcı forumlarında ve sosyal medyada Koç Holding’in enerji ve rafineri tarafındaki yatırımlarının orta vadeli görünüme katkısı tartışılıyor. Beklentiler genel olarak olumlu.',
    source: 'Yatırımcı Forumu',
    newsType: 'social',
    sentiment: 'neutral',
    stockSymbol: 'KCHOL',
    stockName: 'Koç Holding',
    minutesAgo: 310,
  },
  {
    title: 'Küresel piyasalarda teknoloji hisseleri haftaya pozitif başladı',
    content:
      'Wall Street vadelileri yükselişe işaret ederken, yapay zeka temalı teknoloji hisselerine ilgi sürüyor. Analistler bilanço sezonu öncesi seçici pozisyonlanma öneriyor.',
    source: 'Bloomberg HT',
    newsType: 'news',
    sentiment: 'positive',
    minutesAgo: 380,
  },
];

/** Küratörlü demo haber listesini NewsItem[] olarak üretir (yeni → eski). */
export const getSampleNews = (): NewsItem[] => {
  const now = Date.now();
  return SEEDS.map((s, i) => {
    const publishedAt = new Date(now - s.minutesAgo * 60_000).toISOString();
    return {
      id: 900000 + i,
      stockSymbol: s.stockSymbol,
      stockName: s.stockName,
      title: s.title,
      content: s.content,
      source: s.source,
      sourceUrl: undefined,
      newsType: s.newsType,
      sentiment: s.sentiment,
      publishedAt,
      createdAt: new Date(now).toISOString(),
    };
  }).sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export default { getSampleNews };
