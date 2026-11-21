// Leonida Ledger v2 — boot and rendering.
//
// Loads app/data/trophies.json, draws the checklist, the detail pane, the
// roadmap (with its five chapters), the missables page, the stats page and
// the about page, and wires the tracker: localStorage progress, export,
// import, reset, keyboard navigation and the "next best trophy" suggestion.
// The app fetches nothing but its own data file, and runs with the network off.
import { loadStore, saveStore, toggleEarned, markAllEarned, resetStore, exportProgress, parseImportFile } from './store.js';
import { filterTrophies, isSpoilerHidden, countByGrade, countByKind, countByStage, nextBestTrophy, difficultyLabel, KIND_LABELS } from './filters.js';
import { PLATINUM_FACTS, ROADMAP_STAGES, CHECKLIST_100, MISSABLE_NOTES, STAGE_NAMES, CHAPTERS } from './roadmap.js';

const $ = (selector) => document.querySelector(selector);

// The ring in the header: radius 26, so one full turn is 2π·26 ≈ 163.36.
const RING_CIRCUMFERENCE = 2 * Math.PI * 26;

const store = loadStore();
let trophies = [];
let selectedId = null;
let currentView = 'checklist';

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function trophyById(id) {
  return trophies.find((trophy) => trophy.id === id) || null;
}

function earnedSet() {
  return new Set(store.earned);
}

// ---------- Progress header ----------

function updateProgress() {
  const earned = earnedSet();
  const total = trophies.length || 55;
  const percent = total === 0 ? 0 : Math.round((earned.size / total) * 100);
  $('#earned-count').textContent = String(earned.size);
  $('#progress-percent').textContent = `${percent}%`;
  $('#progress-fill').style.width = `${percent}%`;
  $('#progress-ring-fill').style.strokeDasharray = String(RING_CIRCUMFERENCE);
  $('#progress-ring-fill').style.strokeDashoffset = String(RING_CIRCUMFERENCE * (1 - earned.size / total));
  $('#progress-bar').setAttribute('aria-valuenow', String(earned.size));
  const counts = countByGrade(trophies, earned);
  const parts = Object.entries(counts).map(([grade, [got, all]]) => `${got}/${all} ${grade}`);
  $('#progress-note').textContent = earned.size === total
    ? 'Platinum earned — every trophy done. Vice Got a Price!'
    : `Platinum: Vice Got a Price! — ${earned.size} of ${total} earned (${parts.join(', ')}).`;
}

// ---------- Shared bits ----------

function gradeBadge(grade) {
  return `<span class="grade-badge grade-${escapeHtml(grade)}">${escapeHtml(grade)}</span>`;
}

function targetTag(trophy) {
  if (trophy.target === null || trophy.target === undefined) return '';
  const label = typeof trophy.target === 'number' && trophy.target >= 1000
    ? `$${trophy.target.toLocaleString('en-US')}`
    : String(trophy.target);
  return `<span class="tag target">Target: ${escapeHtml(label)}</span>`;
}

function trophyTags(trophy) {
  return [
    gradeBadge(trophy.grade),
    trophy.missable ? '<span class="tag missable">Missable</span>' : '',
    trophy.unconfirmed ? '<span class="tag unconfirmed-tag">Unconfirmed</span>' : '',
    trophy.hidden ? '<span class="tag hidden-tag">Hidden on PSN</span>' : '',
    `<span class="tag">${escapeHtml(trophy.kind)}</span>`,
    targetTag(trophy),
  ].join('');
}

// ---------- Checklist ----------

function renderKindChips() {
  const counts = countByKind(trophies, earnedSet());
  const group = $('#kind-filters');
  group.innerHTML = Object.entries(KIND_LABELS).map(([kind, label]) => {
    const total = kind === 'all' ? trophies.length : kind === 'online' ? 0 : (counts[kind] ? counts[kind][1] : 0);
    const got = kind === 'all' ? earnedSet().size : kind === 'online' ? 0 : (counts[kind] ? counts[kind][0] : 0);
    const countText = kind === 'online' ? '' : ` <span class="chip-count">${got}/${total}</span>`;
    return `<button type="button" class="chip${store.settings.kind === kind ? ' active' : ''}" data-kind="${escapeHtml(kind)}">${escapeHtml(label)}${countText}</button>`;
  }).join('');
  for (const chip of group.querySelectorAll('.chip')) {
    chip.addEventListener('click', () => {
      store.settings.kind = chip.dataset.kind;
      saveStore(store);
      for (const other of group.querySelectorAll('.chip')) {
        other.classList.toggle('active', other === chip);
      }
      renderList();
    });
  }
}

