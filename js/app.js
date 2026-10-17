/* Easy Recipes — a free, no-account recipe PWA.
   Recipes & photos: TheMealDB (https://www.themealdb.com), test key "1" for personal/educational use.
   Everything you save stays on this device (localStorage). No tracking, no permissions. */
'use strict';

const API = 'https://www.themealdb.com/api/json/v1/1/';
const ING_IMG = 'https://www.themealdb.com/images/ingredients/';
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
let view = $('#view');

/* ---------- UI text (all in one place, so translating later is easy) ---------- */
const T = {
  searchPh: 'Search recipes…', byName: 'By name', byIng: 'By ingredient', go: 'Go',
  surprise: 'Surprise me', another: 'Another one', categories: 'Categories', cuisines: 'Cuisines',
  results: 'Results', noResults: "No recipes found. Try another word!",
  offline: "Can't reach the recipe kitchen right now. Check your connection — your saved recipes still work offline.",
  back: 'Back', save: 'Save', saved: 'Saved', ingredients: 'Ingredients', steps: 'Steps',
  batch: 'Batch size', batchHint: 'All doses update everywhere, steps included.',
  startCooking: 'Start cooking', original: 'Original recipe', video: 'Video',
  stepDone: 'Mark step as done', stepUndo: 'Undo',
  note: 'My notes', notePh: 'E.g. less salt next time, 5 extra minutes in my oven…',
  cookbook: 'My cookbook', emptyBook: 'Nothing saved yet. Tap the heart on a recipe to keep it here — it will work offline too.',
  backup: 'Backup', exportBtn: 'Export cookbook', importBtn: 'Import cookbook',
  backupHint: "Your cookbook lives on this phone. If you uninstall the app or clear the browser data it's gone — so export a backup file now and then, and import it to restore.",
  lastBackup: 'Last backup', never: 'never',
  step: 'Step', of: 'of', prev: 'Back', next: 'Next', finish: 'Finished!',
  doneTitle: 'Enjoy your meal!', doneText: 'You did it — every step, every dose. Time to eat!',
  doneSave: 'Save to my cookbook', doneSaved: 'Already in your cookbook', doneBack: 'Back to the recipe', doneMore: 'Find something new',
  welcomeTitle: 'Hi, chef!', welcomeGo: 'Show me a first recipe', welcomeSkip: 'Just let me explore',
  welcomePoints: [['🥄', 'Doses inside every step — no more back-and-forth'], ['⏱', 'Timers ready right where you need them'],
    ['💛', 'Save your favourites: no account, it all stays on your phone']],
  awake: 'Screen stays on while you cook',
  timerDone: 'Done!', stop: 'Stop', alreadyRunning: 'That timer is already running',
  imported: n => `Imported ${n} recipe${n === 1 ? '' : 's'}`, exported: 'Backup saved to your downloads',
  badFile: "That file doesn't look like an Easy Recipes backup", removed: 'Removed from your cookbook', addedBook: 'Saved to your cookbook',
  credits: 'Recipes & photos from', creditsTail: '— a free community database. Thank you!',
  photoBy: 'Photo: TheMealDB community',
};

/* ---------- Small helpers ---------- */
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const load = (k, d) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const store = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage full or blocked */ } };
let toastT;
function toast(msg) {
  const el = $('#toast'); el.textContent = msg; el.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove('show'), 2400);
}
const ICON = {
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  heartFull: '<svg viewBox="0 0 24 24" fill="#E98976" stroke="#A63D2B" stroke-width="2" stroke-linejoin="round"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></svg>',
  chef: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 14a4 4 0 0 1-.8-7.9A4.5 4.5 0 0 1 12 3a4.5 4.5 0 0 1 5.8 3.1A4 4 0 0 1 17 14v6H7z"/><path d="M7 17h10"/></svg>',
  dice: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1.5"/><rect x="14" y="5" width="4" height="14" rx="1.5"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13a1 1 0 0 0 1.5.9l10-6.5a1 1 0 0 0 0-1.7l-10-6.5A1 1 0 0 0 8 5.5z"/></svg>',
  plus1: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 12h6M7 9v6"/><path d="M15 8l2-1.5V17"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  down: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11m-5-5 5 5 5-5M5 20h14"/></svg>',
  up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V4M7 9l5-5 5 5M5 20h14"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></svg>',
  video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"><rect x="3" y="6" width="13" height="12" rx="3"/><path d="M16 11l5-3v8l-5-3z"/></svg>',
};
const loadingHTML = '<div class="loading" aria-label="Loading"><span></span><span></span><span></span></div>';
const CHICK = { hello: 'icons/chick-hello.webp', happy: 'icons/chick-happy.webp', cheer: 'icons/chick-cheer.webp', spoon: 'icons/chick-spoon.webp' };
const emptyHTML = msg => `<div class="empty"><img src="${CHICK.spoon}" alt="" width="130" height="177"><p>${esc(msg)}</p></div>`;
const creditsHTML = () => `<footer class="credits">${T.credits} <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer">TheMealDB</a> ${T.creditsTail}</footer>`;

/* ---------- API (with an in-memory cache) ---------- */
const memo = new Map();
async function api(path) {
  if (memo.has(path)) return memo.get(path);
  const res = await fetch(API + path);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
  memo.set(path, data);
  return data;
}

