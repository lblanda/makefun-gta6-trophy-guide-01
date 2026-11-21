// Leonida Ledger boot and rendering: loads app/data/trophies.json, draws the
// checklist, the detail pane, the roadmap, the missables page and the about page,
// and wires the tracker (localStorage, export, import, reset) to the toolbar.
import { loadStore, saveStore, toggleEarned, exportProgress, parseImportFile } from './store.js';
import { filterTrophies, isSpoilerHidden, countByGrade } from './filters.js';
import { PLATINUM_FACTS, ROADMAP_STAGES, CHECKLIST_100, MISSABLE_NOTES, STAGE_NAMES } from './roadmap.js';

const $ = (selector) => document.querySelector(selector);

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

function updateProgress() {
  const earned = earnedSet();
  const total = trophies.length || 55;
  $('#earned-count').textContent = String(earned.size);
  $('#progress-fill').style.width = `${Math.round((earned.size / total) * 100)}%`;
  $('#progress-bar').setAttribute('aria-valuenow', String(earned.size));
  const counts = countByGrade(trophies, earned);
  const parts = Object.entries(counts).map(([grade, [got, all]]) => `${got}/${all} ${grade}`);
  $('#progress-note').textContent = `Platinum: Vice Got a Price! — ${earned.size} of ${total} earned (${parts.join(', ')}).`;
}

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
    const tags = [
      gradeBadge(trophy.grade),
      trophy.missable ? '<span class="tag missable">Missable</span>' : '',
      trophy.hidden ? '<span class="tag hidden-tag">Hidden on PSN</span>' : '',
      `<span class="tag">${escapeHtml(trophy.kind)}</span>`,
      targetTag(trophy),
    ].join('');
    return `<li class="trophy-card${isEarned ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}" data-id="${trophy.id}" tabindex="0" role="button" aria-pressed="${isEarned}">
      <input type="checkbox" class="trophy-check" data-id="${trophy.id}" ${isEarned ? 'checked' : ''} aria-label="Mark ${escapeHtml(name)} as earned">
      <div class="trophy-body">
        <div class="trophy-name${hiddenBySpoiler ? ' spoiler-hidden' : ''}">${escapeHtml(name)}</div>
        <p class="trophy-desc${hiddenBySpoiler ? ' spoiler-hidden' : ''}">${escapeHtml(desc)}</p>
        <div class="trophy-meta">${tags}</div>
      </div>
      <span aria-hidden="true">${isEarned ? '✓' : '›'}</span>
    </li>`;
  }).join('');
}

