import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import PageHeader from '../../components/PageHeader';
import { useTimeline } from '../../hooks/useTimeline';

const FILTERS = ['all', 'visits', 'documents', 'medications', 'labs'];

const TYPE_MAP = {
  visit: 'visits',
  document: 'documents',
  medication: 'medications',
  lab: 'labs',
};

export default function Timeline() {
  const { t } = useTranslation();
  const { entries, deleteEntry } = useTimeline();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const filtered = entries.filter((e) => {
    const matchesFilter = filter === 'all' || TYPE_MAP[e.type] === filter;
    const matchesSearch =
      !search ||
      e.summary?.toLowerCase().includes(search.toLowerCase()) ||
      e.type?.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDelete = (id) => {
    deleteEntry(id);
    setConfirmDelete(null);
    if (expanded === id) setExpanded(null);
  };

  return (
    <div className="flex flex-col min-h-full bg-navy">
      <PageHeader title={t('timeline.title')} subtitle={t('timeline.subtitle')} />
      <main className="flex-1 bg-near-white rounded-t-3xl px-4 pt-6 pb-4 max-w-lg mx-auto w-full">
        {/* Search */}
        <div className="relative mb-3">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder={t('timeline.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-2xl ps-9 pe-4 py-3 text-sm text-navy placeholder-gray-400 outline-none focus:border-sky-blue transition-colors"
          />
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-hide">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filter === f ? 'bg-sky-blue text-white' : 'bg-white text-gray-500 border border-gray-200 hover:border-sky-blue'
              }`}
            >
              {t(`timeline.filters.${f}`)}
            </button>
          ))}
        </div>

        {/* Entries */}
        {filtered.length === 0 ? (
          <EmptyState t={t} hasEntries={entries.length > 0} />
        ) : (
          <div className="flex flex-col gap-3">
            {filtered.map((entry) => (
              <TimelineCard
                key={entry.id}
                entry={entry}
                isExpanded={expanded === entry.id}
                onToggle={() => setExpanded(expanded === entry.id ? null : entry.id)}
                onDeleteRequest={() => setConfirmDelete(entry.id)}
                t={t}
              />
            ))}
          </div>
        )}

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <p className="text-navy font-semibold mb-4 text-center">{t('timeline.deleteConfirm')}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-3 bg-urgent text-white rounded-2xl font-medium text-sm"
                >
                  {t('timeline.delete')}
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl font-medium text-sm"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function TimelineCard({ entry, isExpanded, onToggle, onDeleteRequest, t }) {
  const typeColors = {
    visit: 'bg-blue-100 text-blue-700',
    document: 'bg-purple-100 text-purple-700',
    medication: 'bg-green-100 text-green-700',
    lab: 'bg-amber-100 text-amber-700',
  };
  const typeIcons = {
    visit: '🏥',
    document: '📄',
    medication: '💊',
    lab: '🧪',
  };

  const date = new Date(entry.date);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <span className="text-xl flex-shrink-0 mt-0.5">{typeIcons[entry.type] || '📋'}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeColors[entry.type] || 'bg-gray-100 text-gray-600'}`}>
                {t(`timeline.types.${entry.type}`) || entry.type}
              </span>
              <span className="text-xs text-gray-400 flex-shrink-0">{dateStr}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">{entry.summary}</p>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={onToggle}
            className="text-sky-blue text-xs font-medium"
          >
            {isExpanded ? t('timeline.collapse') : t('timeline.expand')}
          </button>
          <button
            onClick={onDeleteRequest}
            className="text-gray-400 text-xs hover:text-urgent transition-colors"
          >
            {t('timeline.delete')}
          </button>
        </div>
      </div>

      {isExpanded && <ExpandedDetail entry={entry} t={t} />}
    </div>
  );
}

function ExpandedDetail({ entry, t }) {
  const detail = entry.detail;
  if (!detail) return null;

  if (entry.type === 'document') {
    return (
      <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed">
        {detail.summary && <p className="mb-2">{detail.summary}</p>}
        {detail.action_items?.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t('documents.tabs.actions')}</p>
            {detail.action_items.map((item, i) => (
              <p key={i} className="text-xs mb-1">• {item.action || item}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (entry.type === 'visit') {
    return (
      <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed">
        {detail.summary && <p>{detail.summary}</p>}
        {detail.medications?.length > 0 && (
          <div className="mt-3">
            <p className="font-semibold text-xs text-gray-500 uppercase mb-1">{t('visits.sections.medications')}</p>
            {detail.medications.map((m, i) => <p key={i} className="text-xs mb-1">• {m}</p>)}
          </div>
        )}
      </div>
    );
  }

  if (entry.type === 'medication') {
    return (
      <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm text-gray-700 leading-relaxed">
        {detail.what_for && <p><strong>{t('medications.sections.whatFor')}:</strong> {detail.what_for}</p>}
        {detail.how_to_take && <p className="mt-2"><strong>{t('medications.sections.howToTake')}:</strong> {detail.how_to_take}</p>}
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 p-4 bg-gray-50 text-sm text-gray-600">
      <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(detail, null, 2)}</pre>
    </div>
  );
}

function EmptyState({ t, hasEntries }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="text-5xl mb-4">🗓️</div>
      <h3 className="text-navy font-semibold mb-2">{t('timeline.emptyTitle')}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">
        {hasEntries ? 'No results match your search.' : t('timeline.emptySubtitle')}
      </p>
    </div>
  );
}
