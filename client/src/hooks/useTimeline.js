import { useState, useEffect } from 'react';

const STORAGE_KEY = 'mira_timeline';

export function useTimeline() {
  const [entries, setEntries] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const addEntry = (entry) => {
    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...entry,
    };
    setEntries((prev) => [newEntry, ...prev]);
    return newEntry.id;
  };

  const deleteEntry = (id) => {
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  return { entries, addEntry, deleteEntry };
}
