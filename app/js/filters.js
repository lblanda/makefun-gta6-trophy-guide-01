// Filters and progress maths for Leonida Ledger.
//
// Two jobs live here: deciding which trophies a list view shows (kind,
// grade, search text, hide-earned, and the spoiler setting), and counting
// progress — by grade, by kind, by roadmap stage — for the header ring and
// the stats view. Nothing here touches the DOM or localStorage; app.js
// calls these with plain data and renders what they return.

export const KIND_LABELS = {
  all: 'All',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robbery',
  exploration: 'Exploration',
  money: 'Money',
  online: 'Online',
};

// Short words for the 1–5 difficulty the data file carries per trophy.
export const DIFFICULTY_WORDS = {
  1: 'Easy',
  2: 'Straightforward',
  3: 'A grind',
  4: 'Long grind',
  5: 'Hardest',
};

export function difficultyLabel(difficulty) {
  const n = Number.isInteger(difficulty) ? difficulty : 2;
  const word = DIFFICULTY_WORDS[n] || DIFFICULTY_WORDS[2];
  return `${n}/5 — ${word}`;
}

// A trophy is hidden by the spoiler setting when spoilers are on, the
// trophy is not earned yet, and it is a story trophy or a hidden one. The
// platinum is never hidden: earning everything else is the whole point.
export function isSpoilerHidden(trophy, settings, earnedSet) {
  if (!settings.spoiler) return false;
  if (earnedSet.has(trophy.id)) return false;
  if (trophy.grade === 'platinum') return false;
  return trophy.hidden === true || trophy.kind === 'story';
}

export function trophyMatchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return trophy.missable === true;
  if (kind === 'online') return false;
  if (kind === 'platinum') return trophy.grade === 'platinum';
  return trophy.kind === kind;
}

export function trophyMatchesQuery(trophy, query) {
  if (!query) return true;
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function filterTrophies(trophies, settings, earnedSet) {
  return trophies.filter((trophy) => {
    if (settings.hideEarned && earnedSet.has(trophy.id)) return false;
    if (settings.grade !== 'all' && trophy.grade !== settings.grade) return false;
    if (!trophyMatchesKind(trophy, settings.kind)) return false;
    if (!trophyMatchesQuery(trophy, settings.query)) return false;
    return true;
  });
}

// Earned/total pairs by grade, in trophy order: { platinum: [got, all], ... }.
export function countByGrade(trophies, earnedSet) {
  const counts = { platinum: [0, 0], gold: [0, 0], silver: [0, 0], bronze: [0, 0] };
  for (const trophy of trophies) {
    const pair = counts[trophy.grade];
    if (!pair) continue;
    pair[1] += 1;
    if (earnedSet.has(trophy.id)) pair[0] += 1;
  }
  return counts;
}

// Earned/total pairs by kind, keyed by the KIND_LABELS keys (minus 'all'
// and 'online', which have no trophies of their own). 'missable' counts
// the trophies flagged missable, whatever their kind.
export function countByKind(trophies, earnedSet) {
  const counts = {};
  for (const kind of Object.keys(KIND_LABELS)) {
    if (kind === 'all' || kind === 'online') continue;
    counts[kind] = [0, 0];
  }
  for (const trophy of trophies) {
    const pair = counts[trophy.kind];
    if (pair) {
      pair[1] += 1;
      if (earnedSet.has(trophy.id)) pair[0] += 1;
    }
    if (trophy.missable === true) {
      counts.missable[1] += 1;
      if (earnedSet.has(trophy.id)) counts.missable[0] += 1;
    }
  }
  return counts;
}

// Earned/total pairs by roadmap stage (1, 2, 3).
export function countByStage(trophies, earnedSet) {
  const counts = { 1: [0, 0], 2: [0, 0], 3: [0, 0] };
  for (const trophy of trophies) {
    const pair = counts[trophy.stage];
    if (!pair) continue;
    pair[1] += 1;
    if (earnedSet.has(trophy.id)) pair[0] += 1;
  }
  return counts;
}

// The next trophy to chase: the earliest unearned trophy in roadmap order,
// with the one missable trophy first inside its stage (it is the only
// trophy that can be lost). The platinum is never suggested — it arrives
// on its own when everything else is done. Returns null when nothing
// non-platinum is left.
export function nextBestTrophy(trophies, earnedSet) {
  const remaining = trophies.filter(
    (trophy) => trophy.grade !== 'platinum' && !earnedSet.has(trophy.id),
  );
  if (remaining.length === 0) return null;
  remaining.sort((a, b) => {
    if (a.stage !== b.stage) return a.stage - b.stage;
    if (a.missable !== b.missable) return a.missable ? -1 : 1;
    return a.id - b.id;
  });
  return remaining[0];
}
