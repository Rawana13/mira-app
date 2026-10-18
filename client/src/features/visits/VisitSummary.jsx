import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import PageHeader from '../../components/PageHeader';
import LoadingCard from '../../components/LoadingCard';
import ErrorCard from '../../components/ErrorCard';
import { useTimeline } from '../../hooks/useTimeline';
import { useLanguage, LANGUAGES } from '../../hooks/useLanguage';

export default function VisitSummary() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { addEntry } = useTimeline();
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  const handleGenerate = async () => {
    if (!notes.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.post('/api/visits/summarize', { notes, mode: 'after', language });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;
    addEntry({ type: 'visit', summary: result.summary?.substring(0, 120) + '...', detail: result, notes });
    setSaved(true);
  };

  const handleReset = () => {
    setNotes('');
    setResult(null);
    setError(null);
    setSaved(false);
  };

  return (
    <div className="flex flex-col min-h-full bg-navy">
      <PageHeader title={t('visits.title')} subtitle={t('visits.subtitle')} />
      <main className="flex-1 bg-near-white rounded-t-3xl px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        {loading && <LoadingCard message={t('visits.generating')} />}
        {!loading && error && <ErrorCard message={error} onRetry={handleGenerate} />}
        {!loading && !result && !error && (
          <RecordArea notes={notes} onNotes={setNotes} onGenerate={handleGenerate} t={t} />
        )}
        {!loading && result && (
          <SummaryView result={result} notes={notes} onSave={handleSave} onReset={handleReset} saved={saved} t={t} onUpdate={setResult} />
        )}
      </main>
    </div>
  );
}

function RecordArea({ notes, onNotes, onGenerate, t }) {
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      mediaRecorderRef.current?.stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType });
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        clearInterval(timerRef.current);
        setRecordingTime(0);
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setTranscribing(true);
        try {
          const form = new FormData();
          form.append('audio', blob, mimeType.includes('mp4') ? 'recording.m4a' : 'recording.webm');
          const { data } = await axios.post('/api/visits/transcribe', form, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
          onNotes((prev) => (prev ? prev + '\n\n' : '') + data.transcript);
        } catch { /* silent */ } finally {
          setTranscribing(false);
        }
      };
      mediaRecorderRef.current = recorder;
      recorder.start(250);
      setRecording(true);
      timerRef.current = setInterval(() => setRecordingTime((s) => s + 1), 1000);
    } catch {
      alert('Microphone access denied. Please allow microphone in your browser settings.');
    }
  };

  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };
  const canRecord = !!(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col gap-4">
      {canRecord && (
        <button
          onClick={recording ? stopRecording : startRecording}
          disabled={transcribing}
          className={`w-full py-4 rounded-xl font-semibold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-3 ${
            recording ? 'bg-red-500 text-white'
            : transcribing ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-sky-blue text-white hover:bg-dark-blue'
          }`}
        >
          {recording ? (
            <><span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" /><span>Recording {fmt(recordingTime)} — tap to stop</span></>
          ) : transcribing ? (
            <><span className="w-4 h-4 border-2 border-gray-300 border-t-sky-blue rounded-full animate-spin" /><span>Transcribing…</span></>
          ) : (
            <><MicIcon /><span>Record Appointment</span></>
          )}
        </button>
      )}

      <div className="flex items-center gap-3 text-gray-400 text-xs">
        <div className="flex-1 border-t border-gray-200" />
        <span>or type notes</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <textarea
        value={notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Type appointment notes here..."
        rows={6}
        className="w-full bg-white border border-gray-200 focus:border-sky-blue rounded-xl px-4 py-3 text-base text-navy placeholder-gray-400 outline-none resize-none transition-colors leading-relaxed"
      />

      <button
        onClick={onGenerate}
        disabled={!notes.trim()}
        className="w-full border-2 border-sky-blue text-sky-blue py-4 rounded-xl font-semibold text-base hover:bg-sky-blue hover:text-white transition-colors active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed disabled:border-gray-200 disabled:text-gray-400"
      >
        Generate Summary
      </button>
    </div>
  );
}

function SummaryView({ result, notes, onSave, onReset, onUpdate, saved, t }) {
  const [translating, setTranslating] = useState(false);
  const [activeLang, setActiveLang] = useState('en');

  const handleTranslate = async (langCode) => {
    if (langCode === activeLang) return;
    setTranslating(true);
    setActiveLang(langCode);
    try {
      const { data } = await axios.post('/api/visits/summarize', {
        notes,
        mode: 'after',
        language: langCode,
      });
      onUpdate(data);
    } catch { /* silent */ } finally {
      setTranslating(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Translate row */}
      <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
        <p className="text-xs text-gray-400 font-medium mb-2">Translate summary</p>
        <div className="flex gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleTranslate(lang.code)}
              disabled={translating}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeLang === lang.code
                  ? 'bg-sky-blue text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              } disabled:opacity-50`}
            >
              {lang.nativeLabel}
            </button>
          ))}
        </div>
        {translating && (
          <p className="text-xs text-sky-blue text-center mt-2 animate-pulse">Translating…</p>
        )}
      </div>
      {/* Summary */}
      {result.summary && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy text-base mb-3 flex items-center gap-2">
            <span className="text-lg">📋</span> Visit Summary
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">{result.summary}</p>
        </div>
      )}

      {/* Next steps */}
      {result.next_steps?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy text-base mb-3 flex items-center gap-2">
            <span className="text-lg">✅</span> Your Next Steps
          </h3>
          <ul className="flex flex-col gap-2">
            {result.next_steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-sky-blue mt-0.5 flex-shrink-0 font-bold">{i + 1}.</span>
                <span className="leading-relaxed">{step}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Medications */}
      {result.medications?.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy text-base mb-3 flex items-center gap-2">
            <span className="text-lg">💊</span> Medication Instructions
          </h3>
          <div className="flex flex-col gap-3">
            {result.medications.map((med, i) => (
              <div key={i} className="bg-near-white rounded-xl p-4">
                <p className="font-semibold text-navy text-sm mb-1">{med.name || med}</p>
                {med.what_it_is && <p className="text-xs text-gray-500 mb-1">{med.what_it_is}</p>}
                {med.how_to_take && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">How to take: </span>{med.how_to_take}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-up */}
      {result.follow_up?.needed && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-bold text-navy text-base mb-3 flex items-center gap-2">
            <span className="text-lg">📅</span> Follow-Up Appointment
          </h3>
          {result.follow_up.when && (
            <p className="text-sm font-semibold text-sky-blue mb-2">{result.follow_up.when}</p>
          )}
          {result.follow_up.how_to_book && (
            <p className="text-sm text-gray-700 leading-relaxed">{result.follow_up.how_to_book}</p>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onSave}
          disabled={saved}
          className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
            saved ? 'bg-green-100 text-green-700' : 'bg-sky-blue text-white hover:bg-dark-blue active:scale-[0.98]'
          }`}
        >
          {saved ? '✓ Saved' : 'Save to Timeline'}
        </button>
        <button
          onClick={onReset}
          className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-all"
        >
          New Visit
        </button>
      </div>
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  );
}
