import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n';
import './index.css';

import Onboarding from './features/onboarding/Onboarding';
import DocumentTranslator from './features/documents/DocumentTranslator';
import VisitSummary from './features/visits/VisitSummary';
import MedicationGuide from './features/medications/MedicationGuide';
import Timeline from './features/timeline/Timeline';
import BringRecordsHome from './features/records/BringRecordsHome';
import Settings from './features/settings/Settings';
import BottomNav from './components/BottomNav';

function App() {
  const [onboarded, setOnboarded] = useState(
    () => localStorage.getItem('mira_onboarded') === 'true'
  );
  const { i18n } = useTranslation();

  useEffect(() => {
    const lang = localStorage.getItem('mira_language') || 'en';
    i18n.changeLanguage(lang);
    const rtlLangs = ['ar'];
    document.documentElement.dir = rtlLangs.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [i18n]);

  if (!onboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  return (
    <BrowserRouter>
      <div className="h-full flex flex-col bg-navy">
        <div className="flex-1 overflow-y-auto bg-navy">
          <Routes>
            <Route path="/" element={<Navigate to="/visits" replace />} />
            <Route path="/documents" element={<DocumentTranslator />} />
            <Route path="/visits" element={<VisitSummary />} />
            <Route path="/medications" element={<MedicationGuide />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/records" element={<BringRecordsHome />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
