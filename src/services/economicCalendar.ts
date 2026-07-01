/**
 * Ekonomik Takvim (hesaplanan)
 *
 * Ücretsiz güvenilir bir ekonomik takvim API'si bulunmadığından, yüksek etkili
 * düzenli olayların TARİH DESENLERİNDEN yaklaşan tarihlerini hesaplar
 * (TÜFE, tarım dışı istihdam, işsizlik başvuruları, merkez bankası kararları).
 *
 * Desen tabanlı olanlar (ilk Cuma, haftalık Perşembe, ayın 3'ü) doğrudur;
 * merkez bankası kararları yaklaşık (ayda bir) verilir ve "~" ile işaretlenir.
 */

export type EventImpact = 'high' | 'medium' | 'low';
export type EventCountry = 'TR' | 'US';

export interface EconomicEvent {
  id: string;
  date: string; // ISO (YYYY-MM-DD)
  time?: string;
  name: string;
  country: EventCountry;
  impact: EventImpact;
  approximate?: boolean;
  description: string;
}

const DESCRIPTIONS: Record<string, string> = {
  nfp: 'ABD\'de tarım dışı sektörlerde bir ayda oluşan istihdam değişimi. Fed\'in faiz kararları ve küresel piyasalar için en kritik verilerden biridir; beklentinin üzerinde gelmesi genelde doları güçlendirir.',
  claims: 'ABD\'de haftalık ilk işsizlik maaşı başvuruları. İşgücü piyasasının en güncel (haftalık) göstergesidir; artış işgücü piyasasının zayıfladığına işaret eder.',
  tufe: 'Türkiye\'de aylık tüketici enflasyonu (TÜİK). Faiz beklentilerini, TL\'yi ve BIST\'i doğrudan etkiler; beklentinin üzerinde gelmesi faiz artış baskısını yükseltir.',
  tcmb: 'TCMB Para Politikası Kurulu (PPK) faiz kararı. TL, tahvil ve borsa için yüksek etkilidir. Not: kesin tarih TCMB\'nin resmi takvimine göre değişebilir.',
  fed: 'ABD Merkez Bankası (FOMC) faiz kararı. Küresel risk iştahını, doları ve tüm piyasaları yönlendirir. Not: kesin tarih Fed\'in resmi takvimine göre değişebilir.',
};

// YEREL tarihi YYYY-MM-DD olarak biçimler (toISOString UTC'ye kaydırıp günü şaşırtıyor)
const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

// Verilen tarihten sonraki ilk (belirtilen hafta günü) — 0=Paz..6=Cmt
const nextWeekday = (from: Date, weekday: number): Date => {
  const d = new Date(from);
  const diff = (weekday - d.getDay() + 7) % 7 || 7;
  d.setDate(d.getDate() + diff);
  return d;
};

// Bir ayın ilk (belirtilen hafta günü)
const firstWeekdayOfMonth = (year: number, month: number, weekday: number): Date => {
  const d = new Date(year, month, 1);
  const diff = (weekday - d.getDay() + 7) % 7;
  d.setDate(1 + diff);
  return d;
};

// Hafta sonuna denk gelirse en yakın hafta içine kaydır (Cmt→Cuma, Paz→Pzt)
const nudgeToWeekday = (d: Date): Date => {
  const out = new Date(d);
  if (out.getDay() === 6) out.setDate(out.getDate() - 1);
  else if (out.getDay() === 0) out.setDate(out.getDate() + 1);
  return out;
};

// Sonraki "ayın N'i" (bugünden sonra)
const nextNthOfMonth = (from: Date, day: number): Date => {
  const d = new Date(from.getFullYear(), from.getMonth(), day);
  if (d <= from) d.setMonth(d.getMonth() + 1);
  return d;
};

/**
 * Bugünden itibaren yaklaşan ekonomik olayları (tarihe göre sıralı) üretir.
 */
export const getUpcomingEvents = (daysAhead = 45): EconomicEvent[] => {
  const now = new Date();
  const horizon = new Date(now);
  horizon.setDate(horizon.getDate() + daysAhead);
  const events: EconomicEvent[] = [];

  // ABD Tarım Dışı İstihdam — her ayın ilk Cuma'sı (yüksek etki)
  for (let m = 0; m < 3; m++) {
    const base = new Date(now.getFullYear(), now.getMonth() + m, 1);
    const nfp = firstWeekdayOfMonth(base.getFullYear(), base.getMonth(), 5);
    if (nfp >= now && nfp <= horizon)
      events.push({ id: `nfp-${iso(nfp)}`, date: iso(nfp), time: '15:30', name: 'ABD Tarım Dışı İstihdam', country: 'US', impact: 'high', description: DESCRIPTIONS.nfp });
  }

  // ABD Haftalık İşsizlik Başvuruları — her Perşembe (orta etki)
  let thu = nextWeekday(now, 4);
  while (thu <= horizon) {
    events.push({ id: `claims-${iso(thu)}`, date: iso(thu), time: '15:30', name: 'ABD İşsizlik Maaşı Başvuruları', country: 'US', impact: 'medium', description: DESCRIPTIONS.claims });
    thu = new Date(thu);
    thu.setDate(thu.getDate() + 7);
  }

  // Türkiye TÜFE (enflasyon) — her ayın ~3'ü (yüksek etki)
  const tufe = nextNthOfMonth(now, 3);
  if (tufe <= horizon)
    events.push({ id: `tufe-${iso(tufe)}`, date: iso(tufe), time: '10:00', name: 'TÜİK Enflasyon (TÜFE)', country: 'TR', impact: 'high', description: DESCRIPTIONS.tufe });

  // TCMB Faiz Kararı (PPK) — ayda bir, ~ayın 24'ü civarı (yüksek etki, yaklaşık)
  const tcmb = nudgeToWeekday(nextNthOfMonth(now, 24));
  if (tcmb <= horizon)
    events.push({ id: `tcmb-${iso(tcmb)}`, date: iso(tcmb), time: '14:00', name: 'TCMB Faiz Kararı', country: 'TR', impact: 'high', approximate: true, description: DESCRIPTIONS.tcmb });

  // Fed Faiz Kararı (FOMC) — ~6 haftada bir, ~ayın 18'i civarı (yüksek etki, yaklaşık)
  const fed = nudgeToWeekday(nextNthOfMonth(now, 18));
  if (fed <= horizon)
    events.push({ id: `fed-${iso(fed)}`, date: iso(fed), time: '21:00', name: 'Fed Faiz Kararı (FOMC)', country: 'US', impact: 'high', approximate: true, description: DESCRIPTIONS.fed });

  return events
    .filter((e) => e.date >= iso(now))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
};

export default { getUpcomingEvents };