function renderNextUp() {
  const box = $('#next-up');
  const earned = earnedSet();
  const next = nextBestTrophy(trophies, earned);
  if (!next) {
    const platinumDone = earned.has(1);
    box.innerHTML = platinumDone
      ? '<span class="next-done">Platinum earned — all 55 trophies done. Vice Got a Price!</span>'
      : '<span class="next-done">Only the platinum is left — it pops when the last trophy does.</span>';
    return;
  }
  const why = next.missable
    ? 'The one missable trophy — do it before leaving Chapter 1.'
    : `${STAGE_NAMES[next.stage] || ''} · ${next.kind} · ${difficultyLabel(next.difficulty)} · ${escapeHtml(next.time)}`;
  box.innerHTML = `<span class="next-label">Next best trophy</span>
    <button type="button" data-select="${next.id}">${escapeHtml(next.name)}</button>
    <span class="next-why">${why}</span>`;
}

function renderList() {
  const earned = earnedSet();
  const visible = filterTrophies(trophies, store.settings, earned);
  const list = $('#trophy-list');
  const emptyNote = $('#empty-note');
  const onlineNote = $('#online-note');
  onlineNote.hidden = store.settings.kind !== 'online';
  emptyNote.hidden = visible.length > 0 || store.settings.kind === 'online';
  $('#filter-count').textContent = visible.length === trophies.length
    ? `Showing all ${visible.length} trophies.`
    : `Showing ${visible.length} of ${trophies.length} trophies.`;

  list.innerHTML = visible.map((trophy) => {
    const isEarned = earned.has(trophy.id);
    const hiddenBySpoiler = isSpoilerHidden(trophy, store.settings, earned);
    const name = hiddenBySpoiler ? 'Hidden trophy — earn it to reveal its name' : trophy.name;
    const desc = hiddenBySpoiler ? 'Its name and description stay hidden while spoilers are on.' : trophy.description;
    return `<li class="trophy-card${isEarned ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}${trophy.missable ? ' missable-card' : ''}" data-id="${trophy.id}" tabindex="0" role="button" aria-pressed="${isEarned}">
      <input type="checkbox" class="trophy-check" data-id="${trophy.id}" ${isEarned ? 'checked' : ''} aria-label="Mark ${escapeHtml(name)} as earned">
      <div class="trophy-body">
        <div class="trophy-name${hiddenBySpoiler ? ' spoiler-hidden' : ''}">${escapeHtml(name)}</div>
        <p class="trophy-desc${hiddenBySpoiler ? ' spoiler-hidden' : ''}">${escapeHtml(desc)}</p>
        <div class="trophy-meta">${trophyTags(trophy)}</div>
      </div>
      <span class="card-arrow" aria-hidden="true">${isEarned ? '✓' : '›'}</span>
    </li>`;
  }).join('');
}

// ---------- Detail pane ----------

