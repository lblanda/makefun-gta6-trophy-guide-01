// Roadmap data for Leonida Ledger: the three stages to the platinum, the facts
// at a glance, and the 100% Completion checklist numbers, all from the official
// trophy descriptions and the cited guides (PowerPyx, KeenGamer, Push Square).
// The roadmap's stage names, shared by the roadmap page and the detail pane.
export const STAGE_NAMES = {
  1: 'Stage 1 — Story',
  2: 'Stage 2 — 100% checklist',
  3: 'Stage 3 — Cleanup',
};

export const PLATINUM_FACTS = [
  { value: '55', label: 'trophies: 1 platinum, 2 gold, 6 silver, 46 bronze' },
  { value: '~200 h', label: 'estimated time to platinum (PowerPyx: 4/10 difficulty)' },
  { value: '1', label: 'playthrough — everything fits in one run' },
  { value: '0', label: 'online trophies — all 55 are single-player' },
  { value: '1', label: 'potentially missable trophy (Positive Mental Attitude)' },
  { value: '15', label: 'manual save slots — keep one at the start and end of each chapter' },
];

export const ROADMAP_STAGES = [
  {
    number: 1,
    title: 'Play the story — and do the one missable thing',
    time: '60–80 hours',
    text: 'Play through all five chapters as Jason and Lucia. The 13 story trophies (four chapter endings, the finale and the named missions) pop automatically, and so do the five named character questlines if you finish them as they appear. Two habits pay off for the whole run: scan every new vehicle with the WAiNK app, and study every new animal through the binoculars — the 100% checklist later wants 200 of 277 vehicles and 100 of 255 animals. Do optional missions as they appear (purple icons, and black icons with pink letters); there are far more than the 100 the checklist wants, so missing a few does not matter. The one thing that can go wrong is in this stage: after the Chapter 1 mission Down to Earth, find Lucia at Jason’s house in the morning, follow her to the balcony and accept the meditation. It may be the only meditation that never comes back.',
    trophyKinds: ['story'],
    note: 'Keep a manual save at the start and end of every chapter — there is no mission replay. Cheats disable trophies and saving, and only unlock after the story anyway.',
  },
  {
    number: 2,
    title: 'The 100% Completion checklist',
    time: 'About 100 hours',
    text: 'After the credits, Progress > Stats gains a 100% Completion entry. Everything you did during the story already counts. The checklist is forgiving — closer to 60% true completion — but a few lines demand everything: all 39 Gang Operations, all 22 Bank Jobs, all 7 Payday Loan Jobs, all 8 bank vaults, all 33 underwater discoveries, all 42 Shooting Range gold medals, all 42 Drone Time Trials and all 15 of Bret’s Target Decks. Most other lines are partial: 15 of 18 card sets, 100 of 125 Cocaine Flamingos, 70 of 80 Challenges, 300 of 397 stunts. Work the robberies first — they also pay for the garages, the $100,000 of shopping and the $250,000 of laundered Marked Bills. When this stage is done, A Long Road (gold) pops, and most other trophies have popped along the way.',
    trophyKinds: ['collectibles', 'activities', 'robbery', 'exploration', 'money'],
    note: 'Nothing in the 100% checklist is missable — it can all be done in free-roam after the story.',
  },
  {
    number: 3,
    title: 'Strangers & Freaks and cleanup',
    time: '10–20 hours',
    text: 'The Strangers & Freaks strands are not part of the 100% checklist, so they are usually what is left: finish 8 qualifying stranger strands (Kirk, Kyle, Yago and Pilot Pete are confirmed to count; the named character questlines do not), plus the final missions for Andy, Kenton, Billy, Randy and Tyrone if any are still open. Then sweep the leftovers: the last meditation spots, the cryptic trophies whose methods are still being confirmed (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin), and any combat or driving trophy that did not pop on its own. When the last one pops, Vice Got a Price! follows immediately.',
    trophyKinds: ['story', 'misc'],
    note: 'Check the trophy tracker in the game’s trophy list for exact counts (Strangers & Freaks, Challenges, Criminal Profile) before guessing what is left.',
  },
];

// The 100% Completion checklist as PowerPyx published it: each line's required
// progress, and whether the line must be completed in full.
export const CHECKLIST_100 = [
  { line: 'Story completion', required: 'Finish the story', full: true },
  { line: 'Optional tasks', required: '100 completed', full: false },
  { line: 'Gang Operations cleared', required: '39 of 39', full: true },
  { line: 'Bank Jobs fully completed', required: '22 of 22', full: true },
  { line: 'Payday Loan Jobs fully completed', required: '7 of 7', full: true },
  { line: 'Smash ’N’ Grabs', required: '34 of 35', full: false },
  { line: 'Stick Ups', required: '50 of 91', full: false },
  { line: 'Narcotics fenced', required: '$100,000', full: true },
  { line: 'Jewelry fenced', required: '$100,000', full: true },
  { line: 'Marked Bills fenced', required: '$250,000', full: true },
  { line: 'Bank vaults hit', required: '8 of 8', full: true },
  { line: 'Vehicles fenced', required: '$200,000', full: true },
  { line: 'Kenton’s treasure sets', required: '5 of 7', full: false },
  { line: 'Collectible Card sets', required: '15 of 18', full: false },
  { line: 'WAiNK locations scanned', required: '100', full: true },
  { line: 'Underwater discoveries', required: '33 of 33', full: true },
  { line: 'Magazines, books & comics', required: '30 of 34', full: false },
  { line: 'Meditation spots', required: '15 of 18', full: false },
  { line: 'Cocaine Flamingos destroyed', required: '100 of 125', full: false },
  { line: 'Unique playlists', required: '2 of 2', full: true },
  { line: 'Discovered styles', required: '70 of 79', full: false },
  { line: 'Unique races won', required: '30 of 40', full: false },
  { line: 'Race Challenge gold medals', required: '10 of 13', full: false },
  { line: 'Shooting Range gold medals', required: '42 of 42', full: true },
  { line: 'Video games played', required: '4 of 4', full: true },
  { line: 'Pool opponents defeated', required: '5 of 7', full: false },
  { line: 'Mini golf locations played', required: '2 of 3', full: false },
  { line: 'Basketball hoops scored', required: '90 of 100', full: false },
  { line: 'Drone Time Trials completed', required: '42 of 42', full: true },
  { line: 'Stunts completed', required: '300 of 397', full: false },
  { line: 'Challenges completed', required: '70 of 80', full: false },
  { line: 'Bret’s Target Decks', required: '15 of 15', full: true },
  { line: 'Base-model vehicles scanned', required: '200 of 277', full: false },
  { line: 'Standard-issue weapons found', required: '50 of 66', full: false },
  { line: 'Animals studied', required: '100 of 255', full: false },
];

export const MISSABLE_NOTES = [
  'Many optional missions disappear after a while (black icons with pink letters) — but there are far more than the 100 the checklist wants, so it does not lock you out of the platinum.',
  'Some quest givers, like Kenton, become temporarily unavailable during the story. Every trophy-related character returns later; all of them are still there in free-roam after the story.',
  'Some fences disappear permanently, and a few magazine collectibles sit in story buildings that become inaccessible — neither matters, because new fences unlock and you do not need every magazine.',
  'Quests with an hourglass icon are time-sensitive and can fail, but none of them count toward a trophy.',
  'The Criminal Profile can reach Irredeemable, a permanent status that makes police far more aggressive. It does not block any trophy, but avoid it.',
  'The relationship status of Jason and Lucia does not matter for trophies.',
];