/* ---------- Saved cookbook ---------- */
let saved = load('er.saved', {});
const isSaved = id => !!saved[id];
function persistSaved() { store('er.saved', saved); }
function toggleSave(meal) {
  if (saved[meal.idMeal]) { delete saved[meal.idMeal]; toast(T.removed); }
  else {
    saved[meal.idMeal] = { meal, savedAt: Date.now(), note: '' };
    toast(T.addedBook);
    // warm the offline cache for the photo
    if (meal.strMealThumb) fetch(meal.strMealThumb, { mode: 'no-cors' }).catch(() => {});
  }
  persistSaved();
}

/* ============================================================
   RECIPE TEXT MAGIC: steps, doses inside steps, inline timers
   ============================================================ */

function getIngredients(meal) {
  const out = [];
  for (let i = 1; i <= 20; i++) {
    const name = (meal['strIngredient' + i] || '').trim();
    const measure = (meal['strMeasure' + i] || '').trim();
    if (name) out.push({ name, measure });
  }
  return out;
}

/* Split TheMealDB's instruction blob into clean, short steps. */
function splitSteps(raw) {
  const text = String(raw || '').replace(/\r/g, '').trim();
  let lines = text.split(/\n+/).map(s => s.trim()).filter(Boolean);
  lines = lines.filter(l => !/^(step\s*\d+\s*[:.)-]?|\d+\s*[.)]?|▢)$/i.test(l));
  lines = lines.map(l => l.replace(/^(step\s*\d+\s*[:.)-]?\s*|\d{1,2}\s*[.)]\s+|[-•*▢]\s*)/i, '').trim()).filter(Boolean);
  // short headings like "For the sauce:" get glued to the next line
  const merged = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].length < 40 && /:$/.test(lines[i]) && lines[i + 1]) { merged.push(lines[i] + ' ' + lines[i + 1]); i++; }
    else merged.push(lines[i]);
  }
  // very long paragraphs get split into bite-size chunks of sentences
  const steps = [];
  for (const p of merged) {
    if (p.length <= 380) { steps.push(p); continue; }
    const sentences = p.split(/(?<=[.!?])\s+(?=[A-Z(])/);
    let cur = '';
    for (const s of sentences) {
      if (cur && (cur + ' ' + s).length > 300) { steps.push(cur); cur = s; }
      else cur = cur ? cur + ' ' + s : s;
    }
    if (cur) steps.push(cur);
  }
  return steps;
}

/* --- Durations → timers --- */
const WORDNUM = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, fifteen: 15, twenty: 20, 'twenty-five': 25, thirty: 30, forty: 40, 'forty-five': 45, fifty: 50, sixty: 60, ninety: 90 };
const FRAC = { '½': .5, '¼': .25, '¾': .75, '⅓': 1 / 3, '⅔': 2 / 3 };
const NUM = '(?:\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?\\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔]|' + Object.keys(WORDNUM).sort((a, b) => b.length - a.length).join('|') + ')';
const UNIT = '(seconds?|secs?|minutes?|mins?|hours?|hrs?)';
const DUR_RE = new RegExp(
  '(?<![\\w-])(?:half\\s+an\\s+hour|an\\s+hour\\s+and\\s+a\\s+half|' +
  '(' + NUM + ')(?:\\s*(?:-|–|to|or)\\s*(' + NUM + '))?\\s*-?\\s*' + UNIT +
  '(?:\\s*(?:and\\s+)?(' + NUM + ')\\s*-?\\s*' + UNIT + ')?)(?![\\w])', 'gi');

function parseNum(s) {
  s = String(s).trim().toLowerCase();
  if (s in WORDNUM) return WORDNUM[s];
  let m;
  if ((m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/))) return +m[1] + m[2] / m[3];
  if ((m = s.match(/^(\d+)\/(\d+)$/))) return m[1] / m[2];
  if ((m = s.match(/^(\d+(?:[.,]\d+)?)?\s*([½¼¾⅓⅔])?$/))) return (m[1] ? parseFloat(m[1].replace(',', '.')) : 0) + (m[2] ? FRAC[m[2]] : 0);
  return NaN;
}
const unitSec = u => /^s/i.test(u) ? 1 : /^m/i.test(u) ? 60 : 3600;

function findDurations(text) {
  const out = [];
  DUR_RE.lastIndex = 0;
  let m;
  while ((m = DUR_RE.exec(text))) {
    let sec;
    const whole = m[0].toLowerCase();
    if (whole.startsWith('half an hour')) sec = 1800;
    else if (whole.startsWith('an hour and a half')) sec = 5400;
    else {
      const n = parseNum(m[1]); // ranges use the lower number: check early, add time if needed
      if (!isFinite(n) || n <= 0) continue;
      sec = n * unitSec(m[3]);
      if (m[4] && m[5]) sec += parseNum(m[4]) * unitSec(m[5]);
    }
    sec = Math.round(sec);
    if (sec < 5 || sec > 24 * 3600) continue;
    out.push({ start: m.index, end: m.index + m[0].length, sec, kind: 'timer' });
  }
  return out;
}