function renderDetail() {
  const pane = $('#detail-pane');
  const trophy = selectedId === null ? null : trophyById(selectedId);
  if (!trophy) {
    pane.innerHTML = `<p class="detail-empty">Select a trophy on the left to see its guide, steps and sources.</p>
      <p class="detail-empty">Every guide is written for this page, in its own words, and cites where each fact comes from — a named guide or a link, beside the trophy it belongs to. Each one also carries a difficulty rating and a time estimate.</p>
      <p class="detail-empty">Keyboard: j / k moves through the list, Enter opens a guide, e toggles earned, / focuses search.</p>`;
    return;
  }
  const earned = earnedSet();
  const isEarned = earned.has(trophy.id);
  const hiddenBySpoiler = isSpoilerHidden(trophy, store.settings, earned);
  const title = hiddenBySpoiler ? 'Hidden trophy' : trophy.name;
  const desc = hiddenBySpoiler ? 'This trophy is hidden on PlayStation until earned. Turn spoilers off, or earn it, to see its name and description.' : trophy.description;
  const guide = hiddenBySpoiler
    ? 'Spoilers are on, so the guide is hidden too. Earn this trophy in the game — or turn spoilers off — to read how to get it.'
    : trophy.guide;
  const facts = hiddenBySpoiler ? '' : `<div class="detail-facts">
      <span>Difficulty <b>${escapeHtml(difficultyLabel(trophy.difficulty))}</b></span>
      <span>Time <b>${escapeHtml(trophy.time || '—')}</b></span>
      <span>Stage <b>${escapeHtml(STAGE_NAMES[trophy.stage] || '')}</b></span>
    </div>`;
  const unconfirmedCallout = trophy.unconfirmed && !hiddenBySpoiler
    ? `<div class="callout"><strong>Method unconfirmed.</strong> No cited guide has confirmed the exact trigger yet — the steps below are the best lead from the description, not a verified method. Check the sources as players pin it down.</div>`
    : '';
  const missableCallout = trophy.missable && !hiddenBySpoiler
    ? `<div class="callout"><strong>Potentially missable.</strong> Do the Chapter 1 balcony meditation with Lucia before leaving Chapter 1 — it may never come back. See the Missables tab for the full story.</div>`
    : '';
  const steps = hiddenBySpoiler ? '' : `<div class="detail-section"><h3>Steps</h3><ol class="steps">${trophy.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></div>`;
  const sources = hiddenBySpoiler ? '' : `<div class="detail-section"><h3>Sources</h3><ul class="source-list">${trophy.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a></li>`).join('')}</ul><p class="unknown-note">Guides are this page’s own words; the sources are where each fact was checked. A step with no source behind it is marked as unconfirmed in the guide.</p></div>`;
  pane.innerHTML = `
    <div class="trophy-meta">${trophyTags(trophy)}<span class="tag">${escapeHtml(STAGE_NAMES[trophy.stage] || '')}</span></div>
    <h2 class="detail-title">${escapeHtml(title)}</h2>
    <p class="detail-desc">${escapeHtml(desc)}</p>
    ${facts}
    ${missableCallout}
    ${unconfirmedCallout}
    ${sources}
    <div class="detail-section"><h3>Guide</h3><p>${escapeHtml(guide)}</p></div>
    ${steps}
    <div class="detail-actions">
      <button type="button" class="btn ghost" id="detail-prev">← Previous</button>
      <button type="button" class="btn" id="detail-toggle">${isEarned ? 'Mark as not earned' : 'Mark as earned'}</button>
      <button type="button" class="btn ghost" id="detail-next">Next →</button>
    </div>
    <p class="${isEarned ? 'earned-state' : 'not-earned-state'}">${isEarned ? '✓ Earned — saved in this browser.' : 'Not earned yet.'}</p>`;
  $('#detail-toggle').addEventListener('click', () => {
    toggleEarned(store, trophy.id);
    refreshAfterToggle();
  });
  const moveSelection = (step) => {
    const index = trophies.findIndex((item) => item.id === trophy.id);
    const next = trophies[(index + step + trophies.length) % trophies.length];
    selectedId = next.id;
    renderList();
    renderDetail();
  };
  $('#detail-prev').addEventListener('click', () => moveSelection(-1));
  $('#detail-next').addEventListener('click', () => moveSelection(1));
}

// Re-render everything a progress change touches, and the active view's
// page when it is not the checklist (so its chips and bars stay true).
function refreshAfterToggle() {
  updateProgress();
  renderKindChips();
  renderNextUp();
  renderList();
  renderDetail();
  if (currentView === 'roadmap') renderRoadmap();
  if (currentView === 'stats') renderStats();
  if (currentView === 'missables') renderMissables();
}

// ---------- Roadmap ----------

function chapterTrophyChips(chapter) {
  const earned = earnedSet();
  return chapter.trophyIds.map((id) => {
    const trophy = trophyById(id);
    if (!trophy) return '';
    return `<button type="button" class="tag${earned.has(id) ? ' earned-chip' : ''}" data-select="${id}">${escapeHtml(trophy.name)}</button>`;
  }).join('');
}

function stageTrophyChips(stageNumber) {
  const earned = earnedSet();
  return trophies
    .filter((trophy) => trophy.stage === stageNumber)
    .map((trophy) => `<button type="button" class="tag${earned.has(trophy.id) ? ' earned-chip' : ''}" data-select="${trophy.id}">${escapeHtml(trophy.name)}</button>`)
    .join('');
}

function renderRoadmap() {
  const earned = earnedSet();
  const stageCounts = countByStage(trophies, earned);
  const facts = PLATINUM_FACTS.map((fact) => `<div class="fact"><b>${escapeHtml(fact.value)}</b><span>${escapeHtml(fact.label)}</span></div>`).join('');
  const chapters = CHAPTERS.map((chapter) => {
    const got = chapter.trophyIds.filter((id) => earned.has(id)).length;
    return `<article class="chapter-card">
      <h3>Chapter ${chapter.number} — ${escapeHtml(chapter.title.replace(/^Chapter \d+ — /, ''))}</h3>
      <p class="chapter-time">${escapeHtml(chapter.time)} · ${got}/${chapter.trophyIds.length} chapter trophies earned</p>
      <p>${escapeHtml(chapter.text)}</p>
      <ul class="chapter-lists">
        <li><b>Missions:</b> ${escapeHtml(chapter.missions.join(', '))}</li>
        <li><b>Unlocks:</b> ${escapeHtml(chapter.unlocks.join(', '))}</li>
      </ul>
      <div class="stage-trophies">${chapterTrophyChips(chapter)}</div>
    </article>`;
  }).join('');
  const stages = ROADMAP_STAGES.map((stage) => {
    const [got, all] = stageCounts[stage.number] || [0, 0];
    return `<article class="stage-card">
      <div class="stage-head"><span class="stage-num">Stage ${stage.number}</span><h2>${escapeHtml(stage.title)}</h2><span class="stage-time">${escapeHtml(stage.time)}</span><span class="stage-progress">${got}/${all} earned</span></div>
      <p>${escapeHtml(stage.text)}</p>
      <p class="unknown-note">${escapeHtml(stage.note)}</p>
      <div class="stage-trophies">${stageTrophyChips(stage.number)}</div>
    </article>`;
  }).join('');
  const rows = CHECKLIST_100.map((row) => `<tr><td>${escapeHtml(row.line)}</td><td class="num">${escapeHtml(row.required)}</td><td>${row.full ? 'All of it' : 'Partial'}</td></tr>`).join('');
  $('#roadmap-content').innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p>Three stages, in order. The story first (with the one missable meditation), then the 100% checklist, then the Strangers &amp; Freaks strands and cleanup. Click any trophy chip to jump to its guide in the checklist.</p>
    <div class="facts-grid">${facts}</div>
    <h2>The five chapters</h2>
    <p>What each chapter unlocks, and which trophies pop in it. The chapter titles are descriptive — the game numbers its chapters, it does not name them.</p>
    <div class="chapter-grid">${chapters}</div>
    ${stages}
    <article class="stage-card"><h2>The 100% Completion checklist (A Long Road)</h2>
    <p>Unlocks under Progress &gt; Stats &gt; 100% Completion after the story. “All of it” lines must be finished in full; “Partial” lines only need the number shown. Source: PowerPyx’s 100% Completion Checklist &amp; Guide.</p>
    <table class="check-table"><thead><tr><th>Line</th><th>Required</th><th>How much</th></tr></thead><tbody>${rows}</tbody></table></article>`;
}

