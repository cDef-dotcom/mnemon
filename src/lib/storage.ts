import { SOMMELIER_PRESET_LESSONS, PresetLesson } from './sommelier-preset';

export interface StoredSource {
  id: string;
  name: string;
  type: string;
  mastery: number;
  lessonsCount: number;
  status: 'ready' | 'processing';
  lessons: PresetLesson[];
}

const STORAGE_KEY_SOURCES = 'mnemon_sources_v1';

export function getInitialSources(): StoredSource[] {
  if (typeof window === 'undefined') {
    return [getDefaultSommelierSource()];
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOURCES);
    if (!raw) {
      const defaultSources = [getDefaultSommelierSource()];
      localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(defaultSources));
      return defaultSources;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [getDefaultSommelierSource()];
  } catch (err) {
    console.error('Failed to read sources from storage:', err);
    return [getDefaultSommelierSource()];
  }
}

export function saveSource(source: StoredSource): StoredSource[] {
  const current = getInitialSources();
  const existingIdx = current.findIndex((s) => s.id === source.id);
  
  let updated: StoredSource[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = source;
  } else {
    updated = [source, ...current];
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY_SOURCES, JSON.stringify(updated));
  }
  return updated;
}

export function getSourceById(id: string): StoredSource | null {
  const sources = getInitialSources();
  return sources.find((s) => s.id === id) || null;
}

function getDefaultSommelierSource(): StoredSource {
  return {
    id: 'sommelier-wine-fundamentals',
    name: 'Wine Sommelier Fundamentals',
    type: 'sommelier_preset',
    mastery: 0,
    lessonsCount: SOMMELIER_PRESET_LESSONS.length,
    status: 'ready',
    lessons: SOMMELIER_PRESET_LESSONS,
  };
}
