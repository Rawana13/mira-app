import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function MiraLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 40 40" fill="none">
      <path d="M8 32 L8 14 L20 26 L32 14 L32 32" stroke="#2E72B0" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <path d="M14 32 L14 20 L20 26 L26 20 L26 32" stroke="#5CA0D8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.7"/>
    </svg>
  );
}

export default function PageHeader({ title, subtitle, showBack = false, action }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <header className="bg-navy px-5 pt-12 pb-8">
      <div className="max-w-lg mx-auto">
        {showBack ? (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-light-blue/70 text-sm font-medium mb-5 -ms-1 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="rtl:rotate-180">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            {t('common.back')}
          </button>
        ) : (
          <div className="flex items-center gap-2 mb-6">
            <MiraLogo />
            <span className="text-white font-bold text-lg tracking-tight">Mira</span>
          </div>
        )}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[32px] font-bold text-white leading-tight tracking-tight">{title}</h1>
            {subtitle && (
              <p className="text-[15px] text-white/50 mt-2 leading-snug font-normal">{subtitle}</p>
            )}
          </div>
          {action && <div className="mt-1">{action}</div>}
        </div>
      </div>
    </header>
  );
}