// ---------- Missables ----------

function renderMissables() {
  const missable = trophies.find((trophy) => trophy.missable);
  const unconfirmed = trophies.filter((trophy) => trophy.unconfirmed);
  const notes = MISSABLE_NOTES.map((note) => `<li>${escapeHtml(note)}</li>`).join('');
  const unconfirmedRows = unconfirmed.map((trophy) => `<tr><td><button type="button" class="tag" data-select="${trophy.id}">${escapeHtml(trophy.name)}</button></td><td>${escapeHtml(trophy.description)}</td><td>Method still unconfirmed — see its guide</td></tr>`).join('');
  $('#missables-content').innerHTML = `
    <h2>Missable trophies</h2>
    <p>Of the 55 trophies, only one is potentially missable. Everything else can be done in free-roam after the story.</p>
    ${missable ? `<article class="stage-card missable-big">
      <div class="stage-head"><span class="stage-num">1</span><h2>${escapeHtml(missable.name)}</h2>${gradeBadge(missable.grade)}</div>
      <p class="detail-desc">${escapeHtml(missable.description)}</p>
      <p>${escapeHtml(missable.guide)}</p>
      <ol class="steps">${missable.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      <p class="unknown-note">Sources: PowerPyx’s trophy guide and KeenGamer’s roadmap. PowerPyx notes it is still unconfirmed whether the Chapter 1 meditation is required for the trophy — do it anyway, before leaving Chapter 1.</p>
    </article>` : ''}
    <article class="info-card"><h2>Methods still unconfirmed</h2>
    <p>Five trophies have no confirmed method yet in any cited guide. Their guides give the best lead from the official description and say so plainly, instead of inventing a precise location.</p>
    <table class="check-table"><thead><tr><th>Trophy</th><th>Official description</th><th>Status</th></tr></thead><tbody>${unconfirmedRows}</tbody></table></article>
    <article class="info-card"><h2>Things that look missable but are not</h2><ul class="steps">${notes}</ul></article>
    <article class="info-card"><h2>Save advice</h2>
    <p>There is no mission replay and no New Game+, so keep a manual save at the start and end of every chapter — 10 saves for the 5 chapters, rotating the other 5 for free-roam cleanup. That is the safety net for the one missable meditation and for any optional interaction you want to revisit.</p>
    <p>Cheats disable trophies and saving, and only unlock after the story. Do not use them on your platinum save.</p></article>`;
}

// ---------- Stats ----------

function statRows(title, entries) {
  const rows = entries.map(([label, got, all]) => {
    const percent = all === 0 ? 0 : Math.round((got / all) * 100);
    return `<div class="stat-row"><span class="stat-label">${escapeHtml(label)}</span><span class="stat-count">${got}/${all}</span><span class="stat-bar"><span class="stat-fill" style="width:${percent}%"></span></span></div>`;
  }).join('');
  return `<article class="info-card"><h2>${escapeHtml(title)}</h2><div class="stat-rows">${rows}</div></article>`;
}

function renderStats() {
  const earned = earnedSet();
  const total = trophies.length || 55;
  const percent = Math.round((earned.size / total) * 100);
  const byGrade = countByGrade(trophies, earned);
  const byKind = countByKind(trophies, earned);
  const byStage = countByStage(trophies, earned);
  const next = nextBestTrophy(trophies, earned);
  const gradeEntries = Object.entries(byGrade).map(([grade, [got, all]]) => [grade[0].toUpperCase() + grade.slice(1), got, all]);
  const kindEntries = Object.entries(KIND_LABELS)
    .filter(([kind]) => kind !== 'all' && kind !== 'online')
    .map(([kind, label]) => [label, ...(byKind[kind] || [0, 0])]);
  const stageEntries = Object.entries(byStage).map(([stage, [got, all]]) => [STAGE_NAMES[stage] || `Stage ${stage}`, got, all]);
  $('#stats-content').innerHTML = `
    <h2>Your progress</h2>
    <p>${earned.size} of ${total} trophies earned (${percent}%). ${total - earned.size} to go.${next ? ` Next best: <button type="button" class="tag" data-select="${next.id}">${escapeHtml(next.name)}</button>.` : ' The platinum is yours.'}</p>
    ${statRows('By grade', gradeEntries)}
    ${statRows('By kind', kindEntries)}
    ${statRows('By roadmap stage', stageEntries)}
    <article class="info-card"><h2>How progress is stored</h2>
    <p>Your earned trophies live in this browser only, in localStorage under the key <code>leonida-ledger-v1</code>. Nothing is sent anywhere. Export a backup from the footer to move it to another browser, or import one back — the file is plain JSON with an <code>earned</code> list of trophy ids.</p></article>`;
}

// ---------- About ----------

function renderAbout() {
  $('#about-content').innerHTML = `
    <article class="info-card"><h2>How to use this guide</h2>
    <p>Tick a trophy when you earn it — progress saves in this browser automatically. Use the search and the kind filters (story, missable, collectibles, activities, robbery, exploration, money) to find what you need, and the spoiler switch to hide story and hidden trophies until you have earned them. Export your progress from the footer to back it up or move it to another browser. Keyboard: j / k moves, Enter opens a guide, e toggles earned, / focuses search, 1–5 switch tabs.</p>
    <p>This guide works fully offline: it loads no file from the network, and every source link opens only if you click it.</p></article>
    <article class="info-card"><h2>Where the facts come from</h2>
    <ul class="steps">
      <li>Official trophy names, descriptions and grades: the PlayStation list as published on <a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/" target="_blank" rel="noopener">Exophase</a>, cross-checked with <a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi" target="_blank" rel="noopener">PSNProfiles</a> (28 hidden trophies, per their lists).</li>
      <li>Roadmap, 100% checklist numbers and per-trophy methods: <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/" target="_blank" rel="noopener">PowerPyx — GTA 6 Trophy Guide &amp; Roadmap</a> and <a href="https://www.powerpyx.com/gta-6-100-completion-checklist-guide/" target="_blank" rel="noopener">PowerPyx — 100% Completion Checklist</a>.</li>
      <li>Cross-checks and the missable warning: <a href="https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/" target="_blank" rel="noopener">KeenGamer — Trophy Guide &amp; Platinum Roadmap</a> and <a href="https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap" target="_blank" rel="noopener">Push Square — GTA 6 Trophy Guide</a>.</li>
    </ul>
    <p>Every trophy’s guide is written for this page in its own words and names its sources beside it. Difficulty (1–5) and time are this guide’s own estimates, labelled as estimates. Where a method is still unconfirmed (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin), the guide says so instead of inventing a precise location.</p></article>
    <article class="info-card"><h2>About this guide</h2>
    <p>Leonida Ledger is an unofficial fan guide built for the make.fun “Build the best GTA 6 trophy guide” bounty. It shows no Rockstar logo, official artwork, box art or game screenshots, and uses system fonts only. Trophy names and descriptions are reproduced as PlayStation publishes them; everything else is original.</p></article>`;
}

// ---------- Views ----------

function switchView(view) {
  currentView = view;
  for (const button of document.querySelectorAll('.tab')) {
    button.classList.toggle('active', button.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    const isActive = section.id === `view-${view}`;
    section.classList.toggle('active', isActive);
    section.hidden = !isActive;
  }
  if (view === 'roadmap') renderRoadmap();
  if (view === 'missables') renderMissables();
  if (view === 'stats') renderStats();
  if (view === 'about') renderAbout();
}

// ---------- Screenshot presets ----------
// Deterministic scenes for screenshots: seeded progress in memory only,
// never saved, so a reader's own progress is untouched.
function applyShotPreset() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  const demoEarned = [2, 3, 4, 8, 16, 20, 21, 32, 35, 42, 52, 53, 55];
  if (shot === 'cover') {
    store.earned = demoEarned;
    selectedId = 17; // The Shootist: a mid-length guide, so its sources fit in the pane
  } else if (shot === 'roadmap') {
    store.earned = demoEarned;
    switchView('roadmap');
  } else if (shot === 'missables') {
    store.earned = demoEarned;
    switchView('missables');
  } else if (shot === 'stats') {
    store.earned = demoEarned;
    switchView('stats');
  } else if (shot === 'spoiler') {
    store.earned = [2, 3, 20];
    store.settings.spoiler = true;
    selectedId = 4; // an unearned hidden trophy: shows the spoiler placeholder
    $('#spoiler-toggle').checked = true;
  }
}

// ---------- Wiring ----------

function wireToolbar() {
  $('#search').value = store.settings.query;
  $('#search').addEventListener('input', (event) => {
    store.settings.query = event.target.value;
    saveStore(store);
    renderList();
  });
  $('#grade-filter').value = store.settings.grade;
  $('#grade-filter').addEventListener('change', (event) => {
    store.settings.grade = event.target.value;
    saveStore(store);
    renderList();
  });
  $('#hide-earned').checked = store.settings.hideEarned;
  $('#hide-earned').addEventListener('change', (event) => {
    store.settings.hideEarned = event.target.checked;
    saveStore(store);
    renderList();
  });
  $('#spoiler-toggle').checked = store.settings.spoiler;
  $('#spoiler-toggle').addEventListener('change', (event) => {
    store.settings.spoiler = event.target.checked;
    saveStore(store);
    renderList();
    renderDetail();
  });
  renderKindChips();
  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
  $('#trophy-list').addEventListener('click', (event) => {
    const checkbox = event.target.closest('.trophy-check');
    if (checkbox) {
      toggleEarned(store, Number(checkbox.dataset.id));
      refreshAfterToggle();
      return;
    }
    const card = event.target.closest('.trophy-card');
    if (card) {
      selectedId = Number(card.dataset.id);
      renderList();
      renderDetail();
    }
  });
  $('#trophy-list').addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const card = event.target.closest('.trophy-card');
    if (!card) return;
    event.preventDefault();
    selectedId = Number(card.dataset.id);
    renderList();
    renderDetail();
  });
  document.addEventListener('click', (event) => {
    const chip = event.target.closest('[data-select]');
    if (!chip) return;
    selectedId = Number(chip.dataset.select);
    switchView('checklist');
    store.settings.kind = 'all';
    store.settings.query = '';
    $('#search').value = '';
    renderKindChips();
    saveStore(store);
    renderList();
    renderDetail();
    $('#detail-pane').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
}

function wireSaveTools() {
  $('#export-btn').addEventListener('click', () => {
    exportProgress(store);
    $('#save-status').textContent = `Exported ${store.earned.length} earned trophies to gta6-trophy-progress.json.`;
  });
  $('#import-file').addEventListener('change', async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    try {
      const imported = parseImportFile(await file.text());
      store.earned = imported.earned;
      store.settings = imported.settings;
      saveStore(store);
      $('#search').value = store.settings.query;
      $('#grade-filter').value = store.settings.grade;
      $('#hide-earned').checked = store.settings.hideEarned;
      $('#spoiler-toggle').checked = store.settings.spoiler;
      renderKindChips();
      selectedId = null;
      updateProgress();
      renderNextUp();
      renderList();
      renderDetail();
      $('#save-status').textContent = `Imported ${imported.earned.length} earned trophies from ${file.name}.`;
    } catch (error) {
      $('#save-status').textContent = `Import failed: ${error.message}`;
    }
    event.target.value = '';
  });
  $('#reset-btn').addEventListener('click', () => {
    if (!window.confirm('Reset all progress? This clears every earned trophy in this browser.')) return;
    resetStore(store);
    selectedId = null;
    updateProgress();
    renderNextUp();
    renderList();
    renderDetail();
    $('#save-status').textContent = 'Progress reset.';
  });
  $('#mark-visible-btn').addEventListener('click', () => {
    const visible = filterTrophies(trophies, store.settings, earnedSet());
    const remaining = visible.filter((trophy) => !earnedSet().has(trophy.id));
    if (remaining.length === 0) {
      $('#save-status').textContent = 'Everything shown is already earned.';
      return;
    }
    markAllEarned(store, remaining.map((trophy) => trophy.id), true);
    refreshAfterToggle();
    $('#save-status').textContent = `Marked ${remaining.length} shown trophies as earned.`;
  });
}

