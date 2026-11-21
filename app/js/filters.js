// Filters for Leonida Ledger: which trophies a list view shows, and which of them
// the spoiler setting hides. A trophy is "story" when its kind is story or when it
// is the platinum; hidden trophies are hidden by the spoiler setting until earned.
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

export function isSpoilerHidden(trophy, settings, earnedSet) {
  if (!settings.spoiler) return false;
  if (earnedSet.has(trophy.id)) return false;
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
