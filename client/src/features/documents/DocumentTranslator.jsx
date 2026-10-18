import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PageHeader from '../../components/PageHeader';
import LoadingCard from '../../components/LoadingCard';
import ErrorCard from '../../components/ErrorCard';
import { useTimeline } from '../../hooks/useTimeline';
import { useLanguage } from '../../hooks/useLanguage';

export default function DocumentTranslator() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { addEntry } = useTimeline();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [saved, setSaved] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setResult(null);
      setError(null);
      setSaved(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
  });

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('language', language);
      const { data } = await axios.post('/api/documents/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data);
      setActiveTab('summary');
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    addEntry({
      type: 'document',
      summary: result.summary?.substring(0, 120) + '...',
      detail: result,
      fileName: file?.name,
    });
    setSaved(true);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-navy">
      <PageHeader
        title={t('documents.title')}
        subtitle={t('documents.subtitle')}
      />
      <main className="flex-1 bg-near-white rounded-t-3xl px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        {loading && <LoadingCard message={file ? t('documents.analyzing') : t('documents.reading')} />}

        {!loading && error && (
          <ErrorCard message={error} onRetry={handleAnalyze} />
        )}

        {!loading && !result && !error && (
          <UploadArea
            getRootProps={getRootProps}
            getInputProps={getInputProps}
            isDragActive={isDragActive}
            file={file}
            onAnalyze={handleAnalyze}
            t={t}
          />
        )}

        {!loading && result && (
          <ResultView
            result={result}
            activeTab={activeTab}
            onTabChange={setActiveTab}
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

function UploadArea({ getRootProps, getInputProps, isDragActive, file, onAnalyze, t }) {
  return (
    <div className="flex flex-col gap-3">
      <div
        {...getRootProps()}
        className={`rounded-3xl p-8 text-center cursor-pointer transition-all ${
          isDragActive || file
            ? 'bg-sky-blue/5 border-2 border-sky-blue'
            : 'bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-sky-blue/40'
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-blue/10 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2E86AB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
            </div>
            <div>
              <p className="text-navy font-semibold text-sm break-all leading-snug">{file.name}</p>
              <p className="text-gray-400 text-xs mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready to analyze</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 16 12 12 8 16" />
                <line x1="12" y1="12" x2="12" y2="21" />
                <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
              </svg>
            </div>
            <div>
              <p className="text-navy font-semibold text-base">{t('documents.uploadTitle')}</p>
              <p className="text-gray-400 text-sm mt-0.5">{t('documents.supportedTypes')}</p>
            </div>
          </div>
        )}
      </div>

      {file ? (
        <button
          onClick={onAnalyze}
          className="w-full bg-sky-blue text-white py-4 rounded-2xl font-semibold text-base shadow-sm hover:bg-dark-blue transition-colors active:scale-95"
        >
          {t('documents.analyzeButton')}
        </button>
      ) : (
        <p className="text-xs text-gray-400 text-center px-4 leading-relaxed flex items-center justify-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          {t('documents.privacyNote')}
        </p>
      )}
    </div>
  );
}

function ResultView({ result, activeTab, onTabChange, onSave, onReset, saved, t }) {
  const TABS_CONFIG = [
    { key: 'summary', label: t('documents.tabs.summary') },
    { key: 'actions', label: t('documents.tabs.actions') },
    { key: 'terms', label: t('documents.tabs.terms') },
    { key: 'followUp', label: t('documents.tabs.followUp') },
  ];

  return (
    <div className="flex flex-col gap-4">
      {result.urgent_flag && (
        <div className="bg-urgent text-white rounded-2xl px-4 py-3 flex items-start gap-3">
          <span className="text-xl mt-0.5">⚠️</span>
          <div>
            <p className="font-semibold text-sm">{t('documents.urgentBanner')}</p>
            <p className="text-sm mt-1 opacity-90">{result.urgent_message}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-white rounded-2xl p-1 gap-1 shadow-sm overflow-x-auto">
        {TABS_CONFIG.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => onTabChange(key)}
            className={`flex-1 py-2 px-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
              activeTab === key
                ? 'bg-sky-blue text-white shadow-sm'
                : 'text-gray-500 hover:text-dark-blue'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="bg-white rounded-2xl p-5 shadow-sm min-h-48">
        {activeTab === 'summary' && (
          <div>
            <h3 className="font-semibold text-navy mb-3">{t('documents.tabs.summary')}</h3>
            <p className="text-gray-700 leading-relaxed text-sm">{result.summary}</p>
          </div>
        )}
        {activeTab === 'actions' && (
          <div>
            <h3 className="font-semibold text-navy mb-3">{t('documents.tabs.actions')}</h3>
            <div className="flex flex-col gap-3">
              {(result.action_items || []).map((item, i) => (
                <ActionItem key={i} item={item} t={t} />
              ))}
            </div>
          </div>
        )}
        {activeTab === 'terms' && (
          <div>
            <h3 className="font-semibold text-navy mb-3">{t('documents.tabs.terms')}</h3>
            <div className="flex flex-col gap-3">
              {(result.terms_explained || []).map((term, i) => (
                <div key={i} className="border-s-2 border-sky-blue ps-3">
                  <p className="font-semibold text-dark-blue text-sm">{term.term}</p>
                  <p className="text-gray-600 text-sm mt-0.5">{term.definition}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'followUp' && (
          <div>
            <h3 className="font-semibold text-navy mb-3">{t('documents.tabs.followUp')}</h3>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-3 ${result.follow_up_needed ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
              <span>{result.follow_up_needed ? '📅' : '✅'}</span>
              <span className="font-medium text-sm">
                {result.follow_up_needed ? t('documents.followUpNeeded') : t('documents.noFollowUp')}
              </span>
            </div>
            {result.follow_up_details && (
              <p className="text-gray-700 text-sm leading-relaxed">{result.follow_up_details}</p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex-1 py-3 rounded-2xl font-medium text-sm transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-sky-blue text-white hover:bg-dark-blue active:scale-95'
          }`}
        >
          {saved ? `✓ ${t('documents.savedSuccess')}` : t('documents.saveToTimeline')}
        </button>
        <button
          onClick={onReset}
          className="px-4 py-3 rounded-2xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-all"
        >
          {t('documents.uploadAnother')}
        </button>
      </div>
    </div>
  );
}

function ActionItem({ item, t }) {
  const colors = {
    urgent: 'bg-red-50 text-red-700 border-red-200',
    soon: 'bg-amber-50 text-amber-700 border-amber-200',
    convenient: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  const labels = {
    urgent: t('documents.urgency.urgent'),
    soon: t('documents.urgency.soon'),
    convenient: t('documents.urgency.convenient'),
  };
  const urgency = (item.urgency || 'convenient').toLowerCase();
  return (
    <div className={`border rounded-xl p-3 ${colors[urgency] || colors.convenient}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-semibold uppercase tracking-wide opacity-70">
          {labels[urgency] || item.urgency}
        </span>
      </div>
      <p className="text-sm leading-relaxed">{item.action || item}</p>
    </div>
  );
}