/* --- Doses: scaling quantities --- */
const GLYPH = [[.25, '¼'], [1 / 3, '⅓'], [.5, '½'], [2 / 3, '⅔'], [.75, '¾']];
function fmtQty(v) {
  if (v >= 10) return String(Math.round(v));
  const whole = Math.floor(v), f = v - whole;
  if (f < 0.06) return String(whole || (v > 0 ? '¼' : 0));
  if (f > 0.94) return String(whole + 1);
  for (const [g, s] of GLYPH) if (Math.abs(f - g) < 0.06) return (whole ? whole : '') + s;
  return String(Math.round(v * 10) / 10);
}
function scaleMeasure(measure, mult) {
  if (!measure || mult === 1) return measure;
  return measure.replace(/\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔]/g, tok => {
    const v = parseNum(tok);
    if (!isFinite(v)) return tok;
    const trailingSpace = /\s$/.test(tok) ? ' ' : '';
    return fmtQty(v * mult) + trailingSpace;
  });
}

/* --- Finding ingredients mentioned in a step --- */
const PART_WORDS = new Set(['breast', 'breasts', 'thigh', 'thighs', 'fillet', 'fillets', 'leg', 'legs', 'wings', 'chops', 'steak', 'steaks',
  'mince', 'stock', 'clove', 'cloves', 'leaves', 'leaf', 'stalk', 'stalks', 'florets', 'cheese', 'cubes', 'pieces', 'slices', 'rashers', 'sprigs']);
const VAGUE_LAST = new Set(['sauce', 'leaves', 'leaf', 'powder', 'seeds', 'juice', 'mix', 'paste', 'extract', 'pieces', 'slices', 'cubes',
  'sprigs', 'rashers', 'fillets', 'fillet', 'stalks', 'florets', 'cloves', 'clove', 'flakes', 'chopped', 'of', 'and', 'to', 'taste', 'free', 'range', 'large', 'small']);
const ADJ = new Set(['fresh', 'large', 'small', 'medium', 'red', 'green', 'yellow', 'white', 'black', 'brown', 'dark', 'light', 'plain', 'dried',
  'ground', 'chopped', 'minced', 'sliced', 'frozen', 'extra', 'virgin', 'unsalted', 'salted', 'sweet', 'hot', 'smoked', 'baby', 'whole',
  'double', 'single', 'heavy', 'sour', 'caster', 'granulated', 'icing', 'cold', 'warm', 'boneless', 'skinless', 'spring', 'self-raising', 'free-range']);
const sing = w => w.replace(/(ies)$/, 'y').replace(/(oes|ches|shes|sses)$/, m => m.slice(0, -2)).replace(/s$/, '');
const escRe = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function buildMatchers(ings) {
  const owners = new Map(); // candidate -> Set(ingredient index)
  const cands = ings.map((ing, i) => {
    const name = ing.name.toLowerCase().replace(/\s+/g, ' ').trim();
    const words = name.split(' ');
    const list = [{ c: name, w: 3 }, { c: sing(name), w: 3 }];
    if (words.length > 1) {
      const last = words[words.length - 1];
      if (last.length >= 3 && !VAGUE_LAST.has(last)) list.push({ c: sing(last), w: 2 });
      const first = words[0];
      if (first.length >= 4 && !ADJ.has(first) && PART_WORDS.has(last)) list.push({ c: sing(first), w: 1 });
      // "red onion" → also match "onion"; "extra virgin olive oil" → "olive oil"
      if (words.length > 2) list.push({ c: sing(words.slice(-2).join(' ')), w: 2 });
    }
    const uniq = [...new Map(list.filter(x => x.c.length >= 3).map(x => [x.c, x])).values()];
    uniq.forEach(x => { if (!owners.has(x.c)) owners.set(x.c, new Set()); owners.get(x.c).add(i); });
    return uniq;
  });
  // a candidate shared by two ingredients is ambiguous → drop it (unless it's someone's full name)
  const flat = [];
  cands.forEach((list, i) => list.forEach(x => {
    if (owners.get(x.c).size > 1 && x.w < 3) return;
    flat.push({ i, w: x.w, re: new RegExp('(?<![\\w-])' + escRe(x.c) + '(?:e?s)?(?![\\w])', 'gi'), len: x.c.length });
  }));
  flat.sort((a, b) => b.len - a.len || b.w - a.w);
  return flat;
}

function findIngredients(text, matchers, taken) {
  const found = [], usedIng = new Set();
  const overlaps = (s, e) => taken.some(t => s < t.end && e > t.start) || found.some(t => s < t.end && e > t.start);
  for (const m of matchers) {
    if (usedIng.has(m.i)) continue;
    m.re.lastIndex = 0;
    let r;
    while ((r = m.re.exec(text))) {
      const s = r.index, e = s + r[0].length;
      // a partial name glued to another ingredient ("Parmesan flakes") belongs to that one
      const glued = m.w < 3 && found.some(f => f.end <= s && /^[\s-]*$/.test(text.slice(f.end, s)));
      if (!overlaps(s, e) && !glued) {
        // the step already says how much ("2 tablespoons of water") → don't add the recipe's total
        const before = text.slice(Math.max(0, s - 32), s);
        const explicit = /(?:\d|[½¼¾⅓⅔]|\b(?:one|two|three|four|half))[\d\/.,]*\s*(?:[a-z.]+\s+){0,2}(?:of\s+)?(?:the\s+)?$/i.test(before)
          && !/\b(?:minutes?|mins?|hours?|seconds?)\b[^\d]*$/i.test(before);
        found.push({ start: s, end: e, i: m.i, kind: 'ing', explicit });
        usedIng.add(m.i);
        break;
      }
    }
  }
  return found;
}