// Keyboard navigation: j/k or arrows move the selection through the
// visible list, Enter opens the selected trophy's guide, e toggles it
// earned, / focuses search, 1–5 switch tabs. Typing in a field is left
// alone — only Escape blurs out of it.
function wireKeyboard() {
  const views = ['checklist', 'roadmap', 'missables', 'stats', 'about'];
  document.addEventListener('keydown', (event) => {
    const target = event.target;
    const typing = target && (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA');
    if (typing) {
      if (event.key === 'Escape') target.blur();
      return;
    }
    if (event.key === '/') {
      event.preventDefault();
      $('#search').focus();
      return;
    }
    if (event.key >= '1' && event.key <= '5') {
      switchView(views[Number(event.key) - 1]);
      return;
    }
    if (currentView !== 'checklist') return;
    if (event.key === 'j' || event.key === 'ArrowDown' || event.key === 'k' || event.key === 'ArrowUp') {
      event.preventDefault();
      const visible = filterTrophies(trophies, store.settings, earnedSet());
      if (visible.length === 0) return;
      const step = event.key === 'j' || event.key === 'ArrowDown' ? 1 : -1;
      const currentIndex = visible.findIndex((trophy) => trophy.id === selectedId);
      const nextIndex = currentIndex === -1 ? 0 : (currentIndex + step + visible.length) % visible.length;
      selectedId = visible[nextIndex].id;
      renderList();
      renderDetail();
      const card = document.querySelector(`.trophy-card[data-id="${selectedId}"]`);
      if (card) card.scrollIntoView({ block: 'nearest' });
      return;
    }
    if (event.key === 'Enter' && selectedId !== null) {
      renderDetail();
      $('#detail-pane').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      return;
    }
    if (event.key === 'e' && selectedId !== null) {
      toggleEarned(store, selectedId);
      refreshAfterToggle();
    }
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;
  wireToolbar();
  wireSaveTools();
  wireKeyboard();
  applyShotPreset();
  // The preset changes the earned set in memory after the toolbar was
  // wired, so the kind chips (which carry earned/total counts) are drawn
  // again here with the preset's progress. In normal use the store is
  // already loaded by then, so this is a no-op redraw.
  renderKindChips();
  renderRoadmap();
  renderMissables();
  renderStats();
  renderAbout();
  updateProgress();
  renderNextUp();
  renderList();
  renderDetail();
}

boot();
