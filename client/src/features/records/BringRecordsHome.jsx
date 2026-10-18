import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PageHeader from '../../components/PageHeader';
import LoadingCard from '../../components/LoadingCard';
import ErrorCard from '../../components/ErrorCard';
import { useTimeline } from '../../hooks/useTimeline';
import { useLanguage, LANGUAGES } from '../../hooks/useLanguage';

export default function BringRecordsHome() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { entries } = useTimeline();
  const [outputLang, setOutputLang] = useState(language);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('mira_user') || '{}'); } catch { return {}; }
  })();

  const dateRange = entries.length > 0
    ? {
        start: new Date(entries[entries.length - 1].date).toLocaleDateString(),
        end: new Date(entries[0].date).toLocaleDateString(),
      }
    : null;

  const handleGenerate = async () => {
    if (entries.length === 0) return;
    setLoading(true);
    setError(null);
    setPdfUrl(null);
    try {
      const { data } = await axios.post(
        '/api/records/generate-pdf',
        { entries, language: outputLang, userName: user.name || 'Patient' },
        { responseType: 'blob' }
      );
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      setPdfUrl(url);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = `mira-health-records-${new Date().toISOString().slice(0, 10)}.pdf`;
    a.click();
  };

  return (
    <div className="flex flex-col min-h-full bg-navy">
      <PageHeader title={t('records.title')} subtitle={t('records.subtitle')} />
      <main className="flex-1 bg-near-white rounded-t-3xl px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        {loading && <LoadingCard message={t('records.generating')} />}
        {!loading && error && <ErrorCard message={error} onRetry={handleGenerate} />}
        {!loading && !error && (
          <div className="flex flex-col gap-4">
            {entries.length === 0 ? (
              <EmptyState t={t} />
            ) : (
              <>
                <PreviewCard entries={entries} dateRange={dateRange} t={t} />

                {/* Language selector */}
                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <label className="block text-sm font-semibold text-navy mb-3">
                    {t('records.languageLabel')}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => setOutputLang(lang.code)}
                        className={`py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                          outputLang === lang.code
                            ? 'border-sky-blue bg-sky-blue text-white'
                            : 'border-gray-200 text-gray-600 hover:border-sky-blue'
                        }`}
                      >
                        {lang.nativeLabel}
                      </button>
                    ))}
                  </div>
                </div>

                {!pdfUrl ? (
                  <button
                    onClick={handleGenerate}
                    className="w-full bg-sky-blue text-white py-4 rounded-2xl font-semibold text-base shadow hover:bg-dark-blue transition-colors active:scale-95"
                  >
                    {t('records.prepareButton')}
                  </button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
                      <p className="text-green-700 font-semibold">✓ Your records are ready</p>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="w-full bg-sky-blue text-white py-4 rounded-2xl font-semibold text-base shadow hover:bg-dark-blue transition-colors active:scale-95"
                    >
                      📥 {t('records.download')}
                    </button>
                    <button
                      onClick={() => { setPdfUrl(null); setOutputLang(language); }}
                      className="w-full py-3 border border-gray-200 text-gray-600 rounded-2xl font-medium text-sm hover:bg-gray-50"
                    >
                      {t('common.back')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PreviewCard({ entries, dateRange, t }) {
  const typeCounts = entries.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="bg-dark-blue rounded-2xl p-5 text-white">
      <h3 className="font-semibold mb-4">{t('records.preview.title')}</h3>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-light-blue opacity-80">{t('records.preview.entries', { count: entries.length })}</span>
        </div>
        {dateRange && (
          <div className="flex justify-between text-sm">
            <span className="text-light-blue opacity-80">
              {t('records.preview.dateRange', { start: dateRange.start, end: dateRange.end })}
            </span>
          </div>
        )}
        <div className="border-t border-white border-opacity-20 pt-3 mt-1 flex flex-wrap gap-2">
          {Object.entries(typeCounts).map(([type, count]) => (
            <span key={type} className="bg-white bg-opacity-10 text-xs px-2 py-1 rounded-full">
              {count} {type}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ t }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">🌍</div>
      <p className="text-gray-500 text-sm leading-relaxed">{t('records.emptyState')}</p>
    </div>
  );
}
