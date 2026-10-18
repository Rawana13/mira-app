import React from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import { useLanguage, LANGUAGES } from '../../hooks/useLanguage';

export default function Settings() {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('mira_user') || '{}'); } catch { return {}; }
  })();

  const handleClearData = () => {
    if (window.confirm(t('settings.clearDataConfirm'))) {
      localStorage.removeItem('mira_timeline');
      window.location.reload();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-near-white">
      <PageHeader title={t('settings.title')} />
      <main className="flex-1 px-4 py-4 pb-safe max-w-lg mx-auto w-full">
        {user.name && (
          <div className="bg-dark-blue rounded-2xl p-5 text-white mb-4">
            <p className="text-light-blue text-xs opacity-70 mb-1">Signed in as</p>
            <p className="font-semibold">{user.name}</p>
            {user.email && <p className="text-light-blue text-sm opacity-70">{user.email}</p>}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-navy mb-4">{t('settings.language')}</h3>
          <div className="flex flex-col gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
                  language === lang.code
                    ? 'border-sky-blue bg-blue-50 text-sky-blue'
                    : 'border-gray-100 text-gray-700 hover:border-gray-200'
                }`}
              >
                <span className="font-medium">{lang.nativeLabel}</span>
                <span className="text-sm opacity-70">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5 mb-4">
          <h3 className="font-semibold text-navy mb-2">{t('settings.about')}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{t('settings.aboutText')}</p>
        </div>

        <button
          onClick={handleClearData}
          className="w-full py-3 border border-urgent text-urgent rounded-2xl font-medium text-sm hover:bg-red-50 transition-colors"
        >
          {t('settings.clearData')}
        </button>
      </main>
    </div>
  );
}
