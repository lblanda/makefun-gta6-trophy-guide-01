// Roadmap data for Leonida Ledger: the facts at a glance, the three stages
// to the platinum, the five story chapters with what each one unlocks, the
// 100% Completion checklist numbers, and the notes on what only looks
// missable. Everything here comes from the official trophy descriptions and
// the cited guides (PowerPyx, KeenGamer, Push Square) — the roadmap's stage
// names are shared by the roadmap page and the detail pane.
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
  { value: '5', label: 'trophies whose exact method is still unconfirmed' },
  { value: '28', label: 'hidden trophies — hidden on PlayStation until earned' },
  { value: '15', label: 'manual save slots — keep one at the start and end of each chapter' },
];

// The five story chapters in order: which trophies pop in each, which
// missions matter for the platinum, and what each chapter unlocks. The
// chapter titles are descriptive — the game numbers its chapters, it does
// not name them — while the missions and unlocks are the ones PowerPyx
// names in its roadmap.
export const CHAPTERS = [
  {
    number: 1,
    title: 'Chapter 1 — First days in Leonida',
    time: 'About 10 hours',
    text: 'The opening chapter: Gone Fishing, Feng Shui, Down to Earth and Island Dreams. Two questlines start here — Cal’s fishing and Kenton’s treasure diving — and the chapter ends with the first chapter trophy. The one thing that matters for the whole run happens here, in the morning after Down to Earth: the balcony meditation with Lucia at Jason’s house. Do it before leaving the chapter.',
    missions: ['Gone Fishing', 'Feng Shui', 'Down to Earth', 'Island Dreams'],
    unlocks: ['Cal’s fishing questline', 'Kenton’s treasure diving', 'The balcony meditation (missable)'],
    trophyIds: [2, 3],
  },
  {
    number: 2,
    title: 'Chapter 2 — Two protagonists',
    time: 'About 15 hours',
    text: 'Coffee Break unlocks switching between Jason and Lucia, which is what makes the partner trophies, the second-character meditations and the dual workouts possible. Daily Driver unlocks the garage properties and the Vice City Real Estate app, Moses unlocks the Scooter Bros app, and the Thrillbilly Mudclub opens Billy’s questline. Hit Kingpin Bowling is the optional mission for the bowling-alley robbery.',
    missions: ['Coffee Break', 'Breakfast Run', 'Daily Driver', 'Moses', 'Hit Kingpin Bowling'],
    unlocks: ['Character switching', 'Scooter Bros app', 'Garage properties', 'Thrillbilly Mudclub'],
    trophyIds: [4, 8],
  },
  {
    number: 3,
    title: 'Chapter 3 — Vice City opens up',
    time: 'About 20 hours',
    text: 'The chapter that unlocks the money. Credit Check opens bank jobs, payday loans and the Dye Pack Jammer for laundering Marked Bills; Yasmani’s Jewelry Jobs opens jewelry store robberies and the Snap Gun. Andy’s questline (Lucia-only), Randy’s wish list and Tyrone’s Synthetic Labs strand all begin here, and cars with standard trackers can first be registered at Pay ’n’ Spray.',
    missions: ['Welcome to Vice City', 'The Cartel Heist', 'Credit Check', 'Yasmani’s Jewelry Jobs', 'Clonin’ Keys, Makin’ GS', 'Here, Kitty Kitty'],
    unlocks: ['Bank jobs and payday loans', 'Dye Pack Jammer', 'Jewelry robberies and the Snap Gun', 'Randy’s wish list'],
    trophyIds: [5, 9],
  },
  {
    number: 4,
    title: 'Chapter 4 — The big scores',
    time: 'About 20 hours',
    text: 'Three named-mission trophies land in this chapter, and the optional mission That’s Where The Money Is… unlocks bank vault robberies — the best endgame money and the route to Maximum Withdrawal. Vaults pay up to $205,000 each, feed the Marked Bills total, and always trigger a 4-star wanted level, which is also how Hot Together usually pops.',
    missions: ['Ocean Beach', 'Another Life', 'Child’s Play', 'Headliners', 'VCIA Takedown', 'Starting From Zero', 'That’s Where The Money Is…'],
    unlocks: ['Bank vault robberies', 'Yasmani’s security-van tips'],
    trophyIds: [6, 10, 11, 12],
  },
  {
    number: 5,
    title: 'Chapter 5 — The finale',
    time: 'About 10 hours',
    text: 'The last chapter: Operation Savage Glory, then the final mission and the credits. After the credits you return to free-roam, the 100% Completion checklist appears under Progress > Stats, and cheats unlock (do not use them on your platinum save). Everything left from here on is Stage 2 and Stage 3 work.',
    missions: ['Operation Savage Glory', 'The final mission'],
    unlocks: ['Free-roam cleanup', '100% Completion checklist'],
    trophyIds: [7, 13],
  },
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
  'The meditation counter counts both characters at the same spot as +2, and the Chapter 1 balcony meditation adds 1 without being marked as a spot — so the counter can read higher than the number of spots you have visited.',
];
