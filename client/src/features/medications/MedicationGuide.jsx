import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PageHeader from '../../components/PageHeader';
import LoadingCard from '../../components/LoadingCard';
import ErrorCard from '../../components/ErrorCard';
import { useTimeline } from '../../hooks/useTimeline';
import { useLanguage } from '../../hooks/useLanguage';

export default function MedicationGuide() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { addEntry } = useTimeline();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles.length) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('prescription', acceptedFiles[0]);
      formData.append('language', language);
      const { data } = await axios.post('/api/medications/lookup-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }, [language, t]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    noClick: true,
  });

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/medications/lookup', {
        medication: query.trim(),
        language,
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    addEntry({
      type: 'medication',
      summary: result.name || query,
      detail: result,
    });
    setSaved(true);
  };

  const handleReset = () => {
    setQuery('');
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-navy">
      <PageHeader title={t('medications.title')} subtitle={t('medications.subtitle')} />
      <main className="flex-1 bg-near-white rounded-t-3xl px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        {loading && <LoadingCard message={t('medications.searching')} />}
        {!loading && error && <ErrorCard message={error} onRetry={handleSearch} />}
        {!loading && !result && !error && (
          <SearchArea
            query={query}
            onQuery={setQuery}
            onSearch={handleSearch}
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            t={t}
          />
        )}
        {!loading && result && (
          <MedicationCard
            result={result}
            onSave={handleSave}
            onReset={handleReset}
            saved={saved}
            t={t}
          />
        )}
      </main>
    </div>
  );
}

function SearchArea({ query, onQuery, onSearch, getRootProps, getInputProps, t }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={t('medications.searchPlaceholder')}
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onSearch()}
          className="flex-1 bg-white border-2 border-gray-200 focus:border-sky-blue rounded-2xl px-4 py-4 text-base text-navy placeholder-gray-400 outline-none transition-colors"
        />
        <button
          onClick={onSearch}
          disabled={!query.trim()}
          className="bg-sky-blue text-white px-5 rounded-2xl font-medium hover:bg-dark-blue transition-colors active:scale-95 disabled:opacity-40"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <div className="flex-1 border-t border-gray-200" />
        <span>{t('medications.orUpload')}</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <div {...getRootProps()} className="rounded-3xl p-6 text-center bg-white border border-gray-100 shadow-sm cursor-pointer hover:shadow-md hover:border-sky-blue/40 transition-all">
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>
          <span className="text-gray-700 text-sm font-semibold">Tap to upload a photo</span>
          <span className="text-gray-400 text-xs">JPG or PNG of your prescription label</span>
        </div>
      </div>
    </div>
  );
}

function MedicationCard({ result, onSave, onReset, saved, t }) {
  const sections = [
    { key: 'what_for', label: t('medications.sections.whatFor'), icon: '🎯' },
    { key: 'how_to_take', label: t('medications.sections.howToTake'), icon: '⏰' },
    { key: 'what_to_avoid', label: t('medications.sections.avoid'), icon: '⚠️' },
    { key: 'missed_dose', label: t('medications.sections.missedDose'), icon: '📅' },
    { key: 'storage', label: t('medications.sections.storage'), icon: '🏠' },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Medication header */}
      <div className="bg-dark-blue rounded-2xl p-5 text-white">
        <h2 className="text-xl font-bold mb-1">{result.name}</h2>
        {result.generic_name && (
          <p className="text-light-blue text-sm opacity-80">Generic: {result.generic_name}</p>
        )}
      </div>

      {/* Side effects */}
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="font-semibold text-navy mb-3 text-sm flex items-center gap-2">
          <span>💊</span>{t('medications.sections.sideEffects')}
        </h3>
        {result.side_effects?.common?.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              {t('medications.sections.commonSideEffects')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {result.side_effects.common.map((s, i) => (
                <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-sky-blue mt-0.5">•</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.side_effects?.call_doctor?.length > 0 && (
          <div className="bg-red-50 rounded-xl p-3 mt-2">
            <p className="text-xs font-semibold text-urgent uppercase tracking-wide mb-2">
              {t('medications.sections.callDoctor')}
            </p>
            <ul className="flex flex-col gap-1.5">
              {result.side_effects.call_doctor.map((s, i) => (
                <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                  <span className="mt-0.5">⚠</span>{s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Other sections */}
      {sections.map(({ key, label, icon }) => {
        const content = result[key];
        if (!content) return null;
        return (
          <div key={key} className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="font-semibold text-navy mb-2 text-sm flex items-center gap-2">
              <span>{icon}</span>{label}
            </h3>
            <p className="text-gray-700 text-sm leading-relaxed">{content}</p>
          </div>
        );
      })}

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center leading-relaxed px-2">
        ℹ️ {t('medications.disclaimer')}
      </p>

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-sky-blue text-white hover:bg-dark-blue active:scale-95'
          }`}
        >
          {saved ? `✓ ${t('timeline.types.medication')}` : t('documents.saveToTimeline')}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
        >
          {t('common.back')}
        </button>
      </div>
    </div>
  );
}
