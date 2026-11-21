// Leonida Ledger progress store (v2).
//
// One small job: keep the reader's earned trophies and toolbar settings in
// localStorage, and let them take a copy out (export) or bring one back
// (import). Nothing leaves the browser except the file the reader downloads
// on purpose, and nothing is read from the network. The stored shape is
// deliberately boring — { earned: [ids], settings: {...} } — so a file
// exported by the first version of this guide still imports cleanly.
export const STORE_KEY = 'leonida-ledger-v1';

// The toolbar settings this guide remembers between visits. `kind` and
// `grade` are the active filters, `query` the search box, and the two
// booleans the hide-earned and spoiler switches.
export const DEFAULT_SETTINGS = {
  spoiler: false,
  hideEarned: false,
  kind: 'all',
  grade: 'all',
  query: '',
};

// The only values an imported file may set for the two dropdown filters.
// Anything else falls back to 'all' instead of breaking the toolbar.
const KNOWN_KINDS = new Set([
  'all', 'story', 'missable', 'collectibles', 'activities',
  'robbery', 'exploration', 'money', 'online',
]);
const KNOWN_GRADES = new Set(['all', 'platinum', 'gold', 'silver', 'bronze']);

// Read the stored state, or a fresh one when there is nothing (or nothing
// usable) in localStorage. Never throws: a corrupt entry is treated as empty.
export function loadStore() {
  const fresh = () => ({ earned: [], settings: { ...DEFAULT_SETTINGS } });
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return fresh();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return fresh();
    const earned = Array.isArray(parsed.earned)
      ? [...new Set(parsed.earned.filter((n) => Number.isInteger(n) && n >= 1 && n <= 55))]
      : [];
    return { earned, settings: cleanSettings(parsed.settings) };
  } catch {
    return fresh();
  }
}

// Merge a settings object over the defaults, dropping anything unknown or
// out of range, so a hand-edited or older file cannot wedge the UI.
export function cleanSettings(input) {
  const settings = { ...DEFAULT_SETTINGS, ...(input || {}) };
  if (!KNOWN_KINDS.has(settings.kind)) settings.kind = 'all';
  if (!KNOWN_GRADES.has(settings.grade)) settings.grade = 'all';
  settings.spoiler = settings.spoiler === true;
  settings.hideEarned = settings.hideEarned === true;
  settings.query = typeof settings.query === 'string' ? settings.query : '';
  return settings;
}

export function saveStore(store) {
  try {
    window.localStorage.setItem(STORE_KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

// Flip one trophy's earned state and persist. The earned list stays sorted
// by trophy id, so exports are stable and easy to read.
export function toggleEarned(store, trophyId) {
  const earned = new Set(store.earned);
  if (earned.has(trophyId)) earned.delete(trophyId);
  else earned.add(trophyId);
  store.earned = [...earned].sort((a, b) => a - b);
  saveStore(store);
  return store;
}

// Mark a whole list earned (or not earned) at once — used by the
// "mark all visible" button in the toolbar. Persists like toggleEarned.
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

// Empty the store completely and persist the empty state.
export function resetStore(store) {
  store.earned = [];
  saveStore(store);
  return store;
}

// Download the progress as a JSON file the reader can keep or move to
// another browser. The filename is fixed so an import can be recognised.
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

// Read an exported progress file back. Accepts the full export shape and
// the bare { earned: [...] } shape, and rejects anything that is neither.
// Trophy ids outside 1..55 are dropped, never trusted.
export function parseImportFile(text) {
  const parsed = JSON.parse(text);
  if (parsed && parsed.app && parsed.app !== 'leonida-ledger') {
    throw new Error('Not a Leonida Ledger progress file: wrong app name.');
  }
  if (!parsed || !Array.isArray(parsed.earned)) {
    throw new Error('Not a Leonida Ledger progress file: no earned list found.');
  }
  const earned = parsed.earned
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 55)
    .sort((a, b) => a - b);
  // A file may list a trophy twice; the set keeps one copy of each id.
  return { earned: [...new Set(earned)], settings: cleanSettings(parsed.settings) };
}
