# makefun-gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lblanda/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lblanda/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide to each in our own words that cites its sources, a three-stage roadmap to the platinum, the one missable trophy flagged, and a checklist whose progress saves in the browser with export and import. It runs entirely from its own files — no network, no ads, no Rockstar artwork.

## Run it

```sh
node serve.mjs
```

Then open http://localhost:8080 in a desktop browser. Or open `app/index.html` from any static file server with `app/` at its root. It works with the network off.

## Features

- **Checklist** — all 55 trophies with their official names, descriptions and grades. Tick one when you earn it; a progress ring and bar in the header track you to the platinum.
- **Guides with sources** — every trophy has a guide in this guide's own words, step-by-step, with a difficulty rating (1–5), a time estimate, and named sources beside it. Five trophies whose exact method is still unconfirmed are flagged as unconfirmed instead of inventing one.
- **Next best trophy** — the checklist suggests what to chase next: the earliest unearned trophy in roadmap order, with the one missable trophy first while it is still open.
- **Roadmap to the platinum** — three stages in order, a chapter-by-chapter breakdown (what each of the five chapters unlocks, which trophies pop in it), per-stage progress, and the full 100% Completion checklist with every required number.
- **Missables** — the one potentially missable trophy (Positive Mental Attitude) in full, the five unconfirmed methods, what only looks missable, and save advice.
- **Stats** — progress by grade, by kind and by roadmap stage, with bars.
- **Filters and spoilers** — search, filter by kind (story, missable, collectibles, activities, robbery, exploration, money) and grade, hide earned, and a spoiler setting that hides the names and descriptions of story and hidden trophies until they are earned.
- **Keyboard** — `j`/`k` or `↑`/`↓` move through the list, `Enter` opens a guide, `e` toggles earned, `/` focuses search, `1`–`5` switch tabs.
- **Offline** — static files only, standard library only, no build step, no network request at run time. System fonts only.

## How progress is stored

Your earned trophies live in this browser only, in localStorage under the key `leonida-ledger-v1`. Nothing is sent anywhere. Export a backup from the footer (a plain JSON file with an `earned` list of trophy ids) to move it to another browser, or import one back. The format is stable across versions of this guide.

## The roadmap at a glance

1. **Stage 1 — Story (60–80 h).** Play all five chapters. Do the Chapter 1 balcony meditation with Lucia before leaving Chapter 1 — it is the one thing that may never come back.
2. **Stage 2 — 100% checklist (~100 h).** After the credits, clear the 100% Completion checklist for A Long Road. Robberies first: they pay for the garages, the shopping and the laundering.
3. **Stage 3 — Cleanup (10–20 h).** Eight Strangers & Freaks strands, the named character questlines, and the leftovers. The platinum pops with the last trophy.

55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), 28 hidden, 0 online. About 200 hours at difficulty 4/10 (PowerPyx), in a single playthrough.

## Verify the hand-in

```sh
mkdir -p /tmp/gta6-guide-v2-out && MAKEFUN_OUTPUT_DIR=/tmp/gta6-guide-v2-out node main.ts
node cli/makefun.mjs check --kit . --repo /path/to/this/repo   # from the unpacked kit directory
```

The two runs of `main.ts` must write the same bytes; the kit check must come back valid.

## Sources

- Official trophy names, descriptions and grades: the PlayStation list as published on [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/), cross-checked with [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi).
- Roadmap, 100% checklist numbers and per-trophy methods: [PowerPyx — GTA 6 Trophy Guide & Roadmap](https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/) and [PowerPyx — 100% Completion Checklist](https://www.powerpyx.com/gta-6-100-completion-checklist-guide/).
- Cross-checks and the missable warning: [KeenGamer — Trophy Guide & Platinum Roadmap](https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/) and [Push Square — GTA 6 Trophy Guide](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap).

Every guide is written for this page in its own words; the sources are where each fact was checked. Difficulty and time are this guide's own estimates.

## What is inside

- `app/` — the guide itself: `index.html`, `style.css`, `js/` (boot, store, filters, roadmap data) and `app/data/trophies.json` with all 55 trophies, each with its official name, description, grade, hidden flag, kind, missable and unconfirmed flags, difficulty and time estimate, guide, steps and sources.
- `screenshots/` — four real renders of the guide in a browser: the checklist with a guide open, the roadmap, the missables page, and the spoiler setting at work.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Screenshots

Four real renders of the guide in headless Chromium at 1280×800:

1. `1-cover.jpg` — the checklist with 13 trophies earned and the guide for Positive Mental Attitude (the one missable trophy) open beside it.
2. `2-roadmap.jpg` — the three-stage roadmap to the platinum, the five chapters and the 100% checklist.
3. `3-missables.jpg` — the missables page: the one missable trophy, the five unconfirmed methods, and what only looks missable.
4. `4-spoiler.jpg` — the checklist with the spoiler setting on: story and hidden trophies stay hidden until earned.

---

<sub>Entered on [make.fun](https://make.fun/?ref=3zwarjv0&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