/* Turn one step into HTML with dose badges + timer buttons, all escaped. */
function stepHTML(text, ctx, stepIdx) {
  const timers = findDurations(text);
  const ings = findIngredients(text, ctx.matchers, timers);
  const marks = [...timers, ...ings].sort((a, b) => a.start - b.start);
  let html = '', pos = 0, tIdx = 0;
  for (const mk of marks) {
    html += esc(text.slice(pos, mk.start));
    const piece = text.slice(mk.start, mk.end);
    if (mk.kind === 'timer') {
      const key = `${ctx.id}:${stepIdx}:${tIdx++}`;
      const running = timers_.some(t => t.key === key) ? ' running' : '';
      html += `<button type="button" class="tbtn${running}" data-timer="${mk.sec}" data-key="${esc(key)}" data-step="${stepIdx + 1}" aria-label="Start timer: ${esc(piece)}">${esc(piece)}</button>`;
    } else {
      const ing = ctx.ings[mk.i];
      const dose = scaleMeasure(ing.measure, ctx.mult);
      html += `<span class="ing">${esc(piece)}</span>` + (dose && !mk.explicit ? `<span class="dose">${esc(dose)}</span>` : '');
    }
    pos = mk.end;
  }
  return html + esc(text.slice(pos));
}

/* ============================================================
   TIMERS — in-app only, no permissions. Based on the clock time,
   so they stay correct even if the phone sleeps for a while.
   ============================================================ */
let timers_ = load('er.timers', []).map(t => ({ ...t, ringing: false }));
let tickHandle = null, audioCtx = null, alarmHandle = null, titleBackup = document.title;
const fmtTime = s => {
  s = Math.max(0, Math.ceil(s));
  const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
  return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(sec).padStart(2, '0');
};
const remaining = t => t.paused ? t.left : (t.endAt - Date.now()) / 1000;
const saveTimers = () => store('er.timers', timers_.map(({ ringing, ...t }) => t));

function unlockAudio() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch { /* no audio available */ }
}
function beep() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  [0, 0.22, 0.44].forEach((d, k) => {
    const o = audioCtx.createOscillator(), g = audioCtx.createGain();
    o.type = 'sine'; o.frequency.value = k === 2 ? 1046 : 880;
    g.gain.setValueAtTime(0.0001, now + d);
    g.gain.exponentialRampToValueAtTime(0.35, now + d + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + d + 0.18);
    o.connect(g).connect(audioCtx.destination); o.start(now + d); o.stop(now + d + 0.2);
  });
}
function updateAlarm() {
  const ringing = timers_.some(t => t.ringing);
  if (ringing && !alarmHandle) {
    let n = 0;
    const ring = () => {
      beep();
      if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
      document.title = (n++ % 2) ? '⏰ ' + T.timerDone : titleBackup;
      if (n > 90) stopAllRinging(); // gives up after ~2 minutes
    };
    ring(); alarmHandle = setInterval(ring, 1300);
  } else if (!ringing && alarmHandle) {
    clearInterval(alarmHandle); alarmHandle = null; document.title = titleBackup;
    if (navigator.vibrate) navigator.vibrate(0);
  }
}
function stopAllRinging() { timers_ = timers_.filter(t => !t.ringing); saveTimers(); renderDock(); updateAlarm(); }

function startTimer(sec, label, key) {
  unlockAudio();
  if (key && timers_.some(t => t.key === key)) { toast(T.alreadyRunning); return; }
  timers_.push({ id: Math.random().toString(36).slice(2), key, label, total: sec, endAt: Date.now() + sec * 1000, paused: false, left: sec });
  saveTimers(); renderDock(); markRunningButtons();
}
function tick() {
  let changed = false;
  for (const t of timers_) {
    if (!t.paused && !t.ringing && remaining(t) <= 0) { t.ringing = true; changed = true; }
  }
  if (changed) { renderDock(); updateAlarm(); }
  $$('#dock .timer').forEach(el => {
    const t = timers_.find(x => x.id === el.dataset.id);
    if (t) $('.time', el).textContent = t.ringing ? T.timerDone : fmtTime(remaining(t));
  });
  if (!timers_.length && tickHandle) { clearInterval(tickHandle); tickHandle = null; }
}
function renderDock() {
  const dock = $('#dock');
  dock.innerHTML = timers_.map(t => `
    <div class="timer${t.ringing ? ' ringing' : ''}${t.paused ? ' paused' : ''}" data-id="${t.id}" role="timer">
      <span class="lbl">${esc(t.label)}</span>
      <span class="time">${t.ringing ? T.timerDone : fmtTime(remaining(t))}</span>
      ${t.ringing
        ? `<button type="button" data-act="stop">${T.stop}</button>`
        : `<button type="button" data-act="toggle" aria-label="${t.paused ? 'Resume' : 'Pause'}">${t.paused ? ICON.play : ICON.pause}</button>
           <button type="button" data-act="plus" aria-label="Add one minute">${ICON.plus1}</button>
           <button type="button" data-act="cancel" aria-label="Cancel timer">${ICON.close}</button>`}
    </div>`).join('');
  if (timers_.length && !tickHandle) tickHandle = setInterval(tick, 250);
  // keep page content clear of the dock
  requestAnimationFrame(() => { document.body.style.paddingBottom = `calc(var(--tabbar-h) + env(safe-area-inset-bottom) + ${dock.offsetHeight + 12}px)`; });
}
function markRunningButtons() {
  $$('.tbtn').forEach(b => b.classList.toggle('running', timers_.some(t => t.key === b.dataset.key)));
}
$('#dock').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.closest('.timer').dataset.id, t = timers_.find(x => x.id === id); if (!t) return;
  const act = btn.dataset.act;
  if (act === 'toggle') {
    if (t.paused) { t.endAt = Date.now() + t.left * 1000; t.paused = false; }
    else { t.left = remaining(t); t.paused = true; }
  } else if (act === 'plus') {
    if (t.paused) t.left += 60; else t.endAt += 60000;
  } else if (act === 'cancel' || act === 'stop') {
    timers_ = timers_.filter(x => x !== t);
  }
  saveTimers(); renderDock(); updateAlarm(); markRunningButtons();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); requestWake(); } });

