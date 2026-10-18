import React from 'react';
import { useTranslation } from 'react-i18next';

export default function ErrorCard({ message, onRetry }) {
  const { t } = useTranslation();
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <div className="text-urgent text-3xl mb-3">⚠️</div>
      <p className="text-red-800 font-medium mb-4">
        {message || t('common.error')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-sky-blue text-white px-6 py-2 rounded-xl font-medium hover:bg-dark-blue transition-colors"
        >
          {t('common.retry')}
        </button>
      )}
    </div>
  );
}
