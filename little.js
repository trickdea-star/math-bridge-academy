/* Math Bridge Academy - Little Learners (ages 2-4): numbers, colors and the ABCs.
   Voice-first, big buttons, no losing: a wrong tap wiggles and says "Try again". */
'use strict';
(function(){
  const App = window.MBA;
  const { $, $$, rand, pick, shuffle, store, sfx, say, hush, ICON } = App;
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const TOTAL = 5;

  const COLORS = [
    { name: 'red', hex: '#E53935' }, { name: 'blue', hex: '#1E88E5' }, { name: 'yellow', hex: '#FDD835' }, { name: 'green', hex: '#43A047' },
    { name: 'orange', hex: '#FB8C00' }, { name: 'purple', hex: '#8E24AA' }, { name: 'pink', hex: '#F06292' }, { name: 'brown', hex: '#8D6E63' },
    { name: 'black', hex: '#263238' }, { name: 'white', hex: '#FFFFFF' }
  ];
  const LETTERS = [
    ['A', 'apple', '\u{1f34e}'], ['B', 'ball', '\u26bd'], ['C', 'cat', '\u{1f431}'], ['D', 'dog', '\u{1f436}'], ['E', 'egg', '\u{1f95a}'], ['F', 'fish', '\u{1f41f}'], ['G', 'grapes', '\u{1f347}'],
    ['H', 'hat', '\u{1f3a9}'], ['I', 'ice cream', '\u{1f366}'], ['J', 'juice', '\u{1f9c3}'], ['K', 'kite', '\u{1fa81}'], ['L', 'lion', '\u{1f981}'], ['M', 'moon', '\u{1f319}'], ['N', 'nose', '\u{1f443}'],
    ['O', 'orange', '\u{1f34a}'], ['P', 'pig', '\u{1f437}'], ['Q', 'queen', '\u{1f478}'], ['R', 'rainbow', '\u{1f308}'], ['S', 'sun', '\u{1f31e}'], ['T', 'tree', '\u{1f333}'], ['U', 'umbrella', '\u2602'],
    ['V', 'violin', '\u{1f3bb}'], ['W', 'whale', '\u{1f433}'], ['X', 'fox', '\u{1f98a}'], ['Y', 'yo-yo', '\u{1fa80}'], ['Z', 'zebra', '\u{1f993}']
  ].map(([L, word, pic]) => ({ L, word, pic }));
  // How a speech voice should say each letter's name (a lone "A" is often read as "uh").
  const NAMES = { A: 'ay', B: 'bee', C: 'see', D: 'dee', E: 'ee', F: 'eff', G: 'jee', H: 'aitch', I: 'eye', J: 'jay', K: 'kay', L: 'el', M: 'em',
    N: 'en', O: 'oh', P: 'pee', Q: 'cue', R: 'are', S: 'ess', T: 'tee', U: 'you', V: 'vee', W: 'double you', X: 'ex', Y: 'why', Z: 'zee' };
  const THINGS = [['duck', 'ducks', '\u{1f424}'], ['apple', 'apples', '\u{1f34e}'], ['star', 'stars', '\u2b50'], ['fish', 'fish', '\u{1f41f}'], ['balloon', 'balloons', '\u{1f388}'],
    ['strawberry', 'strawberries', '\u{1f353}'], ['car', 'cars', '\u{1f697}'], ['ladybug', 'ladybugs', '\u{1f41e}'], ['frog', 'frogs', '\u{1f438}'], ['flower', 'flowers', '\u{1f33c}']]
    .map(([one, plural, pic]) => ({ one, plural, pic }));
  const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const YAY = ['Yay!', 'Great job!', 'You did it!', 'Super!', 'Hooray!', 'Wow!'];
  const letterLine = l => l.L === 'X' ? 'fo<u>x</u> ends with X' : `${l.L} is for ${l.word}`;
  const letterSay = l => l.L === 'X' ? `${NAMES.X}. Fox ends with ${NAMES.X}.` : `${NAMES[l.L]}. ${NAMES[l.L]} is for ${l.word}.`;

  /* ---------- level: 1 = age 2, 2 = age 3, 3 = age 4; a perfect game moves up, a hard one moves down ---------- */
  const startLevel = age => (age || 4) <= 2 ? 1 : age === 3 ? 2 : 3;
  function levels(){ return Object.assign({ numbers: startLevel(App.profile().age), colors: startLevel(App.profile().age), letters: startLevel(App.profile().age), games: 0 }, store.get('little', {})); }

  /* ---------- pictures ---------- */
  function balloon(c){
    return `<svg class="lt-balloon" viewBox="0 0 100 150" aria-hidden="true"><path class="lt-string" d="M50 100 Q42 120 52 146"/>`
      + `<path class="lt-bal" d="M44 97 L56 97 L50 106 Z" style="fill:${c.hex}"/><ellipse class="lt-bal" cx="50" cy="52" rx="40" ry="46" style="fill:${c.hex}"/>`
      + `<ellipse class="lt-shine" cx="35" cy="34" rx="9" ry="15"/></svg>`;
  }
  const numTile = (v, pips) => `<span class="lt-num">${v}</span>${pips ? `<span class="lt-pips">${'<i></i>'.repeat(v)}</span>` : ''}`;
  const pickOthers = (pool, target, n) => shuffle([target].concat(shuffle(pool.filter(x => x !== target)).slice(0, n - 1)));

  /* ---------- one round of each game ---------- */
  function colorRound(L){
    const pool = COLORS.slice(0, [4, 6, 10][L - 1]), target = pick(pool), opts = pickOthers(pool, target, L + 1);
    const match = L === 1;  // age 2: match the color you see; older: find the color you hear
    return {
      kind: 'pick', cls: 'balloons',
      prompt: match ? `<div class="lt-ask"><span class="lt-swatch" style="background:${target.hex}"></span><b>Find ${target.name}!</b></div>`
                    : `<div class="lt-ask"><b>Tap the ${target.name} balloon!</b></div>`,
      say: match ? `Find ${target.name}! Where is ${target.name}?` : `Tap the ${target.name} balloon!`,
      choices: opts.map(c => ({ html: balloon(c) + `<span class="sr">${c.name}</span>`, ok: c === target })),
      praise: `${pick(YAY)} That's ${target.name}!`
    };
  }
  function numberRound(L){
    const max = [3, 5, 10][L - 1], target = rand(1, max), opts = pickOthers(range(1, max), target, L + 1);
    if(L >= 2 && Math.random() < 0.4){
      return { kind: 'pick', cls: 'nums', prompt: `<div class="lt-ask"><b>Find the number ${target}!</b></div>`, say: `Find the number ${WORDS[target]}!`,
        choices: opts.map(v => ({ html: numTile(v, false), ok: v === target })), praise: `${pick(YAY)} That's ${WORDS[target]}!` };
    }
    const thing = pick(THINGS), name = target === 1 ? thing.one : thing.plural;
    return { kind: 'count', cls: 'nums', n: target, thing,
      prompt: `<div class="lt-ask"><b>Let's count the ${thing.plural}!</b><small>Tap each one</small></div>`, say: `Let's count the ${thing.plural}! Tap each one.`,
      askAfter: `How many ${thing.plural}?`,
      choices: opts.map(v => ({ html: numTile(v, L < 3), ok: v === target })), praise: `${pick(YAY)} ${WORDS[target]} ${name}!` };
  }
  function letterRound(L){
    const pool = LETTERS.slice(0, [8, 16, 26][L - 1]), target = pick(pool), opts = pickOthers(pool, target, L + 1);
    const lower = L === 3 && Math.random() < 0.3, show = x => lower ? x.L.toLowerCase() : x.L;
    const prompt = L === 1 ? `<div class="lt-ask"><span class="lt-big">${target.L}</span><b>Find ${target.L}!</b></div>`
      : L === 2 ? `<div class="lt-ask"><b>Find the letter ${target.L}!</b></div>`
      : `<div class="lt-ask"><b>${lower ? 'Find the little letter you hear!' : 'Find the letter you hear!'}</b><small>Tap the speaker to hear it again</small></div>`;
    return { kind: 'pick', cls: 'letters', prompt,
      say: `${lower ? 'Find the little' : 'Find the letter'} ${NAMES[target.L]}!`,
      choices: opts.map(x => ({ html: `<span class="lt-letter">${show(x)}</span>`, ok: x === target })),
      praise: `${pick(YAY)} ${letterSay(target)}`,
      reward: `<span class="lt-pic">${target.pic}</span><b>${letterLine(target)}</b>` };
  }

  /* ---------- the game loop ---------- */
  const G = { topic: 'colors', round: 0, first: true, perfect: 0, misses: 0, missThis: 0, busy: true, cur: null, counted: 0, taps: 0 };
  const el = {}, timers = [];
  const later = (f, ms) => { timers.push(setTimeout(f, ms)); };
  const clearLater = () => { timers.forEach(clearTimeout); timers.length = 0; };
  function showPane(id){ ['ltPick', 'ltGame', 'ltExplore', 'ltDone'].forEach(k => { el[k].hidden = k !== id; }); soundHint(); window.scrollTo(0, 0); }
  function soundHint(){ el.ltSound.hidden = App.canSpeak(); }

  function startGame(topic){
    clearLater(); hush();
    Object.assign(G, { topic, round: 0, perfect: 0, misses: 0 });
    el.ltGame.className = 'lt-' + topic;
    showPane('ltGame');
    nextRound();
  }
  function nextRound(){
    Object.assign(G, { round: G.round + 1, first: true, busy: false, counted: 0, missThis: 0 });
    const L = levels()[G.topic];
    const r = G.cur = G.topic === 'colors' ? colorRound(L) : G.topic === 'numbers' ? numberRound(L) : letterRound(L);
    el.ltDots.innerHTML = range(1, TOTAL).map(i => `<i class="${i < G.round ? 'got' : i === G.round ? 'now' : ''}"></i>`).join('');
    el.ltDots.setAttribute('aria-label', `Round ${G.round} of ${TOTAL}`);
    el.ltPrompt.innerHTML = r.prompt;
    if(r.kind === 'count'){
      el.ltPlay.innerHTML = `<div class="lt-tray">${range(1, r.n).map(i => `<button class="lt-thing" aria-label="${r.thing.one} ${i}"><span class="lt-emoji" aria-hidden="true">${r.thing.pic}</span><b class="lt-badge"></b></button>`).join('')}</div>`;
      el.ltChoices.innerHTML = ''; el.ltChoices.hidden = true;
    } else {
      el.ltPlay.innerHTML = '';
      renderChoices(r);
    }
    say(r.say);
  }
  function renderChoices(r){
    el.ltChoices.hidden = false;
    el.ltChoices.className = 'lt-choices ' + r.cls + ' n' + r.choices.length;
    el.ltChoices.innerHTML = r.choices.map((c, i) => `<button class="lt-choice" data-i="${i}">${c.html}</button>`).join('');
  }
  function countTap(btn){
    if(G.busy || btn.classList.contains('done')) return;
    G.counted++;
    btn.classList.add('done');
    btn.querySelector('.lt-badge').textContent = G.counted;
    sfx.count(G.counted);
    say(WORDS[G.counted]);
    if(G.counted === G.cur.n){
      G.busy = true;
      later(() => { el.ltPrompt.innerHTML = `<div class="lt-ask"><b>${G.cur.askAfter}</b></div>`; renderChoices(G.cur); G.busy = false; say(G.cur.askAfter); }, 900);
    }
  }
  function choose(btn){
    if(G.busy) return;
    const c = G.cur.choices[Number(btn.dataset.i)];
    if(c.ok){
      G.busy = true;
      if(G.first) G.perfect++;
      btn.classList.add('yay'); sfx.good(); App.confetti(30);
      if(G.cur.reward) el.ltPlay.innerHTML = `<div class="lt-reward">${G.cur.reward}</div>`;
      say(G.cur.praise);
      later(() => { if(G.round < TOTAL) nextRound(); else finish(); }, G.cur.reward ? 2800 : 2000);
      return;
    }
    G.first = false; G.misses++; G.missThis++;
    btn.classList.remove('nope'); void btn.offsetWidth; btn.classList.add('nope');
    sfx.oops(); say('Try again!');
    if(G.missThis >= 2){ const i = G.cur.choices.findIndex(x => x.ok); const right = el.ltChoices.children[i]; if(right) right.classList.add('glow'); }
  }
  function finish(){
    const l = levels(), before = l[G.topic];
    l.games = (l.games || 0) + 1;
    if(G.perfect === TOTAL) l[G.topic] = Math.min(3, before + 1);
    else if(G.misses >= 5) l[G.topic] = Math.max(1, before - 1);
    store.set('little', l);
    const note = l[G.topic] > before ? ' Next time it gets a little harder.' : l[G.topic] < before ? ' Next time it gets a little easier.' : '';
    App.addStars(1); sfx.win(); App.confetti(80);
    App.finishTask('little', G.topic + '-play', true);
    el.ltDone.innerHTML = `<div class="panel result lt-result"><div class="lt-trophy">${ICON.star}</div><h3>You did it!</h3><p>You found ${G.perfect} of ${TOTAL} on the first try and earned a star.${note}</p>`
      + `<div class="row"><button class="btn primary big" data-lt="again">Play again</button><button class="btn big" data-lt="pick">Pick a game</button>${App.courseBtn()}</div></div>`;
    showPane('ltDone');
    say(`${pick(YAY)} You earned a star!`);
  }

  /* ---------- explore: tap anything to see it and hear it ---------- */
  function startExplore(topic){
    clearLater(); hush();
    Object.assign(G, { topic, taps: 0 });
    el.ltExplore.className = 'lt-' + topic;
    const what = topic === 'numbers' ? 'number' : topic === 'colors' ? 'color' : 'letter';
    el.ltShow.innerHTML = `<div class="lt-show-hint">Tap any ${what}!</div>`;
    el.ltGrid.className = 'lt-grid ' + topic;
    el.ltGrid.innerHTML = topic === 'letters' ? LETTERS.map((x, i) => `<button class="lt-cell" data-x="${i}" aria-label="${x.L}"><b>${x.L}</b><small>${x.L.toLowerCase()}</small></button>`).join('')
      : topic === 'numbers' ? range(1, 10).map(v => `<button class="lt-cell" data-x="${v}"><b>${v}</b></button>`).join('')
      : COLORS.map((c, i) => `<button class="lt-cell" data-x="${i}" aria-label="${c.name}"><span class="lt-blob" style="background:${c.hex}"></span></button>`).join('');
    showPane('ltExplore');
    say(`Tap any ${what}!`);
  }
  function exploreTap(btn){
    const x = Number(btn.dataset.x);
    G.taps++;
    sfx.pop();
    if(G.topic === 'letters'){
      const l = LETTERS[x];
      el.ltShow.innerHTML = `<div class="lt-show"><span class="lt-big">${l.L}<small>${l.L.toLowerCase()}</small></span><span class="lt-pic">${l.pic}</span><b>${letterLine(l)}</b></div>`;
      say(letterSay(l));
    } else if(G.topic === 'numbers'){
      const t = THINGS[(x - 1) % THINGS.length];
      el.ltShow.innerHTML = `<div class="lt-show"><span class="lt-big">${x}</span><span class="lt-row">${Array(x).fill(t.pic).join(' ')}</span><b>${WORDS[x]}</b></div>`;
      say(`${WORDS[x]}! ${range(1, x).map(v => WORDS[v]).join(', ')}.`);
    } else {
      const c = COLORS[x];
      el.ltShow.innerHTML = `<div class="lt-show">${balloon(c)}<b>${c.name}</b></div>`;
      say(`${c.name}!`);
    }
    btn.classList.remove('tapped'); void btn.offsetWidth; btn.classList.add('tapped');
    if(G.taps === 5) App.finishTask('little', G.topic + '-explore', true);
  }

  /* ---------- the picker ---------- */
  const TOPICS = [
    { id: 'numbers', name: 'Numbers', art: '1 2 3', blurb: 'Count things and find numbers' },
    { id: 'colors', name: 'Colors', art: '', blurb: 'Pop the right balloon' },
    { id: 'letters', name: 'ABC', art: 'A B C', blurb: 'Find letters and hear their words' }
  ];
  function renderPick(){
    const p = App.profile();
    el.ltHello.textContent = p.guest ? 'Pick a game. The voice tells you what to do.' : `Hi, ${p.name}! Pick a game. The voice tells you what to do.`;
    el.ltTopics.innerHTML = TOPICS.map(t => `<div class="lt-topic lt-${t.id}"><button class="lt-topic-play" data-play="${t.id}">`
      + `<span class="lt-art" aria-hidden="true">${t.id === 'colors' ? ['#E53935', '#FDD835', '#1E88E5'].map(h => `<i style="background:${h}"></i>`).join('') : t.art}</span>`
      + `<b>${t.name}</b><small>${t.blurb}</small></button><button class="btn small lt-explore-btn" data-explore="${t.id}">Tap and hear</button></div>`).join('');
  }

  function init(){
    ['ltPick', 'ltGame', 'ltExplore', 'ltDone', 'ltTopics', 'ltHello', 'ltSound', 'ltDots', 'ltHear', 'ltPrompt', 'ltPlay', 'ltChoices', 'ltShow', 'ltGrid']
      .forEach(id => { el[id] = $('#' + id); });
    el.ltHear.innerHTML = ICON.sound;
    el.ltTopics.addEventListener('click', e => {
      const p = e.target.closest('[data-play]'); if(p){ sfx.tap(); startGame(p.dataset.play); return; }
      const x = e.target.closest('[data-explore]'); if(x){ sfx.tap(); startExplore(x.dataset.explore); }
    });
    el.ltPlay.addEventListener('click', e => { const b = e.target.closest('.lt-thing'); if(b) countTap(b); });
    el.ltChoices.addEventListener('click', e => { const b = e.target.closest('.lt-choice'); if(b) choose(b); });
    el.ltGrid.addEventListener('click', e => { const b = e.target.closest('.lt-cell'); if(b) exploreTap(b); });
    el.ltHear.addEventListener('click', () => { const r = G.cur; if(r) say(r.kind === 'count' && G.counted >= r.n ? r.askAfter : r.say); });
    $$('[data-lt-back]').forEach(b => b.addEventListener('click', () => { clearLater(); hush(); renderPick(); showPane('ltPick'); }));
    el.ltDone.addEventListener('click', e => {
      const b = e.target.closest('[data-lt]'); if(!b) return;
      if(b.dataset.lt === 'again') startGame(G.topic); else { renderPick(); showPane('ltPick'); }
    });
    App.on('little', { enter(){ clearLater(); renderPick(); showPane('ltPick'); }, leave(){ clearLater(); hush(); } });
    App.modes.little = { start(topic, mode){ if(mode === 'explore') startExplore(topic); else startGame(topic); }, levels, startLevel };
  }

  try{ init(); }catch(e){ window.mbaReport && window.mbaReport('little learners', e); }
})();