/* ---------- Keep the screen on in cook mode (no permission needed) ---------- */
let wakeLock = null, wantWake = false;
async function requestWake() {
  if (!wantWake || !('wakeLock' in navigator) || document.hidden) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); } catch { wakeLock = null; }
}
function releaseWake() { wantWake = false; if (wakeLock) { wakeLock.release().catch(() => {}); wakeLock = null; } }

/* ============================================================
   VIEWS
   ============================================================ */
let lastRandom = null;
const thumb = (url, size) => url ? `${url}/${size}` : '';

function cardHTML(m) {
  return `<a class="card" href="#/meal/${esc(m.idMeal)}">
    <img class="ph" src="${esc(thumb(m.strMealThumb, 'medium'))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
    <span class="t">${esc(m.strMeal)}</span></a>`;
}

async function viewHome(params) {
  const q = params.get('q') || '', by = params.get('by') || 'name';
  view.innerHTML = `
    <form class="search" role="search" id="sform">
      <label class="sr-only" for="q">${T.searchPh}</label>
      <input id="q" name="q" type="search" placeholder="${T.searchPh}" value="${esc(q)}" autocomplete="off" enterkeyhint="search">
      <button class="btn" type="submit">${T.go}</button>
    </form>
    <div class="seg" role="group" aria-label="Search type">
      <button type="button" data-by="name" aria-pressed="${by === 'name'}">${T.byName}</button>
      <button type="button" data-by="ing" aria-pressed="${by === 'ing'}">${T.byIng}</button>
    </div>
    <div id="results"></div>
    <section class="section" id="surprise"></section>
    <section class="section"><div class="section-head"><h2>${T.categories}</h2></div><div class="chips" id="cats">${loadingHTML}</div></section>
    <section class="section"><div class="section-head"><h2>${T.cuisines}</h2></div><div class="chips" id="areas"></div></section>
    ${creditsHTML()}`;

  let searchBy = by;
  $$('.seg button').forEach(b => b.addEventListener('click', () => {
    searchBy = b.dataset.by;
    $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#q').placeholder = searchBy === 'ing' ? 'e.g. chicken, garlic, salmon…' : T.searchPh;
  }));
  $('#sform').addEventListener('submit', e => {
    e.preventDefault();
    const v = $('#q').value.trim(); if (!v) return;
    location.hash = `#/?q=${encodeURIComponent(v)}&by=${searchBy}`;
  });

  if (q) runSearch(q, by);
  renderSurprise();

  try {
    const [cats, areas] = await Promise.all([api('categories.php'), api('list.php?a=list')]);
    $('#cats').innerHTML = (cats.categories || []).map(c =>
      `<a class="chip" href="#/browse/c/${encodeURIComponent(c.strCategory)}"><img src="${esc(c.strCategoryThumb)}" alt="" loading="lazy">${esc(c.strCategory)}</a>`).join('');
    $('#areas').innerHTML = (areas.meals || []).map(a => a.strArea).filter(a => a && a !== 'Unknown').sort()
      .map(a => `<a class="chip no-img" href="#/browse/a/${encodeURIComponent(a)}">${esc(a)}</a>`).join('');
  } catch {
    $('#cats').innerHTML = '';
    if (!q) $('#results').innerHTML = emptyHTML(T.offline);
  }
}

async function runSearch(q, by) {
  const box = $('#results');
  box.innerHTML = `<section class="section"><div class="section-head"><h2>${T.results}</h2></div>${loadingHTML}</section>`;
  try {
    const path = by === 'ing'
      ? 'filter.php?i=' + encodeURIComponent(q.toLowerCase().replace(/\s+/g, '_'))
      : 'search.php?s=' + encodeURIComponent(q);
    const data = await api(path);
    const meals = data.meals || [];
    box.innerHTML = `<section class="section"><div class="section-head"><h2>${T.results}</h2></div>
      ${meals.length ? `<div class="grid">${meals.map(cardHTML).join('')}</div>` : emptyHTML(T.noResults)}</section>`;
  } catch { box.innerHTML = emptyHTML(T.offline); }
}

async function renderSurprise(fresh) {
  const box = $('#surprise'); if (!box) return;
  try {
    if (!lastRandom || fresh) {
      box.innerHTML = loadingHTML;
      const r = await fetch(API + 'random.php').then(x => x.json());
      lastRandom = r.meals && r.meals[0];
    }
    const m = lastRandom; if (!m) { box.innerHTML = ''; return; }
    box.innerHTML = `
      <div class="section-head"><div class="surprise-head"><img src="${CHICK.cheer}" alt="" width="44" height="56"><h2>${T.surprise}</h2></div>
        <button class="btn soft small" type="button" id="again">${ICON.dice} ${T.another}</button></div>
      <a class="feature" href="#/meal/${esc(m.idMeal)}">
        <img src="${esc(thumb(m.strMealThumb, 'medium'))}" alt="">
        <div><span class="kicker">${esc(m.strArea || '')} · ${esc(m.strCategory || '')}</span>
        <h3>${esc(m.strMeal)}</h3></div></a>`;
    $('#again').addEventListener('click', () => renderSurprise(true));
  } catch { box.innerHTML = ''; }
}