function renderDetail() {
  const pane = $('#detail-pane');
  const trophy = selectedId === null ? null : trophyById(selectedId);
  if (!trophy) {
    pane.innerHTML = `<p class="detail-empty">Select a trophy on the left to see its guide, steps and sources.</p>
      <p class="detail-empty">Every guide is written for this page, in its own words, and cites where each fact comes from — a named guide or a link, beside the trophy it belongs to.</p>`;
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
  const steps = hiddenBySpoiler ? '' : `<div class="detail-section"><h3>Steps</h3><ol class="steps">${trophy.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol></div>`;
  const sources = hiddenBySpoiler ? '' : `<div class="detail-section"><h3>Sources</h3><ul class="source-list">${trophy.sources.map((s) => `<li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.name)}</a></li>`).join('')}</ul><p class="unknown-note">Guides are this page’s own words; the sources are where each fact was checked. A step with no source behind it is marked as unconfirmed in the guide.</p></div>`;
  const missableCallout = trophy.missable && !hiddenBySpoiler
    ? `<div class="callout"><strong>Potentially missable.</strong> Do the Chapter 1 balcony meditation with Lucia before leaving Chapter 1 — it may never come back. See the Missables tab for the full story.</div>`
    : '';
  const stageNames = STAGE_NAMES;
  pane.innerHTML = `
    <div class="trophy-meta">${gradeBadge(trophy.grade)}<span class="tag">${escapeHtml(trophy.kind)}</span>${trophy.missable ? '<span class="tag missable">Missable</span>' : ''}${trophy.hidden ? '<span class="tag hidden-tag">Hidden on PSN</span>' : ''}<span class="tag">${escapeHtml(stageNames[trophy.stage] || '')}</span></div>
    <h2 class="detail-title">${escapeHtml(title)}</h2>
    <p class="detail-desc">${escapeHtml(desc)}</p>
    ${missableCallout}
    <div class="detail-section"><h3>Guide</h3><p>${escapeHtml(guide)}</p></div>
    ${sources}
    ${steps}
    <div class="detail-actions">
      <button type="button" class="btn ghost" id="detail-prev">← Previous</button>
      <button type="button" class="btn" id="detail-toggle">${isEarned ? 'Mark as not earned' : 'Mark as earned'}</button>
      <button type="button" class="btn ghost" id="detail-next">Next →</button>
    </div>
    <p class="${isEarned ? 'earned-state' : 'not-earned-state'}">${isEarned ? '✓ Earned — saved in this browser.' : 'Not earned yet.'}</p>`;
  $('#detail-toggle').addEventListener('click', () => {
    toggleEarned(store, trophy.id);
    updateProgress();
    renderList();
    renderDetail();
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

function stageTrophyChips(stageNumber) {
  return trophies
    .filter((trophy) => trophy.stage === stageNumber)
    .map((trophy) => `<button type="button" class="tag" data-select="${trophy.id}">${escapeHtml(trophy.name)}</button>`)
    .join('');
}

function renderRoadmap() {
  const facts = PLATINUM_FACTS.map((fact) => `<div class="fact"><b>${escapeHtml(fact.value)}</b><span>${escapeHtml(fact.label)}</span></div>`).join('');
  const stages = ROADMAP_STAGES.map((stage) => `<article class="stage-card">
      <div class="stage-head"><span class="stage-num">Stage ${stage.number}</span><h2>${escapeHtml(stage.title)}</h2><span class="stage-time">${escapeHtml(stage.time)}</span></div>
      <p>${escapeHtml(stage.text)}</p>
      <p class="unknown-note">${escapeHtml(stage.note)}</p>
      <div class="stage-trophies">${stageTrophyChips(stage.number)}</div>
    </article>`).join('');
  const rows = CHECKLIST_100.map((row) => `<tr><td>${escapeHtml(row.line)}</td><td class="num">${escapeHtml(row.required)}</td><td>${row.full ? 'All of it' : 'Partial'}</td></tr>`).join('');
  $('#roadmap-content').innerHTML = `
    <h2>Roadmap to the platinum</h2>
    <p>Three stages, in order. The story first (with the one missable meditation), then the 100% checklist, then the Strangers &amp; Freaks strands and cleanup. Click any trophy chip to jump to its guide in the checklist.</p>
    <div class="facts-grid">${facts}</div>
    ${stages}
    <article class="stage-card"><h2>The 100% Completion checklist (A Long Road)</h2>
    <p>Unlocks under Progress &gt; Stats &gt; 100% Completion after the story. “All of it” lines must be finished in full; “Partial” lines only need the number shown. Source: PowerPyx’s 100% Completion Checklist &amp; Guide.</p>
    <table class="check-table"><thead><tr><th>Line</th><th>Required</th><th>How much</th></tr></thead><tbody>${rows}</tbody></table></article>`;
}

function renderMissables() {
  const missable = trophies.find((trophy) => trophy.missable);
  const notes = MISSABLE_NOTES.map((note) => `<li>${escapeHtml(note)}</li>`).join('');
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
    <article class="info-card"><h2>Things that look missable but are not</h2><ul class="steps">${notes}</ul></article>
    <article class="info-card"><h2>Save advice</h2>
    <p>There is no mission replay and no New Game+, so keep a manual save at the start and end of every chapter — 10 saves for the 5 chapters, rotating the other 5 for free-roam cleanup. That is the safety net for the one missable meditation and for any optional interaction you want to revisit.</p>
    <p>Cheats disable trophies and saving, and only unlock after the story. Do not use them on your platinum save.</p></article>`;
}

function renderAbout() {
  $('#about-content').innerHTML = `
    <article class="info-card"><h2>How to use this guide</h2>
    <p>Tick a trophy when you earn it — progress saves in this browser automatically. Use the search and the kind filters (story, missable, collectibles, activities, robbery, exploration, money) to find what you need, and the spoiler switch to hide story and hidden trophies until you have earned them. Export your progress from the footer to back it up or move it to another browser.</p>
    <p>This guide works fully offline: it loads no file from the network, and every source link opens only if you click it.</p></article>
    <article class="info-card"><h2>Where the facts come from</h2>
    <ul class="steps">
      <li>Official trophy names, descriptions and grades: the PlayStation list as published on <a href="https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/" target="_blank" rel="noopener">Exophase</a>, cross-checked with <a href="https://psnprofiles.com/trophies/43531-grand-theft-auto-vi" target="_blank" rel="noopener">PSNProfiles</a> (28 hidden trophies, per their lists).</li>
      <li>Roadmap, 100% checklist numbers and per-trophy methods: <a href="https://www.powerpyx.com/gta-6-grand-theft-auto-vI-trophy-guide-roadmap/" target="_blank" rel="noopener">PowerPyx — GTA 6 Trophy Guide &amp; Roadmap</a> and <a href="https://www.powerpyx.com/gta-6-100-completion-checklist-guide/" target="_blank" rel="noopener">PowerPyx — 100% Completion Checklist</a>.</li>
      <li>Cross-checks and the missable warning: <a href="https://www.keengamer.com/articles/guides/gta-6-trophy-guide-platinum-roadmap-all-55-trophies/" target="_blank" rel="noopener">KeenGamer — Trophy Guide &amp; Platinum Roadmap</a> and <a href="https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap" target="_blank" rel="noopener">Push Square — GTA 6 Trophy Guide</a>.</li>
    </ul>
    <p>Every trophy’s guide is written for this page in its own words and names its sources beside it. Where a method is still unconfirmed (In The Beginning…, Capital Offense, Bad Luck, I Guess, The Truth Is Out There, Ten Pin), the guide says so instead of inventing a precise location.</p></article>
    <article class="info-card"><h2>About this guide</h2>
    <p>Leonida Ledger is an unofficial fan guide built for the make.fun “Build the best GTA 6 trophy guide” bounty. It shows no Rockstar logo, official artwork, box art or game screenshots, and uses system fonts only. Trophy names and descriptions are reproduced as PlayStation publishes them; everything else is original.</p></article>`;
}

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
}

function applyShotPreset() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  if (!shot) return;
  // Deterministic scenes for screenshots: seeded progress in memory only.
  const demoEarned = [2, 3, 4, 8, 16, 20, 21, 32, 35, 42, 52, 53, 55];
  if (shot === 'cover') {
    store.earned = demoEarned;
    selectedId = 17; // The Shootist: short guide, so its sources fit in the pane
  } else if (shot === 'roadmap') {
    store.earned = demoEarned;
    switchView('roadmap');
  } else if (shot === 'missables') {
    store.earned = demoEarned;
    switchView('missables');
  } else if (shot === 'spoiler') {
    store.earned = [2, 3, 20];
    store.settings.spoiler = true;
    selectedId = 4; // an unearned hidden trophy: shows the spoiler placeholder
    $('#spoiler-toggle').checked = true;
  }
}

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
  for (const chip of document.querySelectorAll('#kind-filters .chip')) {
    chip.classList.toggle('active', chip.dataset.kind === store.settings.kind);
    chip.addEventListener('click', () => {
      store.settings.kind = chip.dataset.kind;
      saveStore(store);
      for (const other of document.querySelectorAll('#kind-filters .chip')) {
        other.classList.toggle('active', other === chip);
      }
      renderList();
    });
  }
  document.querySelectorAll('.tab').forEach((button) => {
    button.addEventListener('click', () => switchView(button.dataset.view));
  });
  $('#trophy-list').addEventListener('click', (event) => {
    const checkbox = event.target.closest('.trophy-check');
    if (checkbox) {
      toggleEarned(store, Number(checkbox.dataset.id));
      updateProgress();
      renderList();
      renderDetail();
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
    for (const other of document.querySelectorAll('#kind-filters .chip')) {
      other.classList.toggle('active', other.dataset.kind === 'all');
    }
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
      for (const chip of document.querySelectorAll('#kind-filters .chip')) {
        chip.classList.toggle('active', chip.dataset.kind === store.settings.kind);
      }
      selectedId = null;
      updateProgress();
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
    store.earned = [];
    selectedId = null;
    saveStore(store);
    updateProgress();
    renderList();
    renderDetail();
    $('#save-status').textContent = 'Progress reset.';
  });
}

async function boot() {
  const response = await fetch('data/trophies.json');
  const data = await response.json();
  trophies = data.trophies;
  wireToolbar();
  wireSaveTools();
  applyShotPreset();
  renderRoadmap();
  renderMissables();
  renderAbout();
  updateProgress();
  renderList();
  renderDetail();
}

boot();
