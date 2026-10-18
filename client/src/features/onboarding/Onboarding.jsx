import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage, LANGUAGES } from '../../hooks/useLanguage';

export default function Onboarding({ onComplete }) {
  const [step, setStep] = useState(0);
  const { t } = useTranslation();
  const { changeLanguage, language } = useLanguage();

  const handleLanguageSelect = (code) => {
    changeLanguage(code);
  };

  const handleComplete = () => {
    localStorage.setItem('mira_onboarded', 'true');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      {step === 0 && <WelcomeScreen onNext={() => setStep(1)} t={t} />}
      {step === 1 && (
        <LanguageScreen
          onNext={handleComplete}
          t={t}
          onSelect={handleLanguageSelect}
          selected={language}
        />
      )}
    </div>
  );
}

function WelcomeScreen({ onNext, t }) {
  return (
    <div className="flex flex-col items-center justify-between min-h-screen px-6 py-16 text-center">
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        {/* Logo */}
        <div className="w-20 h-20 rounded-2xl bg-sky-blue flex items-center justify-center shadow-lg">
          <span className="text-white text-3xl font-bold">M</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold text-white mb-3">{t('common.appName')}</h1>
          <p className="text-light-blue text-lg leading-relaxed max-w-xs">
            {t('onboarding.tagline')}
          </p>
        </div>
        {/* Illustration dots */}
        <div className="flex gap-3 mt-4">
          {['🏥', '📋', '💊', '🌍'].map((emoji, i) => (
            <div key={i} className="w-12 h-12 rounded-2xl bg-dark-blue flex items-center justify-center text-xl">
              {emoji}
            </div>
          ))}
        </div>
      </div>
      <button
        onClick={onNext}
        className="w-full max-w-xs bg-sky-blue text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
      >
        {t('onboarding.continue')}
      </button>
    </div>
  );
}

function LanguageScreen({ onNext, t, onSelect, selected }) {
  return (
    <div className="flex flex-col min-h-screen px-6 py-16">
      <div className="flex-1">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Choose your language
          </h2>
          <div className="flex flex-wrap justify-center gap-1 text-sm text-light-blue opacity-70">
            <span>语言</span>
            <span>•</span>
            <span>भाषा</span>
            <span>•</span>
            <span>언어</span>
            <span>•</span>
            <span>اللغة</span>
          </div>
        </div>
        <div className="flex flex-col gap-3 max-w-sm mx-auto">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onSelect(lang.code)}
              className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all ${
                selected === lang.code
                  ? 'bg-sky-blue border-sky-blue text-white'
                  : 'bg-dark-blue border-dark-blue text-light-blue hover:border-sky-blue'
              }`}
            >
              <span className="text-lg font-semibold">{lang.nativeLabel}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm ${selected === lang.code ? 'text-white opacity-80' : 'text-gray-400'}`}>
                  {lang.label}
                </span>
                {selected === lang.code && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="mt-8 max-w-sm mx-auto w-full">
        <button
          onClick={onNext}
          className="w-full bg-sky-blue text-white py-4 rounded-2xl text-lg font-semibold shadow-lg hover:bg-opacity-90 active:scale-95 transition-all"
        >
          {t('onboarding.continue')}
        </button>
      </div>
    </div>
  );
}