async function viewBrowse(kind, value) {
  view.innerHTML = `
    <div class="section-head" style="margin-top:6px">
      <button class="icon-btn" type="button" onclick="history.length > 1 ? history.back() : (location.hash='#/')" aria-label="${T.back}">${ICON.back}</button>
      <h1 style="flex:1">${esc(value)}</h1></div>
    <div id="list">${loadingHTML}</div>${creditsHTML()}`;
  try {
    const data = await api(`filter.php?${kind}=${encodeURIComponent(value)}`);
    const meals = (data.meals || []).sort((a, b) => a.strMeal.localeCompare(b.strMeal));
    $('#list').innerHTML = meals.length ? `<div class="grid">${meals.map(cardHTML).join('')}</div>` : emptyHTML(T.noResults);
  } catch { $('#list').innerHTML = emptyHTML(T.offline); }
}

/* Per-recipe state kept while the app is open */
const recipeState = new Map(); // id -> { mult, checked:Set, done:Set }
const getState = id => { if (!recipeState.has(id)) recipeState.set(id, { mult: 1, checked: new Set(), done: new Set() }); return recipeState.get(id); };

async function getMeal(id) {
  if (saved[id]) return saved[id].meal; // works offline
  const data = await api('lookup.php?i=' + encodeURIComponent(id));
  return data.meals && data.meals[0];
}
function makeCtx(meal) {
  const ings = getIngredients(meal);
  return { id: meal.idMeal, ings, matchers: buildMatchers(ings), steps: splitSteps(meal.strInstructions), mult: getState(meal.idMeal).mult };
}

async function viewMeal(id) {
  view.innerHTML = loadingHTML;
  let meal;
  try { meal = await getMeal(id); } catch { view.innerHTML = emptyHTML(T.offline); return; }
  if (!meal) { view.innerHTML = emptyHTML(T.noResults); return; }
  const st = getState(id);
  const MULTS = [0.5, 1, 1.5, 2, 3];
  const tags = (meal.strTags || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);

  view.innerHTML = `
    <div class="hero">
      <img src="${esc(meal.strMealThumb || '')}" alt="${esc(meal.strMeal)}" onerror="this.style.visibility='hidden'">
      <div class="top-actions">
        <button class="icon-btn" type="button" id="back" aria-label="${T.back}">${ICON.back}</button>
        <button class="icon-btn" type="button" id="save" aria-pressed="${isSaved(id)}" aria-label="${T.save}">${isSaved(id) ? ICON.heartFull : ICON.heart}</button>
      </div>
    </div>
    <p class="photo-credit">${T.photoBy}</p>
    <h1 class="recipe-title">${esc(meal.strMeal)}</h1>
    <div class="tags">
      ${meal.strArea && meal.strArea !== 'Unknown' ? `<span class="tag">${esc(meal.strArea)}</span>` : ''}
      ${meal.strCategory ? `<span class="tag p">${esc(meal.strCategory)}</span>` : ''}
      ${tags.map(t => `<span class="tag o">${esc(t)}</span>`).join('')}
    </div>

    <a class="btn block" style="margin-top:16px" href="#/cook/${esc(id)}">${ICON.chef} ${T.startCooking}</a>

    <div class="box">
      <div class="batch"><h2>${T.batch}</h2>
        <div class="opts" role="group" aria-label="${T.batch}">
          ${MULTS.map(m => `<button type="button" data-mult="${m}" aria-pressed="${st.mult === m}">${fmtQty(m)}×</button>`).join('')}
        </div></div>
      <p class="hint">${T.batchHint}</p>
    </div>

    <div class="box"><h2>${T.ingredients}</h2><ul class="ing-list" id="ings"></ul></div>
    <div class="box"><h2>${T.steps}</h2><ol class="steps" id="steps"></ol></div>
    <div id="notebox"></div>
    <div class="links">
      ${meal.strSource ? `<a class="btn green small" href="${esc(meal.strSource)}" target="_blank" rel="noopener noreferrer">${ICON.link} ${T.original}</a>` : ''}
      ${meal.strYoutube ? `<a class="btn pink small" href="${esc(meal.strYoutube)}" target="_blank" rel="noopener noreferrer">${ICON.video} ${T.video}</a>` : ''}
    </div>
    ${creditsHTML()}`;

  const render = () => {
    const ctx = makeCtx(meal);
    $('#ings').innerHTML = ctx.ings.map((ing, i) => `
      <li><label>
        <input type="checkbox" data-i="${i}" ${st.checked.has(i) ? 'checked' : ''}>
        <img src="${ING_IMG + encodeURIComponent(ing.name.replace(/ /g, '_'))}-small.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <span><span class="name">${esc(ing.name)}</span>${ing.measure ? `<span class="qty">${esc(scaleMeasure(ing.measure, ctx.mult))}</span>` : ''}</span>
      </label></li>`).join('');
    $('#steps').innerHTML = ctx.steps.map((s, i) => `
      <li class="${st.done.has(i) ? 'done' : ''}">
        <p class="step-text">${stepHTML(s, ctx, i)}</p>
        <button type="button" class="step-done" data-done="${i}">${st.done.has(i) ? T.stepUndo : T.stepDone}</button>
      </li>`).join('');
  };
  const renderNote = () => {
    $('#notebox').innerHTML = isSaved(id) ? `<div class="box"><h2><label for="note">${T.note}</label></h2>
      <textarea id="note" class="note-area" placeholder="${T.notePh}" style="margin-top:10px">${esc(saved[id].note || '')}</textarea></div>` : '';
    const n = $('#note');
    if (n) n.addEventListener('input', () => { saved[id].note = n.value; persistSaved(); });
  };
  render(); renderNote();

  $('#back').addEventListener('click', () => history.length > 1 ? history.back() : (location.hash = '#/'));
  $('#save').addEventListener('click', e => {
    toggleSave(meal);
    const b = e.currentTarget; b.innerHTML = isSaved(id) ? ICON.heartFull : ICON.heart; b.setAttribute('aria-pressed', isSaved(id));
    renderNote();
  });
  $$('[data-mult]').forEach(b => b.addEventListener('click', () => {
    st.mult = +b.dataset.mult;
    $$('[data-mult]').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  }));
  $('#ings').addEventListener('change', e => {
    const i = +e.target.dataset.i; e.target.checked ? st.checked.add(i) : st.checked.delete(i);
  });
  $('#steps').addEventListener('click', e => {
    const d = e.target.closest('[data-done]');
    if (d) { const i = +d.dataset.done; st.done.has(i) ? st.done.delete(i) : st.done.add(i); render(); }
  });
  bindTimerButtons(meal);
}

