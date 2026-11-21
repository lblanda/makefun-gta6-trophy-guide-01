// Progress store for Leonida Ledger: earned trophies and settings in localStorage,
// with export to a file and import back. Nothing leaves the browser except the file
// the reader downloads on purpose.
export const STORE_KEY = 'leonida-ledger-v1';

export const DEFAULT_SETTINGS = {
  spoiler: false,
  hideEarned: false,
  kind: 'all',
  grade: 'all',
  query: '',
};

export function loadStore() {
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return { earned: [], settings: { ...DEFAULT_SETTINGS } };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { earned: [], settings: { ...DEFAULT_SETTINGS } };
    const earned = Array.isArray(parsed.earned) ? parsed.earned.filter((n) => Number.isInteger(n)) : [];
    const settings = { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) };
    return { earned, settings };
  } catch {
    return { earned: [], settings: { ...DEFAULT_SETTINGS } };
  }
}

export function saveStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export function toggleEarned(store, trophyId) {
  const earned = new Set(store.earned);
  if (earned.has(trophyId)) earned.delete(trophyId);
  else earned.add(trophyId);
  store.earned = [...earned].sort((a, b) => a - b);
  saveStore(store);
  return store;
}

export function markAllEarned(store, ids, earned) {
  const set = new Set(store.earned);
  for (const id of ids) {
    if (earned) set.add(id);
    else set.delete(id);
  }
  store.earned = [...set].sort((a, b) => a - b);
  saveStore(store);
  return store;
}

export function exportProgress(store) {
  const payload = {
    app: 'leonida-ledger',
    game: 'Grand Theft Auto VI',
    exportedAt: new Date().toISOString(),
    earned: store.earned,
    settings: store.settings,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'gta6-trophy-progress.json';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function parseImportFile(text) {
  const parsed = JSON.parse(text);
  if (parsed && parsed.app && parsed.app !== 'leonida-ledger') {
    throw new Error('Not a Leonida Ledger progress file: wrong app name.');
  }
  const source = parsed && Array.isArray(parsed.earned) ? parsed : parsed;
  if (!source || !Array.isArray(source.earned)) throw new Error('Not a Leonida Ledger progress file: no earned list found.');
  const earned = source.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55);
  const settings = { ...DEFAULT_SETTINGS, ...((parsed && parsed.settings) || {}) };
  return { earned, settings };
}
