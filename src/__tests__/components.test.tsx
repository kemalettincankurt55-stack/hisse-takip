/**
 * Headless bileşen render testleri.
 * Bileşenlerin cihaz/tarayıcı olmadan, çökmeden render olduğunu ve temel
 * içeriği gösterdiğini doğrular (react-test-renderer + Testing Library).
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { TechnicalReportCard } from '../components/analysis/TechnicalReportCard';
import { DetailedChart } from '../components/stock/DetailedChart';
import { generateTechnicalReport } from '../services/analysis/technicalReport';
import { generateSamplePriceHistory } from '../services/analysis/sampleData';

describe('TechnicalReportCard', () => {
  it('dolu rapor ile sinyal etiketini gösterir', () => {
    const report = generateTechnicalReport(generateSamplePriceHistory('ASELS'), 'ASELS');
    const { getByText, getAllByText } = render(<TechnicalReportCard report={report} />);
    expect(getByText(report.signal)).toBeTruthy();
    expect(getAllByText(/ASELS/).length).toBeGreaterThanOrEqual(1);
  });

  it('yetersiz veride çökmeden bilgilendirme metni gösterir', () => {
    const report = generateTechnicalReport(generateSamplePriceHistory('X', 5), 'X');
    const { getByText } = render(<TechnicalReportCard report={report} />);
    expect(getByText(/yeterli fiyat verisi yok/i)).toBeTruthy();
  });
});

describe('DetailedChart', () => {
  it('yeterli veri ile çökmeden render olur (dönem seçici dahil)', () => {
    const data = generateSamplePriceHistory('THYAO', 132);
    const { getByText, getAllByText } = render(<DetailedChart data={data} currency="TRY" />);
    expect(getByText('1 Ay')).toBeTruthy();
    expect(getByText('6 Ay')).toBeTruthy();
    // "3 Ay" hem dönem butonunda hem aktif-dönem etiketinde görünür (varsayılan dönem)
    expect(getAllByText('3 Ay').length).toBeGreaterThanOrEqual(1);
    expect(getByText('RSI (14)')).toBeTruthy();
  });

  it('yetersiz veride boş durum mesajı gösterir', () => {
    const { getByText } = render(<DetailedChart data={[]} currency="TRY" />);
    expect(getByText(/yeterli veri yok/i)).toBeTruthy();
  });
});