function bindTimerButtons(meal) {
  view.addEventListener('click', e => {
    const b = e.target.closest('.tbtn'); if (!b) return;
    const short = meal.strMeal.length > 22 ? meal.strMeal.slice(0, 21) + '…' : meal.strMeal;
    startTimer(+b.dataset.timer, `${T.step} ${b.dataset.step} · ${short}`, b.dataset.key);
  });
}

async function viewCook(id, stepParam) {
  view.innerHTML = loadingHTML;
  let meal;
  try { meal = await getMeal(id); } catch { view.innerHTML = emptyHTML(T.offline); return; }
  if (!meal) { view.innerHTML = emptyHTML(T.noResults); return; }
  const ctx = makeCtx(meal), st = getState(id);
  let i = Math.min(Math.max(0, (+stepParam || 1) - 1), ctx.steps.length - 1);
  wantWake = true; requestWake();

  const draw = () => {
    const last = i === ctx.steps.length - 1;
    view.innerHTML = `
      <div class="cook">
        <div class="cook-top">
          <button class="icon-btn" type="button" id="exit" aria-label="${T.back}">${ICON.close}</button>
          <h2 style="flex:1;text-align:center">${esc(meal.strMeal)}</h2>
          <span style="width:52px"></span>
        </div>
        <div class="progress" aria-hidden="true"><div style="width:${((i + 1) / ctx.steps.length) * 100}%"></div></div>
        <div class="cook-step" aria-live="polite">
          <span class="kicker">${T.step} ${i + 1} ${T.of} ${ctx.steps.length}${ctx.mult !== 1 ? ` · ${fmtQty(ctx.mult)}×` : ''}</span>
          ${stepHTML(ctx.steps[i], ctx, i)}
        </div>
        <div class="cook-nav">
          <button class="btn soft" type="button" id="prev" ${i === 0 ? 'disabled style="opacity:.45"' : ''}>${T.prev}</button>
          <button class="btn ${last ? 'green' : ''}" type="button" id="next">${last ? T.finish : T.next}</button>
        </div>
        ${'wakeLock' in navigator ? `<p class="awake">☀︎ ${T.awake}</p>` : ''}
      </div>`;
    $('#exit').addEventListener('click', () => { location.hash = '#/meal/' + id; });
    $('#prev').addEventListener('click', () => { if (i > 0) { i--; draw(); } });
    $('#next').addEventListener('click', () => {
      st.done.add(i);
      if (last) { location.hash = '#/done/' + id; return; }
      i++; draw(); window.scrollTo(0, 0);
    });
  };
  draw();
  bindTimerButtons(meal);
}

