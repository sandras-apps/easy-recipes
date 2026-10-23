/* Easy Recipes — a free, no-account recipe PWA.
   Recipes & photos: TheMealDB (https://www.themealdb.com).
   More recipes: the developer's own House recipes (Cooklang files in /my-recipes).
   Everything you save stays on this device (localStorage). No permissions, no cookies.
   The only analytics is GoatCounter's anonymous visit count (see index.html). */
'use strict';

/* TheMealDB key. '1' is the free test key (development and personal use only).
   After becoming a TheMealDB supporter, paste your key here instead of '1'. */
const MEALDB_KEY = '1';
const PREMIUM = MEALDB_KEY !== '1';
const API = PREMIUM ? `https://www.themealdb.com/api/json/v2/${MEALDB_KEY}/` : 'https://www.themealdb.com/api/json/v1/1/';
/* Where people can send their recipes. Leave it empty ('') to hide the "Share your recipe" box. */
const CONTACT_EMAIL = 'sandras.apps.studio@gmail.com';
const ING_IMG = 'https://www.themealdb.com/images/ingredients/';
const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
let view = $('#view');

/* ---------- UI text (all in one place, so translating later is easy) ---------- */
const T = {
  searchPh: 'Search recipes…', byName: 'By name', byIng: 'By ingredient', byAuthor: 'By author', go: 'Go',
  authorHint: 'Authors are shown on House recipes — the ones written for Easy Recipes or sent in by people like you.',
  surprise: 'Surprise me', another: 'Another one', categories: 'Categories', cuisines: 'Cuisines',
  results: 'Results', noResults: "No recipes found. Try another word!",
  offline: "Can't reach the recipe kitchen right now. Check your connection — your saved recipes still work offline.",
  back: 'Back', save: 'Save', saved: 'Saved', ingredients: 'Ingredients', steps: 'Steps',
  batch: 'Servings', batchHint: 'All doses update everywhere, steps included.',
  units: 'Units', uOrig: 'As written', uMetric: 'Metric', uUS: 'US',
  unitsHint: 'Metric: grams, ml, °C. US: ounces, pounds, cups, °F. Teaspoons and tablespoons stay the same; cups are converted by volume.',
  backAt: 'back at', phoneHint: "Set a timer on your phone too — Easy Recipes can only ring while it's open.",
  inAppHint: 'Timers ring only while Easy Recipes is open.',
  backAtLong: t => `Come back at ${t}`,
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
  awake: 'Screen stays on — keep the app open so timers can ring',
  timerDone: 'Done!', stop: 'Stop', alreadyRunning: 'That timer is already running',
  imported: n => `Imported ${n} recipe${n === 1 ? '' : 's'}`, exported: 'Backup saved to your downloads',
  badFile: "That file doesn't look like an Easy Recipes backup", removed: 'Removed from your cookbook', addedBook: 'Saved to your cookbook',
  photoBy: 'Photo: TheMealDB community',
  servingsLbl: 'Servings', settings: 'Settings',
  servHintKnown: (b, d) => `The original recipe serves ${b}.` + (d ? ` Your default is ${d} — change it in Settings.` : ''),
  servHintGuess: d => `The original recipe doesn't say how many it serves, so we assume 4.` + (d ? ` Your default is ${d}.` : ''),
  defServ: 'Default servings', defServHint: 'Every recipe opens with this many servings. You can still change it on each recipe — for a guest, or when cooking just for you.',
  asRecipe: 'As in the recipe', defUnits: 'Units', about: 'About',
  aboutText: 'Easy Recipes is free, has no ads, no account and no cookies. Your cookbook and settings stay on this phone. The only thing counted is the visit itself, anonymously, with GoatCounter (no cookies, no personal data).',
  srcMealDB: 'This recipe comes from <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer">TheMealDB</a>, a free recipe database made by its community.',
  srcHouseOwn: 'Made by Easy Recipes 🐣',
  srcHouseBy: n => `Recipe by ${n}, shared with Easy Recipes 🐣`,
  tips: 'Tips & notes', house: 'House recipes', moreCuisines: 'More cuisines', lessCuisines: 'Show fewer', home: 'Home', houseHint: 'Written for Easy Recipes, with doses and timers built in.',
  by: 'Recipe by', byShort: 'by',
  shareTitle: 'Got a recipe you love?',
  shareText: "Send it by email, with a photo of your dish. If it's chosen, it will be published here with your name. By sending it, you allow Easy Recipes to publish your recipe, your photo and the name you choose.",
  shareBtn: 'Send your recipe',
  shareSubject: 'My recipe for Easy Recipes',
  shareBody: [
    'Hi Easy Recipes!', '', 'Here is my recipe.', '',
    'Recipe name:', '', 'Serves (how many people):', '', 'Total time:', '',
    'Categories (e.g. Pasta, Dessert, Vegetarian, Vegan, Starter, First courses, Complete meal):', '',
    'Cuisine (e.g. Italian, Mexican, Indian — or leave empty):', '',
    'Ingredients (with quantities):', '', '', 'Steps:', '', '', 'Tips (optional):', '', '',
    'Name to show as the author (your name or a nickname):', '',
    '📷 Please attach a photo of your dish, taken by you.', '', '—',
    'By sending this email, I confirm that this recipe and photo are my own, and I allow Easy Recipes to publish them in the app '
    + '(adapted to the app\'s format) together with the author name above. I can ask for them to be removed at any time by replying to this address.',
  ].join('\n'),
  servings: 'Serves', time: 'Time',
  /* Only for Wikibooks recipes someone saved before Wikibooks was removed (Oct 2026):
     they stay readable in "My cookbook", with the credit their licence asks for. */
  wbOpen: 'Open on Wikibooks', wbHistory: 'authors',
  wbCredit: (link, hist) => `Adapted from ${link} in the Wikibooks Cookbook, written by its ${hist}, and shared under the <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">CC BY-SA 4.0</a> licence. Easy Recipes reformatted it into steps with doses and timers.`,
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
const creditsHTML = () => `<footer class="credits">Recipes from <a href="https://www.themealdb.com" target="_blank" rel="noopener noreferrer">TheMealDB</a> — free and community-made, thank you! — plus our own <a href="#/house">House recipes</a> 🐣</footer>`;

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
  if (Array.isArray(meal._ings)) return meal._ings.map(x => ({ ...x }));
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
const GLYPH = [[.125, '⅛'], [.25, '¼'], [1 / 3, '⅓'], [.5, '½'], [2 / 3, '⅔'], [.75, '¾']];
function fmtQty(v) {
  if (v >= 10) return String(Math.round(v));
  const whole = Math.floor(v), f = v - whole;
  if (f < 0.06) return String(whole || (v > 0 ? '⅛' : 0));
  if (f > 0.94) return String(whole + 1);
  for (const [g, s] of GLYPH) if (Math.abs(f - g) < 0.06) return (whole ? whole : '') + s;
  return String(Math.round(v * 10) / 10);
}
function scaleMeasure(measure, mult) {
  if (!measure || mult === 1) return measure;
  return measure.replace(/\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔]/g, (tok, off, str) => {
    const v = parseNum(tok);
    if (!isFinite(v)) return tok;
    const trailingSpace = /\s$/.test(tok) ? ' ' : '';
    // grams and millilitres read better as plain numbers: 6.7 g, 333 g (not 6⅔ g)
    if (/^\s*(?:g|gr|grams?|kg|mg|ml|cl|dl|l)\b/i.test(str.slice(off + tok.length))) {
      const x = v * mult;
      return (x < 10 ? String(Math.round(x * 10) / 10) : String(Math.round(x))) + trailingSpace;
    }
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
    // "guanciale or pancetta" → either word works
    if (/ or /.test(name)) name.split(/ or /).forEach(p => { p = p.trim(); if (p.length >= 3) list.push({ c: p, w: 2 }, { c: sing(p), w: 2 }); });
    // "Pecorino Romano", "Parmigiano Reggiano" → the first word is the cheese
    if (words.length === 2 && /^[A-Z]/.test(ing.name.trim().split(/\s+/)[1] || '') && words[0].length >= 4 && !ADJ.has(words[0])) list.push({ c: words[0], w: 1 });
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
  if (Array.isArray(text)) return tokensHTML(text, ctx, stepIdx);
  const timers = findDurations(text);
  const ings = findIngredients(text, ctx.matchers, timers);
  const marks = [...timers, ...ings].sort((a, b) => a.start - b.start);
  let html = '', pos = 0, tIdx = 0;
  for (const mk of marks) {
    html += textOut(text.slice(pos, mk.start));
    const piece = text.slice(mk.start, mk.end);
    if (mk.kind === 'timer') {
      html += timerHTML(mk.sec, piece, `${ctx.id}:${stepIdx}:${tIdx++}`, stepIdx + 1);
    } else {
      const ing = ctx.ings[mk.i];
      const dose = doseOut(ing.measure, ctx.mult, ing.fixed);
      html += `<span class="ing">${esc(piece)}</span>` + (dose && !mk.explicit ? `<span class="dose">${esc(dose)}</span>` : '');
    }
    pos = mk.end;
  }
  return html + textOut(text.slice(pos));
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

function startTimer(sec, label, key, long) {
  unlockAudio();
  if (key && timers_.some(t => t.key === key)) { toast(T.alreadyRunning); return; }
  timers_.push({ id: Math.random().toString(36).slice(2), key, label, total: sec, endAt: Date.now() + sec * 1000, paused: false, left: sec, long: !!long });
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
    if (t && !t.long) $('.time', el).textContent = t.ringing ? T.timerDone : fmtTime(remaining(t));
  });
  if (!timers_.length && tickHandle) { clearInterval(tickHandle); tickHandle = null; }
}
function renderDock() {
  const dock = $('#dock');
  const atClock = t => new Date(t.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  dock.innerHTML = timers_.map(t => `
    <div class="timer${t.ringing ? ' ringing' : ''}${t.paused ? ' paused' : ''}${t.long ? ' long' : ''}" data-id="${t.id}" role="timer">
      <span class="lbl">${esc(t.label)}</span>
      <span class="time">${t.ringing ? T.timerDone : t.long ? T.backAtLong(atClock(t)) : fmtTime(remaining(t))}</span>
      ${t.ringing
        ? `<button type="button" data-act="stop">${T.stop}</button>`
        : t.long ? `<button type="button" data-act="cancel" aria-label="Remove reminder">${ICON.close}</button>`
        : `<button type="button" data-act="toggle" aria-label="${t.paused ? 'Resume' : 'Pause'}">${t.paused ? ICON.play : ICON.pause}</button>
           <button type="button" data-act="plus" aria-label="Add one minute">${ICON.plus1}</button>
           <button type="button" data-act="cancel" aria-label="Cancel timer">${ICON.close}</button>`}
    </div>`).join('')
    + (timers_.length ? `<p class="dock-hint">${timers_.some(t => t.long) ? T.phoneHint : T.inAppHint}</p>` : '');
  if (timers_.length && !tickHandle) tickHandle = setInterval(tick, 250);
  // keep page content clear of the dock
  requestAnimationFrame(() => { document.documentElement.style.setProperty('--dock-h', (timers_.length ? dock.offsetHeight : 0) + 'px'); });
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

const thumbOf = (m, size) => m._kind ? (m.strMealThumb || '') : thumb(m.strMealThumb, size);
function cardHTML(m) {
  return `<a class="card" href="${mealHref(m.idMeal)}">
    ${picHTML(thumbOf(m, 'medium'), 'ph', m.strMeal)}
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
      <button type="button" data-by="author" aria-pressed="${by === 'author'}">${T.byAuthor}</button>
      <a class="seg-link" href="#/house">🐣 ${T.house}</a>
    </div>
    <div id="results"></div>
    <section class="section" id="surprise"></section>
    <section class="section"><div class="section-head"><h2>${T.categories}</h2></div><div class="chips" id="cats">${loadingHTML}</div></section>
    <section class="section"><div class="section-head"><h2>${T.cuisines}</h2></div><div class="chips" id="areas"></div></section>
    ${creditsHTML()}`;

  let searchBy = by;
  $$('.seg button[data-by]').forEach(b => b.addEventListener('click', () => {
    searchBy = b.dataset.by;
    $$('.seg button[data-by]').forEach(x => x.setAttribute('aria-pressed', x === b));
    $('#q').placeholder = searchBy === 'ing' ? 'e.g. chicken, garlic, salmon…' : searchBy === 'author' ? 'e.g. Easy Recipes' : T.searchPh;
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
    const mdbCats = (cats.categories || []).map(c => c.strCategory.toLowerCase());
    const extra = [...new Set(['First courses', 'Second courses', ...(await loadHouse()).flatMap(m => m._cats)])].filter(c => !mdbCats.includes(c.toLowerCase())).sort();
    $('#cats').innerHTML = extra.map(c => `<a class="chip no-img" data-extra="${esc(c)}" href="#/browse/c/${encodeURIComponent(c)}">${esc(c)}</a>`).join('') + (cats.categories || []).map(c =>
      `<a class="chip" href="#/browse/c/${encodeURIComponent(c.strCategory)}"><img src="${esc(c.strCategoryThumb)}" alt="" loading="lazy">${esc(c.strCategory)}</a>`).join('');
    fillCategoryPhotos();
    let names = (areas.meals || []).map(a => a.strArea).filter(a => a && a !== 'Unknown').sort();
    const counts = await areaCounts().catch(() => null);
    const houseAreas = (await loadHouse()).map(m => m.strArea).filter(Boolean);
    if (counts) names = names.filter(a => counts[a] > 0 || houseAreas.includes(a));
    renderAreas(names);
  } catch {
    $('#cats').innerHTML = '';
    if (!q) $('#results').innerHTML = emptyHTML(T.offline);
  }
}

/* Our own categories (First courses, Complete meal…) have no TheMealDB picture,
   so each one gets a fixed photo of one of its recipes — always the same, like the others.
   To change one, put another recipe photo here. */
const CATEGORY_PHOTO = {
  'complete meal': 'my-recipes/photos/pan-pizza.webp',
  'first courses': 'my-recipes/photos/pasta-al-pomodoro.webp',
  'second courses': 'https://www.themealdb.com/images/media/meals/vtqxtu1511784197.jpg/small', // Beef Bourguignon
};
/* A new House category not listed above: the first of its recipes (A–Z) that has a photo. */
async function categoryPhoto(cat) {
  const v = cat.toLowerCase();
  if (CATEGORY_PHOTO[v]) return CATEGORY_PHOTO[v];
  const m = (await loadHouse()).filter(x => x.strMealThumb && x._cats.some(c => c.toLowerCase() === v))
    .sort((x, y) => x.strMeal.localeCompare(y.strMeal, 'en', { sensitivity: 'base' }))[0];
  return m ? m.strMealThumb : '';
}
function fillCategoryPhotos() {
  $$('#cats [data-extra]').forEach(async chip => {
    const url = await categoryPhoto(chip.dataset.extra).catch(() => '');
    if (!url || !chip.isConnected) return;
    const img = document.createElement('img');
    img.src = url; img.alt = ''; img.loading = 'lazy';
    img.onerror = () => { img.remove(); chip.classList.add('no-img'); };
    chip.prepend(img); chip.classList.remove('no-img');
  });
}

/* Which cuisines actually have recipes? Count them once a week (26 small requests, a–z). */
async function areaCounts() {
  const cached = load('er.areas', null);
  if (cached && Date.now() - cached.t < 7 * 864e5) return cached.c;
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const res = await Promise.all(letters.map(l => api('search.php?f=' + l).catch(() => null)));
  if (res.some(r => r === null)) throw new Error('partial');
  const c = {};
  res.forEach(r => (r.meals || []).forEach(m => { if (m.strArea) c[m.strArea] = (c[m.strArea] || 0) + 1; }));
  store('er.areas', { t: Date.now(), c });
  return c;
}
function renderAreas(names, open) {
  const box = $('#areas'); if (!box) return;
  const LIMIT = 12, show = open ? names : names.slice(0, LIMIT);
  box.innerHTML = show.map(a => `<a class="chip no-img" href="#/browse/a/${encodeURIComponent(a)}">${esc(a)}</a>`).join('')
    + (names.length > LIMIT ? `<button type="button" class="chip more" id="moreAreas">${open ? T.lessCuisines : T.moreCuisines + ` (${names.length - LIMIT})`}</button>` : '');
  const m = $('#moreAreas'); if (m) m.addEventListener('click', () => renderAreas(names, !open));
}

/* One list, all sources mixed, A–Z. The source is written at the end of each recipe. */
async function mergedHTML(sources) {
  const res = await Promise.allSettled(sources);
  const ok = res.filter(r => r.status === 'fulfilled');
  if (!ok.length) return `<p class="hint">${T.offline}</p>`;
  const seen = new Set(), all = [];
  ok.forEach(r => r.value.forEach(m => { const k = m.strMeal.trim().toLowerCase() + '|' + (m._kind || 'mdb'); if (!seen.has(k)) { seen.add(k); all.push(m); } }));
  all.sort((a, b) => a.strMeal.localeCompare(b.strMeal, 'en', { sensitivity: 'base' }));
  return all.length ? `<p class="hint count">${all.length} ${all.length === 1 ? 'recipe' : 'recipes'}</p><div class="grid">${all.map(cardHTML).join('')}</div>` : emptyHTML(T.noResults);
}
async function runSearch(q, by) {
  const box = $('#results');
  box.innerHTML = `<section class="section"><div class="section-head"><h2>${T.results}</h2></div><div class="g">${loadingHTML}</div></section>`;
  const html = by === 'author'
    ? `<p class="hint">${T.authorHint}</p>` + await mergedHTML([loadHouse().then(list => list.filter(m => houseMatches(m, q, by)))])
    : await mergedHTML([
      loadHouse().then(list => list.filter(m => houseMatches(m, q, by))),
      by === 'ing' ? mdbByIngredients(q) : api('search.php?s=' + encodeURIComponent(q)).then(d => d.meals || []),
    ]);
  const el = $('#results .g'); if (el) el.innerHTML = html;
}

/* "chicken, garlic" → recipes that use ALL the ingredients.
   Supporter key: one request. Free key: one request per ingredient, then keep the recipes found in every list. */
const ingWords = q => q.toLowerCase().split(/\s*(?:,|\+|&|\band\b)\s*/).map(w => w.trim()).filter(Boolean);
async function mdbByIngredients(q) {
  const words = [...new Set(ingWords(q).map(w => w.replace(/\s+/g, '_')))].slice(0, 5);
  if (!words.length) return [];
  if (PREMIUM || words.length === 1) {
    const d = await api('filter.php?i=' + words.map(encodeURIComponent).join(','));
    return d.meals || [];
  }
  const lists = await Promise.all(words.map(w => api('filter.php?i=' + encodeURIComponent(w)).then(d => d.meals || [])));
  return lists.reduce((acc, list) => { const ids = new Set(list.map(m => m.idMeal)); return acc.filter(m => ids.has(m.idMeal)); });
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
      <a class="feature" href="${mealHref(m.idMeal)}">
        ${picHTML(thumb(m.strMealThumb, 'medium'), 'pic', m.strMeal)}
        <div><span class="kicker">${esc(m.strArea || '')} · ${esc(m.strCategory || '')}</span>
        <h3>${esc(m.strMeal)}</h3></div></a>`;
    $('#again').addEventListener('click', () => renderSurprise(true));
  } catch { box.innerHTML = ''; }
}

/* Course categories collect recipes from TheMealDB categories + House recipes */
const COURSES = {
  'first courses': { mdb: ['Pasta'] },
  'second courses': { mdb: ['Beef', 'Chicken', 'Lamb', 'Pork', 'Seafood', 'Goat'] },
};
async function viewBrowse(kind, value) {
  view.innerHTML = `
    <h1 style="margin:6px 0 4px">${esc(value)}</h1>
    <div id="list">${loadingHTML}</div>
    ${creditsHTML()}`;
  const course = kind === 'c' && COURSES[value.toLowerCase()];
  const html = await mergedHTML(course ? [
    loadHouse().then(list => list.filter(m => houseInBrowse(m, kind, value))),
    ...course.mdb.map(c => api('filter.php?c=' + encodeURIComponent(c)).then(d => d.meals || [])),
  ] : [
    loadHouse().then(list => list.filter(m => houseInBrowse(m, kind, value))),
    api(`filter.php?${kind}=${encodeURIComponent(value)}`).then(d => d.meals || []),
  ]);
  const el = $('#list'); if (el) el.innerHTML = html;
}

/* Settings: default servings + units. Stored on this phone only. */
function viewSettings() {
  const sv = [0, 1, 2, 3, 4, 5, 6, 8];
  view.innerHTML = `
    <h1 style="margin:6px 0 14px">${T.settings}</h1>
    <div class="box"><h2>${T.defServ}</h2>
      <div class="opts set-opts" role="group" aria-label="${T.defServ}">
        ${sv.map(n => `<button type="button" data-def="${n}" aria-pressed="${defServings === n}">${n ? n : T.asRecipe}</button>`).join('')}
      </div><p class="hint">${T.defServHint}</p></div>
    <div class="box"><h2>${T.defUnits}</h2>
      <div class="opts set-opts" role="group" aria-label="${T.defUnits}">
        ${[['orig', T.uOrig], ['metric', T.uMetric], ['us', T.uUS]].map(([k, l]) => `<button type="button" data-units="${k}" aria-pressed="${units === k}">${l}</button>`).join('')}
      </div><p class="hint">${T.unitsHint}</p></div>
    <div class="box"><h2>${T.about}</h2><p class="hint" style="font-size:1rem">${T.aboutText}</p>
      ${CONTACT_EMAIL ? `<p class="hint" style="font-size:1rem">✉️ <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a></p>` : ''}</div>
    ${creditsHTML()}`;
  $$('[data-def]').forEach(b => b.addEventListener('click', () => {
    defServings = +b.dataset.def; store('er.servings', defServings);
    recipeState.forEach(st => { st.serv = null; });
    $$('[data-def]').forEach(x => x.setAttribute('aria-pressed', x === b));
    toast(defServings ? `Recipes now open for ${defServings}` : 'Recipes open as written');
  }));
  $$('[data-units]').forEach(b => b.addEventListener('click', () => {
    units = b.dataset.units; store('er.units', units);
    $$('[data-units]').forEach(x => x.setAttribute('aria-pressed', x === b));
  }));
}

/* House recipes screen */
async function viewHouse() {
  view.innerHTML = `<h1 style="margin:6px 0 4px">${T.house}</h1><p class="hint" style="margin:0 0 14px">${T.houseHint}</p><div id="hlist">${loadingHTML}</div>${shareHTML()}${creditsHTML()}`;
  const list = await loadHouse();
  const el = $('#hlist'); if (!el) return;
  el.innerHTML = list.length ? `<div class="grid">${list.map(cardHTML).join('')}</div>` : emptyHTML(T.noResults);
}

/* ============================================================
   MORE RECIPE SOURCES
   - House recipes: Cooklang files in /my-recipes. Only the developer
     adds them (by uploading files to GitHub) — users can't write here.
   Every source is turned into the same "meal" shape used by TheMealDB.
   (Wikibooks Cookbook recipes were removed in Oct 2026; old saved copies
   — ids starting with "wb:" — still open from "My cookbook".)
   ============================================================ */
const isWB = id => String(id).startsWith('wb:');
const isHouse = id => String(id).startsWith('my:');
const mealHref = (id, page = 'meal') => `#/${page}/${encodeURIComponent(id)}`;

/* ---------- Photos, or a cosy placeholder when there's none ---------- */
const PH_COLORS = ['#FFEAA8', '#F9E0C8', '#DDEFD9', '#FAD6CC'];
const PH_SVG = '<svg viewBox="0 0 64 64" fill="none" stroke="#6B4A2E" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M24 14c-2 3 2 5 0 8M32 11c-2 3 2 5 0 8M40 14c-2 3 2 5 0 8"/>' +
  '<path d="M12 30h40M15 30v14a8 8 0 0 0 8 8h18a8 8 0 0 0 8-8V30"/><path d="M8 34h4M52 34h4"/>' +
  '<path d="M32 42c-3-2.5-5-4-5-6a2.5 2.5 0 0 1 5-1 2.5 2.5 0 0 1 5 1c0 2-2 3.5-5 6z" fill="#E98976" stroke="none"/></svg>';
const phColor = s => PH_COLORS[[...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % PH_COLORS.length];
function picHTML(url, cls, seed, alt = '') {
  if (url) return `<img class="${cls}" src="${esc(url)}" alt="${esc(alt)}" loading="lazy" data-seed="${esc(seed)}" onerror="phFail(this)">`;
  return `<div class="${cls} ph-fallback" style="--ph:${phColor(seed)}" role="presentation">${PH_SVG}</div>`;
}
window.phFail = img => {
  const d = document.createElement('div');
  d.className = img.className + ' ph-fallback';
  d.setAttribute('role', 'presentation');
  d.style.setProperty('--ph', phColor(img.dataset.seed || img.src));
  d.innerHTML = PH_SVG;
  img.replaceWith(d);
};

/* ---------- House recipes (Cooklang, https://cooklang.org) ---------- */
const SHORT_UNIT = /^(g|kg|mg|ml|l|cl|dl|oz|lb)$/i;
function parseCQty(raw) {
  let s = String(raw || '').trim();
  const fixed = s.startsWith('=');
  if (fixed) s = s.slice(1).trim();
  const [qs = '', us = ''] = s.split('%');
  const qty = qs.trim(), unit = us.trim();
  const num = qty ? parseNum(qty) : NaN;
  const measure = qty ? qty + (unit ? (SHORT_UNIT.test(unit) ? '' : ' ') + unit : '') : '';
  return { num, unit, measure, fixed };
}
function addIng(list, name, q) {
  const key = name.toLowerCase();
  const ex = list.find(x => x.name.toLowerCase() === key);
  if (!ex) { list.push({ name, measure: q.measure, num: q.num, unit: q.unit, fixed: q.fixed }); return; }
  if (!q.measure) return;
  if (isFinite(ex.num) && isFinite(q.num) && ex.unit.toLowerCase() === q.unit.toLowerCase() && !ex.fixed && !q.fixed) {
    ex.num += q.num;
    ex.measure = fmtQty(ex.num) + (ex.unit ? (SHORT_UNIT.test(ex.unit) ? '' : ' ') + ex.unit : '');
  } else {
    ex.measure = ex.measure ? ex.measure + ' + ' + q.measure : q.measure;
    ex.num = NaN;
  }
}
function parseCooklang(src, slug) {
  let text = String(src).replace(/\r/g, '').replace(/^﻿/, '');
  const meta = {};
  const fm = text.match(/^---\n([\s\S]*?)\n---[ \t]*\n?/);
  if (fm) {
    fm[1].split('\n').forEach(l => { const m = l.match(/^\s*([\w -]+?)\s*:\s*(.*)$/); if (m) meta[m[1].toLowerCase()] = m[2].trim().replace(/^["']|["']$/g, ''); });
    text = text.slice(fm[0].length);
  }
  text = text.replace(/\[-[\s\S]*?-\]/g, '');
  const notes = [];
  let lastNote = false;
  const lines = text.split('\n').filter(l => {
    const m = l.match(/^>>\s*([\w -]+?)\s*:\s*(.*)$/);
    if (m) { meta[m[1].toLowerCase()] = m[2].trim(); lastNote = false; return false; }
    const n = l.match(/^>(?!>)\s?(.*)$/);   // "> a tip" lines become notes
    if (n) { if (n[1].trim()) notes.push(n[1].trim()); return false; }   // one "> line" = one tip
    lastNote = false;
    return true;
  }).map(l => l.replace(/(^|\s)--\s.*$|^--.*$/, '$1'));
  const paras = lines.join('\n').split(/\n[ \t]*\n/).map(p => p.replace(/\s*\n\s*/g, ' ').trim()).filter(Boolean);
  const TOK = /@([^@#~{}\n]+?)\{([^}]*)\}|@([\p{L}\p{N}_'-]+)|#([^@#~{}\n]+?)\{[^}]*\}|#([\p{L}\p{N}_-]+)|~([^@#~{}\n]*?)\{([^}]*)\}/gu;
  const ingredients = [], steps = [];
  let section = '';
  for (const p of paras) {
    const sec = p.match(/^=+\s*(.*?)\s*=*$/);
    if (sec) { section = sec[1]; continue; }
    const toks = [];
    if (section) { toks.push({ t: 'sec', text: section }); section = ''; }
    let pos = 0, m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(p))) {
      if (m.index > pos) toks.push({ t: 'text', text: p.slice(pos, m.index) });
      if (m[1] !== undefined || m[3] !== undefined) {
        const name = (m[1] ?? m[3]).trim(), q = parseCQty(m[2]);
        toks.push({ t: 'ing', name, measure: q.measure, fixed: q.fixed });
        addIng(ingredients, name, q);
      } else if (m[4] !== undefined || m[5] !== undefined) {
        toks.push({ t: 'text', text: (m[4] ?? m[5]).trim() });
      } else {
        const q = parseCQty(m[7]);
        const sec2 = isFinite(q.num) ? q.num * unitSec(q.unit || 'min') : 0;
        const label = q.measure || (m[6] || '').trim();
        toks.push(sec2 >= 1 ? { t: 'timer', sec: Math.round(sec2), label } : { t: 'text', text: label });
      }
      pos = TOK.lastIndex;
    }
    if (pos < p.length) toks.push({ t: 'text', text: p.slice(pos) });
    steps.push(toks);
  }
  return {
    idMeal: 'my:' + slug, strMeal: meta.title || slug.replace(/[-_]+/g, ' '),
    strMealThumb: meta.image ? (/^https?:\/\//.test(meta.image) ? meta.image : 'my-recipes/' + meta.image.replace(/^\.?\//, '')) : '', strArea: meta.cuisine || '', strCategory: (meta.category || meta.course || '').split(',')[0].trim(),
    _cats: (meta.category || meta.course || '').split(',').map(c => c.trim()).filter(Boolean),
    strTags: meta.tags || '', strSource: meta.source || '', strYoutube: '', strInstructions: '',
    _kind: 'house', _ings: ingredients.map(({ name, measure, fixed }) => ({ name, measure, fixed })), _steps: steps,
    _desc: meta.description || '', _servings: meta.servings || '', _time: meta.time || meta['total time'] || '',
    _notes: notes, _photoBy: meta['photo by'] || '',
    _author: meta.author || '', _authorUrl: /^https:\/\//.test(meta['author url'] || meta.author_url || '') ? (meta['author url'] || meta.author_url) : '',
  };
}
let houseP = null;
function loadHouse() {
  if (!houseP) houseP = (async () => {
    try {
      const idx = await fetch('my-recipes/index.json', { cache: 'no-cache' }).then(r => r.ok ? r.json() : { recipes: [] });
      const files = (idx.recipes || []).filter(f => /^[\w.-]+\.cook$/i.test(f));
      const all = await Promise.all(files.map(f => fetch('my-recipes/' + f, { cache: 'no-cache' })
        .then(r => r.ok ? r.text() : null).then(t => t && parseCooklang(t, f.replace(/\.cook$/i, ''))).catch(() => null)));
      return all.filter(Boolean);
    } catch { return []; }
  })();
  return houseP;
}
function houseInBrowse(meal, kind, value) {
  const v = value.toLowerCase();
  return kind === 'a' ? meal.strArea.toLowerCase() === v : meal._cats.some(c => c.toLowerCase() === v);
}
function houseMatches(meal, q, by) {
  const n = q.toLowerCase();
  if (by === 'ing') return ingWords(q).every(w => meal._ings.some(i => i.name.toLowerCase().includes(w)));
  if (by === 'author') return (meal._author || 'Easy Recipes').toLowerCase().includes(n);
  return [meal.strMeal, meal._cats.join(' '), meal.strArea, meal.strTags].join(' ').toLowerCase().includes(n);
}

/* "Share your recipe" box — only shown when CONTACT_EMAIL is set */
function shareHTML() {
  if (!CONTACT_EMAIL) return '';
  const href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(T.shareSubject)}&body=${encodeURIComponent(T.shareBody)}`;
  return `<div class="share-box">
    <img src="${CHICK.cheer}" alt="" width="62" height="79">
    <div><h3>${T.shareTitle}</h3><p>${T.shareText}</p>
    <a class="btn small" href="${esc(href)}">${T.shareBtn}</a></div></div>`;
}

/* Render a pre-tokenised (Cooklang) step */
function tokensHTML(toks, ctx, stepIdx) {
  let html = '', tIdx = 0;
  for (const k of toks) {
    if (k.t === 'text') html += textOut(k.text);
    else if (k.t === 'sec') html += `<strong class="step-sec">${esc(k.text)}</strong> `;
    else if (k.t === 'ing') {
      const dose = doseOut(k.measure, ctx.mult, k.fixed);
      html += `<span class="ing">${esc(k.name)}</span>` + (dose ? `<span class="dose">${esc(dose)}</span>` : '');
    } else if (k.t === 'timer') {
      html += timerHTML(k.sec, k.label, `${ctx.id}:${stepIdx}:${tIdx++}`, stepIdx + 1);
    }
  }
  return html;
}

/* ============================================================
   UNITS — as written · metric · US
   Metric turns cups, oz, lb, fl oz, pints and °F into ml, g and °C.
   US turns g, kg, ml, l and °C into oz, lb, cups, spoons and °F.
   Teaspoons and tablespoons stay as they are (they're used everywhere).
   ============================================================ */
let units = load('er.units', 'orig');
const U_NUM = '(\\d+\\s+\\d+\\/\\d+|\\d+\\/\\d+|\\d+(?:[.,]\\d+)?\\s*[½¼¾⅓⅔]?|[½¼¾⅓⅔])';
const U_DEF = [
  ['fl\\.?\\s?oz', 'ml', 29.57, true], ['kg|kilograms?|kilos?', 'g', 1000, false], ['mg', 'g', 0.001, false],
  ['g|grams?|gr', 'g', 1, false], ['oz|ounces?', 'g', 28.35, true], ['lbs?|pounds?', 'g', 453.6, true],
  ['ml|millilit(?:er|re)s?', 'ml', 1, false], ['cl', 'ml', 10, false], ['dl', 'ml', 100, false], ['l|lit(?:er|re)s?', 'ml', 1000, false],
  ['cups?', 'ml', 240, true], ['pints?|pt', 'ml', 473, true], ['quarts?|qt', 'ml', 946, true],
  ['tablespoons?|tbsps?|tbs|tbl', 'ml', 15, null], ['teaspoons?|tsps?', 'ml', 5, null],
];
const U_RE = new RegExp(U_NUM + '(?:\\s*(?:-|–|to)\\s*' + U_NUM + ')?\\s*(' + U_DEF.map(d => d[0]).join('|') + ')(?![\\w])\\.?', 'gi');
const unitInfo = u => U_DEF.find(d => new RegExp('^(?:' + d[0] + ')$', 'i').test(u.replace(/\.$/, '')));
const roundM = v => v < 10 ? String(Math.round(v * 10) / 10) : v < 100 ? String(Math.round(v)) : String(Math.round(v / 5) * 5);
function toMetric(a, b, kind) {
  const big = Math.max(a, b || 0) >= 1000;
  const u = kind === 'g' ? (big ? 'kg' : 'g') : (big ? 'l' : 'ml');
  const f = v => big ? String(Math.round(v / 100) / 10) : roundM(v);
  return f(a) + (b ? '–' + f(b) : '') + (u === 'g' || u === 'kg' ? u : ' ' + u);
}
function toUS(a, b, kind) {
  const m = Math.max(a, b || 0);
  let unit, div;
  if (kind === 'g') {
    if (m < 20) return roundM(a) + (b ? '–' + roundM(b) : '') + 'g';
    [unit, div] = m >= 454 ? ['lb', 453.6] : ['oz', 28.35];
  } else [unit, div] = m < 15 ? ['tsp', 5] : m < 60 ? ['tbsp', 15] : ['cup', 240];
  const q = v => fmtQty(v / div);
  const plural = unit === 'cup' && m / div > 1.05 ? 'cups' : unit;
  return q(a) + (b ? '–' + q(b) : '') + ' ' + plural;
}
function convertUnits(str) {
  if (units === 'orig' || !str) return str;
  return String(str).replace(U_RE, (all, a, b, u) => {
    const info = unitInfo(u); if (!info) return all;
    const [, kind, factor, isUS] = info;
    if (isUS === null) return all;                                   // spoons stay spoons everywhere
    if (units === 'metric' && !isUS) return all;
    if (units === 'us' && isUS) return all;
    const na = parseNum(a), nb = b ? parseNum(b) : NaN;
    if (!isFinite(na)) return all;
    return units === 'metric' ? toMetric(na * factor, isFinite(nb) ? nb * factor : 0, kind)
      : toUS(na * factor, isFinite(nb) ? nb * factor : 0, kind);
  });
}
function convertTemps(s) {
  if (units === 'orig') return s;
  return String(s).replace(/(\d{2,3})(?:\s*(?:-|–|to)\s*(\d{2,3}))?\s*°\s*([CF])(?![a-z])/gi, (all, a, b, u) => {
    u = u.toUpperCase();
    if (units === 'us' && u === 'C') { const f = v => Math.round((v * 9 / 5 + 32) / 5) * 5; return f(+a) + (b ? '–' + f(+b) : '') + '°F'; }
    if (units === 'metric' && u === 'F') { const c = v => Math.round((v - 32) * 5 / 9 / 5) * 5; return c(+a) + (b ? '–' + c(+b) : '') + '°C'; }
    return all;
  });
}
const textOut = s => esc(convertTemps(convertUnits(s)));
const doseOut = (measure, mult, fixed) => convertUnits(fixed ? measure : scaleMeasure(measure, mult));

/* ---------- Timer chips: short ones ring in the app, long ones say when to come back ---------- */
const LONG_TIMER = 15 * 60;
const clockAt = sec => new Date(Date.now() + sec * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
function timerHTML(sec, label, key, step) {
  const running = timers_.some(t => t.key === key) ? ' running' : '';
  if (sec > LONG_TIMER) {
    return `<button type="button" class="tbtn long${running}" data-timer="${sec}" data-long="1" data-key="${esc(key)}" data-step="${step}" aria-label="${esc(label)}: come back at ${clockAt(sec)}">${esc(label)}<span class="back-at">${T.backAt} <b data-at="${sec}">${clockAt(sec)}</b></span></button>`;
  }
  return `<button type="button" class="tbtn${running}" data-timer="${sec}" data-key="${esc(key)}" data-step="${step}" aria-label="Start timer: ${esc(label)}">${esc(label)}</button>`;
}
setInterval(() => $$('[data-at]').forEach(b => { b.textContent = clockAt(+b.dataset.at); }), 20000);

/* Per-recipe state kept while the app is open */
const recipeState = new Map(); // id -> { mult, checked:Set, done:Set }
const getState = id => { if (!recipeState.has(id)) recipeState.set(id, { serv: null, checked: new Set(), done: new Set() }); return recipeState.get(id); };
let defServings = load('er.servings', 0);   // 0 = as in the recipe
/* How many people the original recipe serves (TheMealDB doesn't say → assume 4) */
function baseServings(meal) {
  const m = String(meal._servings || '').match(/\d+/);
  return m && +m[0] > 0 ? { n: +m[0], known: true } : { n: 4, known: false };
}
function servingsFor(meal) {
  const st = getState(meal.idMeal), base = baseServings(meal);
  if (!st.serv) st.serv = defServings || base.n;
  return { serv: st.serv, base, mult: st.serv / base.n };
}

async function getMeal(id) {
  if (saved[id]) return saved[id].meal; // works offline
  if (isHouse(id)) return (await loadHouse()).find(m => m.idMeal === id);
  if (isWB(id)) return null; // Wikibooks is gone: only saved copies (above) still open
  const data = await api('lookup.php?i=' + encodeURIComponent(id));
  return data.meals && data.meals[0];
}
function makeCtx(meal) {
  const ings = getIngredients(meal);
  const steps = Array.isArray(meal._steps) ? meal._steps : splitSteps(meal.strInstructions);
  const sv = servingsFor(meal);
  return { id: meal.idMeal, ings, matchers: buildMatchers(ings), steps, mult: sv.mult, serv: sv.serv };
}

async function viewMeal(id) {
  view.innerHTML = loadingHTML;
  let meal;
  try { meal = await getMeal(id); } catch { view.innerHTML = emptyHTML(T.offline); return; }
  if (!meal) { view.innerHTML = emptyHTML(T.noResults); return; }
  const st = getState(id);
  const tags = (meal.strTags || '').split(',').map(s => s.trim()).filter(Boolean).slice(0, 3);

  view.innerHTML = `
    <div class="meal-layout"><div class="meal-side">
    <div class="hero${meal.strMealThumb ? '' : ' no-photo'}">
      ${picHTML(meal.strMealThumb || '', 'hero-pic', meal.strMeal, meal.strMeal)}
      <div class="top-actions">
        <span></span>
        <button class="icon-btn" type="button" id="save" aria-pressed="${isSaved(id)}" aria-label="${T.save}">${isSaved(id) ? ICON.heartFull : ICON.heart}</button>
      </div>
    </div>
    ${meal._kind ? '' : `<p class="photo-credit">${T.photoBy}</p>`}
    <h1 class="recipe-title">${esc(meal.strMeal)}</h1>
    <div class="tags">
      ${meal.strArea && meal.strArea !== 'Unknown' ? `<span class="tag">${esc(meal.strArea)}</span>` : ''}
      ${(meal._cats || (meal.strCategory ? [meal.strCategory] : [])).map(c => `<span class="tag p">${esc(c)}</span>`).join('')}
      ${tags.map(t => `<span class="tag o">${esc(t)}</span>`).join('')}
      ${meal._time ? `<span class="tag y">⏱ ${esc(meal._time)}</span>` : ''}
    </div>
    ${meal._desc ? `<p class="recipe-desc">${esc(meal._desc)}</p>` : ''}

    <a class="btn block" style="margin-top:16px" href="${mealHref(id, 'cook')}">${ICON.chef} ${T.startCooking}</a>

    <div class="box">
      <div class="batch"><h2>${T.batch}</h2>
        <div class="stepper" role="group" aria-label="${T.batch}">
          <button type="button" data-serv="-1" aria-label="One serving less">−</button>
          <output id="servN" aria-live="polite">${servingsFor(meal).serv}</output>
          <button type="button" data-serv="1" aria-label="One serving more">+</button>
        </div></div>
      <p class="hint">${baseServings(meal).known ? T.servHintKnown(baseServings(meal).n, defServings) : T.servHintGuess(defServings)} ${T.batchHint}</p>
      <div class="batch units-row"><h2>${T.units}</h2>
        <div class="opts" role="group" aria-label="${T.units}">
          ${[['orig', T.uOrig], ['metric', T.uMetric], ['us', T.uUS]].map(([k, l]) => `<button type="button" data-units="${k}" aria-pressed="${units === k}">${l}</button>`).join('')}
        </div></div>
      <p class="hint">${T.unitsHint}</p>
    </div>

    <div class="box"><h2>${T.ingredients}</h2><ul class="ing-list${meal._kind ? ' noimg' : ''}" id="ings"></ul></div>
    </div><div class="meal-main">
    <div class="box"><h2>${T.steps}</h2><ol class="steps" id="steps"></ol></div>
    ${meal._notes && meal._notes.length ? `<div class="box tips"><h2>${T.tips}</h2><ul>${meal._notes.map(n => `<li>${esc(n)}</li>`).join('')}</ul></div>` : ''}
    <div id="notebox"></div>
    <div class="links">
      ${meal.strSource ? `<a class="btn green small" href="${esc(meal.strSource)}" target="_blank" rel="noopener noreferrer">${ICON.link} ${isWB(id) ? T.wbOpen : T.original}</a>` : ''}
      ${meal.strYoutube ? `<a class="btn pink small" href="${esc(meal.strYoutube)}" target="_blank" rel="noopener noreferrer">${ICON.video} ${T.video}</a>` : ''}
    </div>
    ${!meal._kind ? `<p class="src-credit">${T.srcMealDB}</p>` : ''}
    ${isHouse(id) ? `<p class="src-credit house">${!meal._author || meal._author === 'Easy Recipes' ? T.srcHouseOwn
      : T.srcHouseBy(meal._authorUrl ? `<a href="${esc(meal._authorUrl)}" target="_blank" rel="noopener noreferrer nofollow">${esc(meal._author)}</a>` : `<strong>${esc(meal._author)}</strong>`)}${meal._photoBy && meal.strMealThumb ? ` · Photo: ${esc(meal._photoBy)}` : ''}</p>` : ''}
    ${isWB(id) ? `<p class="wb-credit">${T.wbCredit(`<a href="${esc(meal.strSource)}" target="_blank" rel="noopener noreferrer">“${esc(meal.strMeal)}”</a>`, `<a href="${esc(meal.strSource)}?action=history" target="_blank" rel="noopener noreferrer">${T.wbHistory}</a>`)}</p>` : ''}
    </div></div>
    ${creditsHTML()}`;

  const render = () => {
    const ctx = makeCtx(meal);
    $('#ings').innerHTML = ctx.ings.map((ing, i) => `
      <li><label>
        <input type="checkbox" data-i="${i}" ${st.checked.has(i) ? 'checked' : ''}>
        ${meal._kind ? '' : `<img src="${ING_IMG + encodeURIComponent(ing.name.replace(/ /g, '_'))}-small.png" alt="" loading="lazy" onerror="this.style.visibility='hidden'">`}
        <span><span class="name">${esc(ing.name)}</span>${ing.note ? `<span class="inote">${esc(ing.note)}</span>` : ''}${ing.measure ? `<span class="qty">${esc(doseOut(ing.measure, ctx.mult, ing.fixed))}</span>` : ''}</span>
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
  if (meal._empty) $('#steps').innerHTML = '';

  $('#save').addEventListener('click', e => {
    toggleSave(meal);
    const b = e.currentTarget; b.innerHTML = isSaved(id) ? ICON.heartFull : ICON.heart; b.setAttribute('aria-pressed', isSaved(id));
    renderNote();
  });
  $$('[data-units]').forEach(b => b.addEventListener('click', () => {
    units = b.dataset.units; store('er.units', units);
    $$('[data-units]').forEach(x => x.setAttribute('aria-pressed', x === b));
    render();
  }));
  $$('[data-serv]').forEach(b => b.addEventListener('click', () => {
    st.serv = Math.min(30, Math.max(1, servingsFor(meal).serv + +b.dataset.serv));
    $('#servN').textContent = st.serv;
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
    startTimer(+b.dataset.timer, `${T.step} ${b.dataset.step} · ${short}`, b.dataset.key, !!b.dataset.long);
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
          <span class="kicker">${T.step} ${i + 1} ${T.of} ${ctx.steps.length}${` · ${ctx.serv} ${ctx.serv === 1 ? 'serving' : 'servings'}`}</span>
          ${stepHTML(ctx.steps[i], ctx, i)}
        </div>
        <div class="cook-nav">
          <button class="btn soft" type="button" id="prev" ${i === 0 ? 'disabled style="opacity:.45"' : ''}>${T.prev}</button>
          <button class="btn ${last ? 'green' : ''}" type="button" id="next">${last ? T.finish : T.next}</button>
        </div>
        ${'wakeLock' in navigator ? `<p class="awake">☀︎ ${T.awake}</p>` : ''}
      </div>`;
    $('#exit').addEventListener('click', () => { location.hash = mealHref(id); });
    $('#prev').addEventListener('click', () => { if (i > 0) { i--; draw(); } });
    $('#next').addEventListener('click', () => {
      st.done.add(i);
      if (last) { location.hash = mealHref(id, 'done'); return; }
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
      <a class="list-item" href="${mealHref(meal.idMeal)}">
        ${picHTML(thumbOf(meal, 'small'), 'pic', meal.strMeal)}
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
          <a class="btn soft" href="${mealHref(id)}">${T.doneBack}</a>
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
  document.body.classList.toggle('cooking', parts[0] === 'cook');
  $('#hdr-back').hidden = !parts[0];
  navDepth++;
  document.body.classList.toggle('page-meal', parts[0] === 'meal');
  document.body.classList.toggle('page-done', parts[0] === 'done');
  const tab = parts[0] === 'saved' ? 'saved' : parts[0] === 'settings' ? 'settings' : 'explore';
  $$('.tabbar a').forEach(a => a.dataset.tab === tab ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const fresh = view.cloneNode(false); view.replaceWith(fresh); // drop old listeners
  view = fresh;
  if (parts[0] === 'meal' && parts[1]) viewMeal(parts[1]);
  else if (parts[0] === 'cook' && parts[1]) viewCook(parts[1], parts[2]);
  else if (parts[0] === 'browse' && parts[2]) viewBrowse(parts[1] === 'a' ? 'a' : 'c', parts[2]);
  else if (parts[0] === 'done' && parts[1]) viewDone(parts[1]);
  else if (parts[0] === 'saved') viewSaved();
  else if (parts[0] === 'house') viewHouse();
  else if (parts[0] === 'settings') viewSettings();
  else viewHome(params);
  if (parts[0] !== 'cook') window.scrollTo(0, 0);
}
window.addEventListener('hashchange', route);
let navDepth = 0;
$('#hdr-back').addEventListener('click', () => { if (navDepth > 1) history.back(); else location.hash = '#/'; });

/* ---------- Boot ---------- */
renderDock(); tick();
showWelcome();
route();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').then(r => r.update()).catch(() => {}));
  // when a new version of the app takes over, reload once so it shows straight away
  let reloaded = false;
  if (navigator.serviceWorker.controller) navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (reloaded) return; reloaded = true; location.reload();
  });
}
