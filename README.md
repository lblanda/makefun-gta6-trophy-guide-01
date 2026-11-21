# makefun-gta6-trophy-guide-01

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/lblanda/makefun-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/lblanda/makefun-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Ledger — an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI: every official name, description and grade, a guide to each in our own words that cites its sources, a three-stage roadmap to the platinum, the one missable trophy flagged, and a checklist whose progress saves in the browser with export and import. It runs entirely from its own files — no network, no ads, no Rockstar artwork.

## Run it

```sh
node serve.mjs
```

Then open http://localhost:8080 in a desktop browser. Or open `app/index.html` from any static file server with `app/` at its root.

## What is inside

- `app/` — the guide itself: `index.html`, `style.css`, `js/` (boot, store, filters, roadmap data) and `app/data/trophies.json` with all 55 trophies, each with its official name, description, grade, hidden flag, kind, missable flag, guide, steps and sources.
- `screenshots/` — four real renders of the guide in a browser: the checklist with a guide open, the roadmap, the missables page, and the spoiler setting at work.
- `main.ts` — the hand-in program: copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library.
- `vendor/makefun-frontend.ts` — the kit's dossier library, unchanged.

## Screenshots

Four real renders of the guide in headless Chromium at 1280×800:

1. `1-cover.jpg` — the checklist with 13 trophies earned and the guide for Positive Mental Attitude (the one missable trophy) open beside it.
2. `2-roadmap.jpg` — the three-stage roadmap to the platinum and the 100% checklist.
3. `3-missables.jpg` — the missables page: the one missable trophy and what only looks missable.
4. `4-spoiler.jpg` — the checklist with the spoiler setting on: story and hidden trophies stay hidden until earned.

## The platinum at a glance

55 trophies (1 platinum, 2 gold, 6 silver, 46 bronze), 28 hidden, 0 online. About 200 hours at difficulty 4/10 (PowerPyx), in a single playthrough. One potentially missable trophy: **Positive Mental Attitude** — meditate at the balcony with Lucia in Chapter 1, before leaving it. Everything else can be finished in free-roam after the story.

---

<sub>Entered on [make.fun](https://make.fun/?ref=3zwarjv0&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