function viewSaved() {
  const items = Object.values(saved).sort((a, b) => b.savedAt - a.savedAt);
  const lastExp = load('er.lastExport', 0);
  view.innerHTML = `
    <h1 style="margin:8px 0 14px">${T.cookbook}</h1>
    ${items.length ? items.map(({ meal, note }) => `
      <a class="list-item" href="#/meal/${esc(meal.idMeal)}">
        <img src="${esc(thumb(meal.strMealThumb, 'small'))}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <span><span class="title-font" style="font-size:1.1rem;display:block">${esc(meal.strMeal)}</span>
        <span class="meta">${esc([meal.strArea, meal.strCategory].filter(Boolean).join(' · '))}${note ? ' · 📝' : ''}</span></span>
        <span aria-hidden="true" style="color:var(--pink-ink)">${ICON.heartFull}</span>
      </a>`).join('') : emptyHTML(T.emptyBook)}
    <div class="box">
      <h2>${T.backup}</h2>
      <p class="hint" style="font-size:1rem">${T.backupHint}</p>
      <p class="hint"><strong>${T.lastBackup}:</strong> ${lastExp ? new Date(lastExp).toLocaleDateString() : T.never}</p>
      <div class="backup" style="margin-top:12px">
        <button class="btn" type="button" id="exp" ${items.length ? '' : 'disabled style="opacity:.5"'}>${ICON.down} ${T.exportBtn}</button>
        <button class="btn green" type="button" id="imp">${ICON.up} ${T.importBtn}</button>
        <input type="file" id="file" accept="application/json,.json" hidden>
      </div>
    </div>
    ${creditsHTML()}`;

  $('#exp').addEventListener('click', () => {
    const data = { app: 'easy-recipes', version: 1, exportedAt: new Date().toISOString(), recipes: Object.values(saved) };
    const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `easy-recipes-cookbook-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 5000);
    store('er.lastExport', Date.now()); toast(T.exported); viewSaved();
  });
  $('#imp').addEventListener('click', () => $('#file').click());
  $('#file').addEventListener('change', async e => {
    const f = e.target.files[0]; if (!f) return;
    try {
      const data = JSON.parse(await f.text());
      if (data.app !== 'easy-recipes' || !Array.isArray(data.recipes)) throw 0;
      let n = 0;
      for (const r of data.recipes) {
        if (!r || !r.meal || !r.meal.idMeal || !r.meal.strMeal) continue;
        const cur = saved[r.meal.idMeal];
        if (!cur || (r.savedAt || 0) >= (cur.savedAt || 0) || (!cur.note && r.note)) {
          saved[r.meal.idMeal] = { meal: r.meal, savedAt: r.savedAt || Date.now(), note: String(r.note || cur?.note || '') };
          n++;
        }
      }
      persistSaved(); toast(T.imported(n)); viewSaved();
    } catch { toast(T.badFile); }
  });
}

/* "Recipe finished" moment */
async function viewDone(id) {
  let meal = null;
  try { meal = await getMeal(id); } catch { /* offline: still celebrate */ }
  const draw = () => {
    view.innerHTML = `
      <div class="finish">
        <img src="${CHICK.happy}" alt="" width="190" height="260">
        <h1>${T.doneTitle}</h1>
        <p>${T.doneText}</p>
        <div class="actions">
          ${meal ? (isSaved(id)
            ? `<button class="btn green" type="button" disabled>${ICON.heartFull} ${T.doneSaved}</button>`
            : `<button class="btn pink" type="button" id="dsave">${ICON.heart} ${T.doneSave}</button>`) : ''}
          <a class="btn soft" href="#/meal/${esc(id)}">${T.doneBack}</a>
          <a class="btn" href="#/">${T.doneMore}</a>
        </div>
      </div>`;
    const b = $('#dsave'); if (b) b.addEventListener('click', () => { toggleSave(meal); draw(); });
  };
  draw();
}

/* First launch: welcome screen with the logo, shown once */
function showWelcome() {
  if (load('er.welcomed', false)) return;
  const el = document.createElement('div');
  el.className = 'welcome'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-labelledby', 'wtitle');
  const tints = ['var(--yellow)', 'var(--pink-soft)', 'var(--green-soft)'];
  el.innerHTML = `
    <img class="badge" src="icons/logo-badge.webp" alt="Easy Recipes" width="270" height="332">
    <h1 id="wtitle">${T.welcomeTitle}</h1>
    <ul>${T.welcomePoints.map(([ic, txt], i) => `<li><span style="background:${tints[i]}" aria-hidden="true">${ic}</span><span>${esc(txt)}</span></li>`).join('')}</ul>
    <div class="actions">
      <button class="btn" type="button" id="wgo">${T.welcomeGo}</button>
      <button class="btn soft" type="button" id="wskip">${T.welcomeSkip}</button>
    </div>`;
  document.body.appendChild(el);
  const close = () => { store('er.welcomed', true); el.remove(); };
  $('#wskip', el).addEventListener('click', close);
  $('#wgo', el).addEventListener('click', async () => {
    close();
    try {
      const r = await fetch(API + 'random.php').then(x => x.json());
      if (r.meals && r.meals[0]) { memo.set('lookup.php?i=' + r.meals[0].idMeal, r); location.hash = '#/meal/' + r.meals[0].idMeal; }
    } catch { /* offline: stay on explore */ }
  });
  $('#wgo', el).focus();
}

/* ---------- Router ---------- */
function route() {
  const hash = location.hash.slice(1) || '/';
  const [path, qs] = hash.split('?');
  const parts = path.split('/').filter(Boolean).map(decodeURIComponent);
  const params = new URLSearchParams(qs || '');
  if (parts[0] !== 'cook') releaseWake();
  const tab = parts[0] === 'saved' ? 'saved' : 'explore';
  $$('.tabbar a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const fresh = view.cloneNode(false); view.replaceWith(fresh); // drop old listeners
  view = fresh;
  if (parts[0] === 'meal' && parts[1]) viewMeal(parts[1]);
  else if (parts[0] === 'cook' && parts[1]) viewCook(parts[1], parts[2]);
  else if (parts[0] === 'browse' && parts[2]) viewBrowse(parts[1] === 'a' ? 'a' : 'c', parts[2]);
  else if (parts[0] === 'done' && parts[1]) viewDone(parts[1]);
  else if (parts[0] === 'saved') viewSaved();
  else viewHome(params);
  if (parts[0] !== 'cook') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);

/* ---------- Boot ---------- */
renderDock(); tick();
showWelcome();
route();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
