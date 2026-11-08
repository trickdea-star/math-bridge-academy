/* Math Bridge Academy - The Math Bridge game, flash cards, quizzes, courses */
'use strict';
(function(){
  const App = window.MBA;
  const { $, $$, pick, shuffle, store, sfx, say, hush, makeProblem, choices, hint, fact, OPS, LEVEL_NAMES, PRAISE, ICON } = App;
  const starRow = n => `<div class="stars-row" role="img" aria-label="${n} of 3 stars">${[0, 1, 2].map(i => `<span class="${i < n ? '' : 'dim'}">${ICON.star}</span>`).join('')}</div>`;
  function timerBag(){ let list = []; return { later(fn, ms){ list.push(setTimeout(fn, ms)); }, clear(){ list.forEach(clearTimeout); list = []; } }; }

  /* =========================================================
     Scene: two cliffs, a rope bridge, a river, and Pip
     ========================================================= */
  const PIP = '<rect class="h-leg" x="-10" y="-16" width="8" height="16" rx="4"/><rect class="h-leg" x="3" y="-16" width="8" height="16" rx="4"/>'
    + '<rect class="h-pack" x="-26" y="-46" width="14" height="22" rx="5"/><ellipse class="h-body" cx="0" cy="-33" rx="18" ry="20"/>'
    + '<ellipse class="h-cheek" cx="16" cy="-27" rx="3.5" ry="2.4"/><circle class="h-eye" cx="6" cy="-37" r="3.4"/><circle class="h-eye" cx="14" cy="-37" r="3.4"/>'
    + '<circle class="h-glint" cx="7" cy="-38.3" r="1.1"/><circle class="h-glint" cx="15" cy="-38.3" r="1.1"/><path class="h-smile" d="M6 -28 Q10.5 -23.5 15 -28"/>'
    + '<path class="h-hat" d="M-17 -48 Q0 -68 17 -48Z"/><rect class="h-brim" x="-22" y="-51" width="44" height="6" rx="3"/><ellipse class="h-ring" cx="0" cy="-24" rx="27" ry="8"/>';

  function sceneMarkup(n, P, heroAt){
    const L = 140, R = 660, pw = (R - L) / n, planks = [];
    for(let i = 0; i < n; i++){
      const t = (i + 0.5) / n;
      planks.push({ x: L + pw * i + 2, w: pw - 4, cx: L + pw * (i + 0.5), y: 198 + 24 * Math.sin(Math.PI * t), t });
    }
    const pos = i => i < 0 ? { x: 74, y: 189 } : i >= n ? { x: 722, y: 189 } : { x: planks[i].cx, y: planks[i].y + 1 };
    const f = v => v.toFixed(1);
    let s = `<defs><linearGradient id="${P}sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--scene-sky1)"/><stop offset="1" style="stop-color:var(--scene-sky2)"/></linearGradient></defs>`;
    s += `<rect width="800" height="400" style="fill:url(#${P}sky)"/>`;
    s += '<g class="s-stars">' + [[58, 38], [150, 96], [236, 52], [330, 26], [402, 88], [530, 40], [600, 104], [770, 30], [300, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2"/>`).join('') + '</g>';
    s += '<circle class="s-sun" cx="690" cy="80" r="34"/>';
    s += '<g class="s-cloud c1"><ellipse cx="170" cy="72" rx="48" ry="15"/><ellipse cx="198" cy="60" rx="28" ry="17"/></g>';
    s += '<g class="s-cloud c2"><ellipse cx="470" cy="50" rx="40" ry="12"/><ellipse cx="492" cy="40" rx="22" ry="13"/></g>';
    s += '<path class="s-hill" d="M0 290 Q110 214 230 262 T470 246 T800 232 V400 H0Z"/>';
    s += '<rect class="s-water" x="0" y="316" width="800" height="84"/><path class="s-wave" d="M0 336 H800 M0 364 H800 M0 390 H800"/>';
    s += '<path class="s-cliff" d="M-6 196 H140 L124 406 H-6Z"/><path class="s-rock" d="M26 238 l30 10 M70 288 l26 -9 M18 342 l34 7 M96 236 l12 16"/>';
    s += '<path class="s-cliff" d="M660 196 H806 V406 H676Z"/><path class="s-rock" d="M700 248 l30 -9 M742 300 l26 10 M690 352 l30 5 M760 222 l-14 14"/>';
    s += '<rect class="s-turf" x="-6" y="187" width="152" height="16" rx="8"/><rect class="s-turf" x="654" y="187" width="152" height="16" rx="8"/>';
    s += '<line class="s-pole" x1="754" y1="104" x2="754" y2="188"/><path class="s-flag" d="M756 106 L792 118 L756 132Z"/>';
    s += '<rect class="s-post" x="127" y="120" width="15" height="74" rx="4"/><rect class="s-post" x="658" y="120" width="15" height="74" rx="4"/>';
    planks.forEach(p => { s += `<line class="s-rope thin" x1="${f(p.cx)}" y1="${f(132 + 96 * p.t * (1 - p.t))}" x2="${f(p.cx)}" y2="${f(p.y)}"/>`; });
    s += `<path class="s-rope" d="M140 198 ${planks.map(p => `L${f(p.cx)} ${f(p.y + 9)}`).join(' ')} L660 198"/>`;
    planks.forEach((p, i) => {
      s += `<g class="plank" id="${P}pk${i}"><rect class="s-plank" x="${f(p.x)}" y="${f(p.y)}" width="${f(p.w)}" height="15" rx="4"/>`
        + `<path class="crack k1" d="M${f(p.cx - 7)} ${f(p.y + 1)} l5 6 l-4 7"/><path class="crack k2" d="M${f(p.cx + 7)} ${f(p.y + 1)} l-4 5 l6 4 l-3 5"/></g>`;
    });
    s += '<path class="s-rope" d="M140 132 Q400 180 660 132"/>';
    const hp = pos(heroAt == null ? -1 : heroAt);
    s += `<g class="pip" id="${P}pip" style="transform:translate(${f(hp.x)}px,${f(hp.y)}px)"><g class="pip-body">${PIP}</g></g>`;
    s += '<rect class="s-front" x="0" y="348" width="800" height="52"/>';
    s += `<g id="${P}fx"></g>`;
    return { svg: s, planks, pos };
  }
  function drawStatic(svgEl, n, P, heroAt){
    svgEl.innerHTML = sceneMarkup(n, P, heroAt).svg;
    const ahead = svgEl.querySelector('#' + P + 'pk' + (heroAt + 1)); if(ahead) ahead.classList.add('ahead');
    const body = svgEl.querySelector('#' + P + 'pip .pip-body'); if(body) body.classList.add('idle');
  }

  /* =========================================================
     The Math Bridge
     ========================================================= */
  const B = { op: 'add', startLevel: 'auto', level: 1, auto: true, n: 5, step: 0, misses: 0, cracks: [], prob: null, busy: true, pos: null };
  const be = {}, bt = timerBag();
  const mathLevel = lv => lv <= 3 ? 1 : lv <= 6 ? 2 : lv <= 9 ? 3 : 4;
  const plankCount = lv => Math.min(4 + lv, 10);
  const START = [{ level: 'auto', name: 'Just right', note: 'learns your level' }, { level: 1, name: 'Easy', note: 'Bridge 1' }, { level: 4, name: 'Medium', note: 'Bridge 4' },
    { level: 7, name: 'Hard', note: 'Bridge 7' }, { level: 10, name: 'Expert', note: 'Bridge 10' }];

  function bridgeSetup(){
    bt.clear(); hush();
    be.setup.hidden = false; be.game.hidden = true;
    be.ops.innerHTML = ['add', 'sub', 'mul', 'div', 'mix'].map(op => `<button class="chip op-${op}" data-op="${op}" aria-pressed="${B.op === op}"><span class="sym">${OPS[op].sym}</span>${OPS[op].name}</button>`).join('');
    be.start.innerHTML = START.map(s => `<button class="chip t-level" data-start="${s.level}" aria-pressed="${B.startLevel === s.level}">${s.name} <small>${s.note}</small></button>`).join('');
    const best = store.get('bridgeBest', {});
    be.best.textContent = best[B.op] ? `Your best with ${OPS[B.op].name.toLowerCase()}: Bridge ${best[B.op]}.` : 'Cross a bridge to set your first record.';
    if(!be.preview.firstChild) drawStatic(be.preview, 5, 'p', -1);
  }
  function startBridge(level, auto){
    bt.clear(); hush();
    if(auto != null) B.auto = auto;
    B.level = level; B.n = plankCount(level); B.step = 0; B.misses = 0; B.cracks = new Array(B.n).fill(0); B.busy = true;
    const sc = sceneMarkup(B.n, 'g', -1);
    be.svg.innerHTML = sc.svg; B.pos = sc.pos;
    be.pip = be.svg.querySelector('#gpip');
    be.setup.hidden = true; be.game.hidden = false;
    be.title.textContent = 'Bridge ' + level;
    be.sub.textContent = `${OPS[B.op].name} \u00b7 ${B.auto ? 'Just right for ' + (App.profile().guest ? 'you' : App.profile().name) : LEVEL_NAMES[mathLevel(level)]} \u00b7 ${B.n} steps`;
    paintHearts(); markAhead();
    nextQuestion();
    window.scrollTo(0, 0);
  }
  function movePip(i, hop){
    const p = B.pos(i);
    be.pip.style.transform = `translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px)`;
    if(hop){ const body = be.pip.firstElementChild; body.classList.remove('hop'); void body.getBoundingClientRect(); body.classList.add('hop'); }
  }
  function markAhead(){ $$('.plank', be.svg).forEach((g, i) => g.classList.toggle('ahead', i === B.step)); }
  function paintHearts(){
    const left = 3 - B.misses;
    be.hearts.innerHTML = [0, 1, 2].map(i => `<span class="heart${i < left ? '' : ' lost'}">${ICON.heart}</span>`).join('');
    be.hearts.setAttribute('aria-label', left + (left === 1 ? ' heart' : ' hearts') + ' left');
  }
  function nextQuestion(){
    B.prob = App.nextProblem(B.op, B.auto ? 'auto' : mathLevel(B.level));
    be.panel.innerHTML = `<div class="steps-left">Step ${B.step + 1} of ${B.n}</div><div class="question">${B.prob.text} = <span class="qmark">?</span></div>`
      + `<div class="answers">${choices(B.prob).map((v, i) => `<button class="btn ans" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('')}</div><div class="feedback" id="bFb" aria-live="polite"></div>`;
    B.busy = false;
    say(B.prob.text + ' = ?');
  }
  function bridgeAnswer(btn){
    if(B.busy) return;
    B.busy = true;
    const ok = Number(btn.dataset.v) === B.prob.ans, fb = $('#bFb');
    App.record(B.prob, ok);
    $$('.ans', be.panel).forEach(b => { b.disabled = true; if(Number(b.dataset.v) === B.prob.ans) b.classList.add('right'); });
    const q = $('.qmark', be.panel); if(q){ q.textContent = B.prob.ans; q.classList.add(ok ? 'ok' : 'no'); }
    if(ok){
      sfx.good(); fb.textContent = pick(PRAISE);
      B.step++; movePip(B.step - 1, true); sfx.step(); markAhead();
      if(B.step < B.n) bt.later(nextQuestion, 950);
      else { bt.later(() => { movePip(B.n, true); sfx.step(); }, 600); bt.later(bridgeWin, 1250); }
      return;
    }
    btn.classList.add('wrong'); sfx.bad();
    B.misses++; paintHearts();
    const i = B.step, pk = be.svg.querySelector('#gpk' + i);
    B.cracks[i]++;
    if(pk){ pk.classList.remove('shake'); void pk.getBoundingClientRect(); pk.classList.add('shake', 'c' + Math.min(2, B.cracks[i])); }
    bt.later(() => sfx.creak(), 150);
    if(B.misses >= 3){
      fb.innerHTML = `<span>Oh no! ${B.prob.text} = <b>${B.prob.ans}</b></span>`;
      bt.later(bridgeFall, 1000);
    } else {
      fb.innerHTML = `<span><b>Oops!</b> ${B.prob.text} = <b>${B.prob.ans}</b>. The plank cracked!</span><span class="tip">${hint(B.prob)}</span><button class="btn go" data-b="next">Next problem</button>`;
      const nb = fb.querySelector('[data-b="next"]'); if(nb) nb.focus({ preventScroll: true });
      say(`Oops! ${B.prob.text} = ${B.prob.ans}`);
    }
  }
  function splash(x){
    const g = be.svg.querySelector('#gfx'); if(!g) return;
    g.innerHTML = `<g transform="translate(${x.toFixed(1)} 346)"><ellipse class="sp-ring" rx="22" ry="7"/><ellipse class="sp-ring r2" rx="22" ry="7"/>`
      + [-42, -24, -6, 12, 30, 46].map((dx, k) => `<circle class="sp-drop" r="${5 + (k % 2) * 2}" style="--dx:${dx}px;--dy:${-46 - (k % 3) * 22}px"/>`).join('') + '</g>';
  }
  function bridgeFall(){
    const i = B.step, pk = be.svg.querySelector('#gpk' + i), p = B.pos(i), pip = be.pip, body = pip.firstElementChild;
    movePip(i, true);
    bt.later(() => {
      if(pk) pk.classList.add('break');
      sfx.fall();
      pip.classList.add('falling');
      pip.style.transform = `translate(${p.x.toFixed(1)}px,430px)`;
      body.classList.remove('hop'); body.classList.add('tumble');
    }, 430);
    bt.later(() => { splash(p.x); sfx.splash(); pip.style.opacity = '0'; }, 1300);
    bt.later(() => {
      pip.classList.remove('falling'); body.classList.remove('tumble');
      pip.style.transition = 'none';
      pip.style.transform = `translate(${p.x.toFixed(1)}px,376px)`;
      void pip.getBoundingClientRect();
      pip.style.transition = '';
      pip.classList.add('swim'); pip.style.opacity = '1'; body.classList.add('bob');
      bridgeLose();
    }, 2200);
  }
  function bridgeLose(){
    be.panel.innerHTML = `<div class="result lose"><h3>Splash!</h3><p>Three cracks broke the bridge and Pip fell into the river. Pip is a great swimmer, so Pip is fine. Ready to try again?</p>`
      + `<div class="row"><button class="btn primary" data-b="retry">Try Bridge ${B.level} again</button><button class="btn" data-b="setup">Change math</button>${App.courseBtn()}</div></div>`;
    say('Splash! Pip fell in the river. Ready to try again?');
  }
  function bridgeWin(){
    const earned = 3 - B.misses, body = be.pip.firstElementChild;
    body.classList.remove('hop'); body.classList.add('cheer');
    sfx.win(); App.confetti(90); App.addStars(earned);
    const best = store.get('bridgeBest', {});
    if(!best[B.op] || B.level > best[B.op]){ best[B.op] = B.level; store.set('bridgeBest', best); }
    App.finishTask('bridge', B.op, true);
    const harder = B.auto ? '' : mathLevel(B.level + 1) > mathLevel(B.level) ? ' and harder problems' : '';
    be.panel.innerHTML = `<div class="result win"><h3>You crossed Bridge ${B.level}!</h3>${starRow(earned)}`
      + `<p>${earned === 3 ? 'A perfect crossing. Not one crack!' : `You earned ${earned} star${earned > 1 ? 's' : ''}.`} Bridge ${B.level + 1} has ${plankCount(B.level + 1)} steps${harder}.</p>`
      + `<div class="row"><button class="btn go" data-b="nextbridge">Next bridge</button><button class="btn" data-b="retry">Play again</button>${App.courseBtn()}</div></div>`;
    say(`You crossed bridge ${B.level}!`);
  }
  function bridgeInit(){
    ['bridgeSetup:setup', 'bridgeGame:game', 'bOps:ops', 'bStart:start', 'bGo:go', 'bBest:best', 'bPreview:preview', 'bQuit:quit', 'bTitle:title', 'bSub:sub', 'bHearts:hearts', 'bSvg:svg', 'bPanel:panel', 'bRules:rules']
      .forEach(pair => { const [id, key] = pair.split(':'); be[key] = $('#' + id); });
    be.rules.innerHTML = [
      [ICON.check, 'Each right answer moves Pip one step.'],
      [ICON.heart, 'You have 3 hearts. A wrong answer cracks the next plank.'],
      [ICON.bridge, 'Lose all 3 hearts and the bridge breaks. Splash!'],
      [ICON.star, 'Reach the flag to earn up to 3 stars.']
    ].map(([ic, t]) => `<li>${ic}<span>${t}</span></li>`).join('');
    be.ops.addEventListener('click', e => { const b = e.target.closest('[data-op]'); if(b){ B.op = b.dataset.op; sfx.tap(); bridgeSetup(); } });
    be.start.addEventListener('click', e => { const b = e.target.closest('[data-start]'); if(b){ const v = b.dataset.start; B.startLevel = v === 'auto' ? 'auto' : Number(v); sfx.tap(); bridgeSetup(); } });
    be.go.addEventListener('click', () => { sfx.tap(); const auto = B.startLevel === 'auto'; startBridge(auto ? 1 : B.startLevel, auto); });
    be.quit.addEventListener('click', bridgeSetup);
    be.panel.addEventListener('click', e => {
      const a = e.target.closest('.ans'); if(a){ bridgeAnswer(a); return; }
      const b = e.target.closest('[data-b]'); if(!b) return;
      const act = b.dataset.b;
      if(act === 'next') nextQuestion();
      else if(act === 'retry') startBridge(B.level);
      else if(act === 'nextbridge') startBridge(B.level + 1);
      else if(act === 'setup') bridgeSetup();
    });
    App.on('bridge', { enter: bridgeSetup, leave(){ bt.clear(); hush(); } });
    App.modes.bridge = { start(op, level){ B.op = op; B.startLevel = level || 1; startBridge(B.startLevel, false); } };
  }

  /* =========================================================
     Flash cards
     ========================================================= */
  const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
  const DECKS = [
    { id: 'add-10', op: 'add', name: 'Adding to 10', facts(){ const f = []; for(let a = 1; a <= 9; a++) for(let b = 1; a + b <= 10; b++) f.push(fact('add', a, b)); return f; } },
    { id: 'add-make10', op: 'add', name: 'Make 10 friends', facts(){ return range(1, 9).map(a => ({ op: 'add', a, b: 10 - a, ans: 10 - a, text: `${a} + ? = 10`, sayQ: `${a} plus what makes 10?`, full: `${a} + ${10 - a} = 10`, tip: `${a} and ${10 - a} are ten friends.` })); } },
    { id: 'add-doubles', op: 'add', name: 'Doubles', facts(){ return range(1, 10).map(a => fact('add', a, a)); } },
    { id: 'add-20', op: 'add', name: 'Adding to 20', facts(){ const f = []; for(let a = 2; a <= 9; a++) for(let b = 2; b <= 9; b++) if(a + b > 10) f.push(fact('add', a, b)); return f; } },
    { id: 'sub-10', op: 'sub', name: 'Take away within 10', facts(){ const f = []; for(let a = 2; a <= 10; a++) for(let b = 1; b < a; b++) f.push(fact('sub', a, b)); return f; } },
    { id: 'sub-from10', op: 'sub', name: '10 take away', facts(){ return range(1, 9).map(b => fact('sub', 10, b)); } },
    { id: 'sub-20', op: 'sub', name: 'Subtract within 20', facts(){ const f = []; for(let a = 11; a <= 18; a++) for(let b = a - 9; b <= 9; b++) f.push(fact('sub', a, b)); return f; } },
    { id: 'add-tens', op: 'add', name: 'Two-digit adding', ages: '8+', facts(){ const f = []; for(let i = 0; i < 12; i++){ const a = App.rand(12, 68); f.push(fact('add', a, App.rand(11, 99 - a))); } return f; } },
    { id: 'sub-tens', op: 'sub', name: 'Two-digit subtracting', ages: '8+', facts(){ const f = []; for(let i = 0; i < 12; i++){ const a = App.rand(31, 99); f.push(fact('sub', a, App.rand(11, a - 10))); } return f; } }
  ].concat(
    [2, 3, 4, 5, 6, 7, 8, 9, 10].map(t => ({ id: 'mul-' + t, op: 'mul', name: `\u00d7 ${t} table`, facts(){ return range(1, 10).map(k => fact('mul', k, t)); } })),
    [2, 3, 4, 5, 10].map(t => ({ id: 'div-' + t, op: 'div', name: `Divide by ${t}`, facts(){ return range(1, 10).map(k => fact('div', k * t, t)); } }))
  );
  App.DECKS = DECKS;
  const CS = { deck: null, queue: [], i: 0, known: 0, missed: [], flipped: false };
  const ce = {};
  let cOp = 'add';

  function cardsSetup(){
    hush();
    ce.pick.hidden = false; ce.play.hidden = true; ce.done.hidden = true;
    if(['add', 'sub', 'mul', 'div'].indexOf(cOp) < 0) cOp = 'add';
    ce.ops.innerHTML = ['add', 'sub', 'mul', 'div'].map(op => `<button class="chip op-${op}" data-cop="${op}" aria-pressed="${cOp === op}"><span class="sym">${OPS[op].sym}</span>${OPS[op].name}</button>`).join('');
    const doneDecks = store.get('decksDone', {});
    const tricky = App.trickyFor(cOp);
    ce.decks.innerHTML = (tricky.length ? `<button class="deck op-mix" data-deck="tricky"><span class="deck-sample">${tricky[0].text}</span><b>My tricky ones</b><small>${Math.min(10, tricky.length)} card${tricky.length > 1 ? 's' : ''} you missed before</small></button>` : '')
      + DECKS.filter(d => d.op === cOp).map(d => {
        const f = d.facts();
        return `<button class="deck op-${d.op}" data-deck="${d.id}"><span class="deck-sample">${f[Math.min(2, f.length - 1)].text}</span><b>${d.name}</b><small>${Math.min(10, f.length)} cards${d.ages ? ' \u00b7 ages ' + d.ages : ''}${doneDecks[d.id] ? ' \u00b7 done \u2713' : ''}</small></button>`;
      }).join('');
  }
  const trickyDeck = op => ({ id: 'tricky', op: op === 'mix' ? 'mix' : op, name: 'My tricky ones', facts: () => App.trickyFor(op === 'mix' ? null : op) });
  function startDeck(id, list){
    const d = id === 'tricky' ? trickyDeck(cOp) : DECKS.find(x => x.id === id); if(!d) return;
    if(!list && !d.facts().length) return;
    cOp = d.op;
    CS.deck = d; CS.queue = list || shuffle(d.facts()).slice(0, 10); CS.i = 0; CS.known = 0; CS.missed = [];
    ce.pick.hidden = true; ce.play.hidden = false; ce.done.hidden = true;
    ce.play.className = 'op-' + d.op;
    ce.name.textContent = d.name + (list ? ' \u00b7 tricky cards' : '');
    showCard();
    window.scrollTo(0, 0);
  }
  function showCard(){
    const f = CS.queue[CS.i];
    ce.card.classList.add('instant'); ce.card.classList.remove('flipped'); void ce.card.offsetWidth; ce.card.classList.remove('instant');
    CS.flipped = false;
    ce.front.innerHTML = `<span class="fc-q">${f.text}</span><span class="fc-hint">Say the answer, then tap</span>`;
    ce.back.innerHTML = `<span class="fc-a">${f.full || f.text + ' = ' + f.ans}</span><span class="fc-tip">${hint(f)}</span>`;
    ce.count.textContent = `Card ${CS.i + 1} of ${CS.queue.length}`;
    ce.bar.style.width = (CS.i / CS.queue.length * 100) + '%';
    ce.yes.disabled = true; ce.no.disabled = true;
    ce.hint.textContent = 'Tap the card to flip it.';
    say(f.sayQ || f.text + ' = ?');
  }
  function flip(){
    CS.flipped = !CS.flipped;
    ce.card.classList.toggle('flipped', CS.flipped);
    sfx.flip();
    if(CS.flipped){
      ce.yes.disabled = false; ce.no.disabled = false;
      ce.hint.textContent = 'Did you know it?';
      const f = CS.queue[CS.i]; say(f.full || f.text + ' = ' + f.ans);
    }
  }
  function grade(knew){
    const f = CS.queue[CS.i];
    App.record(f, knew);
    if(knew){ CS.known++; sfx.good(); } else { CS.missed.push(f); sfx.tap(); }
    CS.i++;
    if(CS.i < CS.queue.length) showCard(); else finishDeck();
  }
  function finishDeck(){
    ce.bar.style.width = '100%';
    ce.play.hidden = true; ce.done.hidden = false;
    const total = CS.queue.length, d = CS.deck;
    const doneDecks = store.get('decksDone', {}); doneDecks[d.id] = true; store.set('decksDone', doneDecks);
    App.addStars(1); sfx.win(); if(CS.known === total) App.confetti(60);
    App.finishTask('cards', d.id, true);
    const m = CS.missed.length;
    ce.done.innerHTML = `<div class="panel result"><p class="eyebrow">${d.name}</p><h3>Deck done!</h3><p>You knew <b>${CS.known}</b> of ${total} cards right away. You earned a star.</p>`
      + `<div class="row">${App.courseBtn()}${m ? `<button class="btn primary" data-c="missed">Practice the ${m} tricky card${m > 1 ? 's' : ''}</button>` : ''}<button class="btn" data-c="again">Shuffle and play again</button><button class="btn" data-c="pick">Pick another deck</button></div></div>`;
    say(`Deck done! You knew ${CS.known} of ${total}.`);
  }
  function cardsInit(){
    ['cardsPick:pick', 'cardsPlay:play', 'cardsDone:done', 'cOps:ops', 'cDecks:decks', 'cBackBtn:back', 'cName:name', 'cCount:count', 'cBar:bar', 'cCard:card', 'cFront:front', 'cBackFace:back2', 'cHint:hint', 'cYes:yes', 'cNo:no']
      .forEach(pair => { const [id, key] = pair.split(':'); ce[key] = $('#' + id); });
    ce.back = ce.back2;
    $('#cBackBtn').addEventListener('click', cardsSetup);
    ce.ops.addEventListener('click', e => { const b = e.target.closest('[data-cop]'); if(b){ cOp = b.dataset.cop; sfx.tap(); cardsSetup(); } });
    ce.decks.addEventListener('click', e => { const b = e.target.closest('[data-deck]'); if(b){ sfx.tap(); startDeck(b.dataset.deck); } });
    ce.card.addEventListener('click', flip);
    ce.yes.addEventListener('click', () => grade(true));
    ce.no.addEventListener('click', () => grade(false));
    ce.done.addEventListener('click', e => {
      const b = e.target.closest('[data-c]'); if(!b) return;
      const act = b.dataset.c;
      if(act === 'missed') startDeck(CS.deck.id, shuffle(CS.missed.slice()));
      else if(act === 'again') startDeck(CS.deck.id);
      else if(act === 'pick') cardsSetup();
    });
    App.on('cards', { enter: cardsSetup, leave: hush });
    App.modes.cards = { startDeck, tricky(op){ cOp = op || 'mix'; startDeck('tricky'); } };
  }

  /* =========================================================
     Quizzes
     ========================================================= */
  const QLEVELS = ['auto', 1, 2, 3, 4];
  const Q = { op: 'add', level: 'auto', i: 0, score: 0, probs: [], results: [], busy: true };
  const qe = {}, qt = timerBag();

  function quizSetup(){
    qt.clear(); hush();
    qe.pick.hidden = false; qe.play.hidden = true; qe.done.hidden = true;
    qe.ops.innerHTML = ['add', 'sub', 'mul', 'div', 'mix'].map(op => `<button class="chip op-${op}" data-qop="${op}" aria-pressed="${Q.op === op}"><span class="sym">${OPS[op].sym}</span>${OPS[op].name}</button>`).join('');
    qe.levels.innerHTML = QLEVELS.map(l => `<button class="chip t-level" data-ql="${l}" aria-pressed="${Q.level === l}">${LEVEL_NAMES[l]}${l === 'auto' ? ' <small>learns your level</small>' : ''}</button>`).join('');
    const best = store.get('quizBest', {});
    qe.best.innerHTML = `<thead><tr><th>Topic</th>${QLEVELS.map(l => `<th>${LEVEL_NAMES[l]}</th>`).join('')}</tr></thead><tbody>`
      + ['add', 'sub', 'mul', 'div', 'mix'].map(op => `<tr><td>${OPS[op].name}</td>${QLEVELS.map(l => { const v = best[op + '-' + l]; return `<td>${v == null ? '<span class="muted">\u2013</span>' : v + ' / 10'}</td>`; }).join('')}</tr>`).join('') + '</tbody>';
  }
  function startQuiz(op, level){
    qt.clear();
    Q.op = op; Q.level = level; Q.i = 0; Q.score = 0; Q.results = []; Q.probs = [];
    const seen = new Set();
    for(let guard = 0; Q.probs.length < 10 && guard < 500; guard++){ const p = App.nextProblem(op, level); if(!seen.has(p.text)){ seen.add(p.text); Q.probs.push(p); } }
    while(Q.probs.length < 10) Q.probs.push(App.nextProblem(op, level));
    qe.pick.hidden = true; qe.play.hidden = false; qe.done.hidden = true;
    qe.play.className = 'op-' + op;
    renderQ();
    window.scrollTo(0, 0);
  }
  function paintDots(){
    qe.dots.innerHTML = Q.probs.map((_, i) => `<i class="${i < Q.results.length ? (Q.results[i] ? 'ok' : 'no') : (i === Q.i ? 'now' : '')}"></i>`).join('');
  }
  function renderQ(){
    const p = Q.probs[Q.i];
    qe.title.textContent = `${OPS[Q.op].name} \u00b7 ${LEVEL_NAMES[Q.level]}`;
    qe.count.textContent = `Question ${Q.i + 1} of ${Q.probs.length} \u00b7 ${Q.score} right so far`;
    paintDots();
    qe.panel.innerHTML = `<div class="question">${p.text} = <span class="qmark">?</span></div><div class="answers">${choices(p).map((v, i) => `<button class="btn ans" data-v="${v}"><small>${i + 1}</small>${v}</button>`).join('')}</div><div class="feedback" id="qFb" aria-live="polite"></div>`;
    Q.busy = false;
    say(p.text + ' = ?');
  }
  function quizAnswer(btn){
    if(Q.busy) return;
    Q.busy = true;
    const p = Q.probs[Q.i], ok = Number(btn.dataset.v) === p.ans, fb = $('#qFb'), last = Q.i === Q.probs.length - 1;
    App.record(p, ok);
    $$('.ans', qe.panel).forEach(b => { b.disabled = true; if(Number(b.dataset.v) === p.ans) b.classList.add('right'); });
    const q = $('.qmark', qe.panel); if(q){ q.textContent = p.ans; q.classList.add(ok ? 'ok' : 'no'); }
    Q.results.push(ok); if(ok) Q.score++;
    paintDots();
    if(ok){ sfx.good(); fb.textContent = pick(PRAISE); qt.later(advance, 900); return; }
    btn.classList.add('wrong'); sfx.bad();
    fb.innerHTML = `<span>The answer is <b>${p.ans}</b>.</span><span class="tip">${hint(p)}</span><button class="btn go" data-q="next">${last ? 'See my score' : 'Next question'}</button>`;
    const nb = fb.querySelector('[data-q="next"]'); if(nb) nb.focus({ preventScroll: true });
    say(`${p.text} = ${p.ans}`);
  }
  function advance(){ Q.i++; if(Q.i < Q.probs.length) renderQ(); else quizDone(); }
  function quizDone(){
    const s = Q.score, n = Q.probs.length, st = s === n ? 3 : s >= 8 ? 2 : s >= 5 ? 1 : 0, key = Q.op + '-' + Q.level;
    App.addStars(st);
    const best = store.get('quizBest', {}), newBest = !(key in best) || s > best[key];
    if(newBest){ best[key] = s; store.set('quizBest', best); }
    const passed = s >= 7, hadTask = !!App.task;
    App.finishTask('quiz', key, passed);
    if(st >= 2){ sfx.win(); App.confetti(st === 3 ? 100 : 50); }
    const msg = s === n ? 'A perfect score!' : passed ? 'Great job. You passed!' : s >= 5 ? 'Good try! Watch a video, then try again.' : 'Keep practicing. You will get there!';
    qe.play.hidden = true; qe.done.hidden = false;
    qe.done.innerHTML = `<div class="panel result"><p class="eyebrow">${OPS[Q.op].name} \u00b7 ${LEVEL_NAMES[Q.level]}</p><h3 class="score">${s} <span>/ ${n}</span></h3>${starRow(st)}<p>${msg}${newBest && s > 0 ? ' That\u2019s your new best.' : ''}</p>`
      + `${hadTask && !passed ? '<p class="tip">Get 7 or more right to finish this course step.</p>' : ''}`
      + `<div class="row"><button class="btn primary" data-q="again">Try again</button><button class="btn" data-q="setup">Pick another quiz</button>${App.courseBtn()}</div></div>`;
    say(`You got ${s} out of ${n}!`);
  }
  function quizInit(){
    ['quizPick:pick', 'quizPlay:play', 'quizDone:done', 'qOps:ops', 'qLevels:levels', 'qGo:go', 'qBest:best', 'qQuit:quit', 'qTitle:title', 'qCount:count', 'qDots:dots', 'qPanel:panel']
      .forEach(pair => { const [id, key] = pair.split(':'); qe[key] = $('#' + id); });
    qe.ops.addEventListener('click', e => { const b = e.target.closest('[data-qop]'); if(b){ Q.op = b.dataset.qop; sfx.tap(); quizSetup(); } });
    qe.levels.addEventListener('click', e => { const b = e.target.closest('[data-ql]'); if(b){ const v = b.dataset.ql; Q.level = v === 'auto' ? 'auto' : Number(v); sfx.tap(); quizSetup(); } });
    qe.go.addEventListener('click', () => { sfx.tap(); startQuiz(Q.op, Q.level); });
    qe.quit.addEventListener('click', quizSetup);
    qe.panel.addEventListener('click', e => {
      const a = e.target.closest('.ans'); if(a){ quizAnswer(a); return; }
      if(e.target.closest('[data-q="next"]')) advance();
    });
    qe.done.addEventListener('click', e => {
      const b = e.target.closest('[data-q]'); if(!b) return;
      if(b.dataset.q === 'again') startQuiz(Q.op, Q.level); else if(b.dataset.q === 'setup') quizSetup();
    });
    App.on('quiz', { enter: quizSetup, leave(){ qt.clear(); hush(); } });
    App.modes.quiz = { start: startQuiz };
  }

  /* =========================================================
     Courses: one path per operation, shaped to the player's age
     ========================================================= */
  const Ls = (id, label) => ({ kind: 'lesson', id, label });
  const Cs = (id, label) => ({ kind: 'cards', id, label });
  const Qz = (op, level) => ({ kind: 'quiz', id: op + '-' + level, op, level, label: `${OPS[op].name}, ${LEVEL_NAMES[level]} (get 7 right)` });
  const Br = (op, level) => ({ kind: 'bridge', id: op, op, level, label: `Cross the Math Bridge from Bridge ${level}` });
  const Lt = (topic, mode, label) => ({ kind: 'little', id: topic + '-' + mode, topic, mode, label });
  const COURSE_SETS = {
    little: [
      { op: 'add', sym: '123', name: 'Counting Fun', blurb: 'Hear the numbers, then count things with Pip.', steps: [
        Lt('numbers', 'explore', 'Tap and hear 1 to 10'), Lt('numbers', 'play', 'Count and find numbers'), Lt('numbers', 'play', 'Count again')] },
      { op: 'mix', sym: '\u25cf', name: 'Color Party', blurb: 'Learn the colors, then pop the right balloon.', steps: [
        Lt('colors', 'explore', 'Tap and hear the colors'), Lt('colors', 'play', 'Pop the right balloon'), Lt('colors', 'play', 'Pop more balloons')] },
      { op: 'mul', sym: 'ABC', name: 'ABC Adventure', blurb: 'Meet every letter, then find the one you hear.', steps: [
        Lt('letters', 'explore', 'Tap and hear A to Z'), Lt('letters', 'play', 'Find the letter'), Lt('letters', 'play', 'Find more letters')] },
      { op: 'div', sym: '+', name: 'Ready for Adding', blurb: 'For 4-year-olds who love counting: a first adding trick.', steps: [
        Ls('add-counton', 'Count on from the big number'), Cs('add-10', 'Adding to 10')] }
    ],
    young: [
      { op: 'add', name: 'Addition Adventure', blurb: 'Count on, make 10 and use doubles, with numbers up to 10.', steps: [
        Ls('add-counton', 'Count on from the big number'), Ls('add-make10', 'Make 10 to add fast'), Cs('add-make10', 'Make 10 friends'), Cs('add-10', 'Adding to 10'),
        Ls('add-doubles', 'Doubles and near doubles'), Cs('add-doubles', 'Doubles'), Qz('add', 1), Br('add', 1)] },
      { op: 'sub', name: 'Subtraction Station', blurb: 'Take away within 10 by counting up.', steps: [
        Ls('sub-countup', 'Count up to subtract'), Cs('sub-from10', '10 take away'), Cs('sub-10', 'Take away within 10'), Qz('sub', 1), Br('sub', 1)] },
      { op: 'mul', name: 'Times Tables Starter', blurb: 'Equal groups of things, then the 2s and the 10s.', steps: [
        Ls('mul-groups', 'Times means groups of'), Cs('mul-2', '\u00d7 2 table'), Cs('mul-10', '\u00d7 10 table'), Qz('mul', 1), Br('mul', 1)] },
      { op: 'div', name: 'Sharing Fair', blurb: 'Share things equally between friends.', steps: [
        Ls('div-share', 'Division means sharing'), Cs('div-2', 'Divide by 2'), Qz('div', 1), Br('div', 1)] }
    ],
    mid: [
      { op: 'add', name: 'Addition Adventure', blurb: 'Make 10 and use doubles to add up to 20.', steps: [
        Ls('add-make10', 'Make 10 to add fast'), Ls('add-doubles', 'Doubles and near doubles'), Cs('add-20', 'Adding to 20'), Qz('add', 2), Br('add', 4)] },
      { op: 'sub', name: 'Subtraction Station', blurb: 'Count up and take away 10 with numbers up to 20.', steps: [
        Ls('sub-countup', 'Count up to subtract'), Ls('sub-take10', 'Take away 10, give some back'), Cs('sub-20', 'Subtract within 20'), Qz('sub', 2), Br('sub', 4)] },
      { op: 'mul', name: 'Multiplication Mountain', blurb: 'Groups, arrays, and the 2s, 5s and 10s.', steps: [
        Ls('mul-groups', 'Times means groups of'), Ls('mul-easy', 'Easy tables: 2, 10 and 5'), Cs('mul-2', '\u00d7 2 table'), Cs('mul-5', '\u00d7 5 table'),
        Cs('mul-10', '\u00d7 10 table'), Qz('mul', 1), Qz('mul', 2), Br('mul', 4)] },
      { op: 'div', name: 'Division Dash', blurb: 'Share fairly, then divide using times tables.', steps: [
        Ls('div-share', 'Division means sharing'), Ls('div-family', 'Use times tables to divide'), Cs('div-2', 'Divide by 2'), Cs('div-5', 'Divide by 5'),
        Cs('div-10', 'Divide by 10'), Qz('div', 1), Br('div', 1)] }
    ],
    older: [
      { op: 'add', name: 'Addition Adventure', blurb: 'Add two-digit numbers in your head: tens first, then ones.', steps: [
        Ls('add-tens', 'Add tens, then ones'), Cs('add-20', 'Adding to 20, fast'), Cs('add-tens', 'Two-digit adding'), Qz('add', 3), Br('add', 7)] },
      { op: 'sub', name: 'Subtraction Station', blurb: 'Subtract two-digit numbers in two jumps.', steps: [
        Ls('sub-take10', 'Take away 10, give some back'), Ls('sub-jumps', 'Subtract in two jumps'), Cs('sub-20', 'Subtract within 20, fast'),
        Cs('sub-tens', 'Two-digit subtracting'), Qz('sub', 3), Br('sub', 7)] },
      { op: 'mul', name: 'Multiplication Mountain', blurb: 'Every times table, with tricks for the 4s, 8s and 9s.', steps: [
        Ls('mul-easy', 'Easy tables: 2, 10 and 5'), Ls('mul-double', 'Double it for 4s and 8s'), Cs('mul-4', '\u00d7 4 table'), Cs('mul-8', '\u00d7 8 table'),
        Ls('mul-nine', 'The 9s finger trick'), Cs('mul-9', '\u00d7 9 table'), Cs('mul-6', '\u00d7 6 table'), Cs('mul-7', '\u00d7 7 table'), Qz('mul', 2), Qz('mul', 3), Br('mul', 7)] },
      { op: 'div', name: 'Division Dash', blurb: 'Divide with any times table.', steps: [
        Ls('div-family', 'Use times tables to divide'), Cs('div-3', 'Divide by 3'), Cs('div-4', 'Divide by 4'), Qz('div', 2), Qz('div', 3), Br('div', 4)] }
    ]
  };
  const KIND = { lesson: 'Watch', cards: 'Flash cards', quiz: 'Quiz', bridge: 'Game', little: 'Play' };
  // Nine-year-olds walk the 8-9 paths with one level more in every quiz and a later starting bridge.
  function coursesFor(p){
    const b = App.band(p.age), up = p.age >= 9;
    return COURSE_SETS[b].map(c => ({ id: b + '-' + c.op, op: c.op, name: c.name, blurb: c.blurb, steps: c.steps.map(s => {
      if(!up) return s;
      if(s.kind === 'quiz') return Qz(s.op, Math.min(4, s.level + 1));
      if(s.kind === 'bridge') return Br(s.op, Math.min(10, s.level + 3));
      return s;
    }) }));
  }
  function nextStep(p){
    for(const c of coursesFor(p)){ const i = c.steps.findIndex((s, k) => !App.isDone(c.id, k)); if(i >= 0) return { c, i, s: c.steps[i] }; }
    return null;
  }
  function renderCourses(){
    const p = App.profile();
    $('#courseFor').textContent = p.guest
      ? `Showing the ${App.BAND_NAMES[App.band(p.age)]} path. Set up a player on the Grown-ups page to match a child\u2019s age.`
      : `${p.name}\u2019s path, for age ${p.age}. Follow it from top to bottom; each step unlocks the next one.`;
    $('#courseList').innerHTML = coursesFor(p).map(c => {
      const doneCount = c.steps.filter((s, i) => App.isDone(c.id, i)).length;
      const nextIdx = c.steps.findIndex((s, i) => !App.isDone(c.id, i));
      return `<article class="course op-${c.op}">
        <header><span class="opbadge">${c.sym || OPS[c.op].sym}</span><div><h3>${c.name}</h3><p>${c.blurb}</p></div>
          <div class="cprog"><span>${doneCount} of ${c.steps.length} steps</span><span class="pbar"><i style="width:${(doneCount / c.steps.length * 100).toFixed(0)}%"></i></span></div></header>
        <ol class="path">${c.steps.map((s, i) => {
          const done = App.isDone(c.id, i), isNext = i === nextIdx, locked = !done && !isNext;
          return `<li class="pstep${done ? ' done' : ''}${isNext ? ' next' : ''}${locked ? ' locked' : ''}"><button data-course="${c.id}" data-step="${i}"${locked ? ' disabled' : ''}>`
            + `<span class="pico">${done ? ICON.check : locked ? ICON.lock : (ICON[s.kind] || ICON.star)}</span><span class="ptext"><small>${KIND[s.kind]}${done ? ' \u00b7 done' : isNext ? ' \u00b7 up next' : ''}</small><b>${s.label}</b></span></button></li>`;
        }).join('')}</ol>
        ${nextIdx < 0 ? '<p class="cdone">Course complete. You are a math superstar!</p>' : ''}
      </article>`;
    }).join('');
  }
  function launchStep(cid, i){
    const c = coursesFor(App.profile()).find(x => x.id === cid); if(!c) return;
    const s = c.steps[i], task = { course: cid, step: i, kind: s.kind, id: s.id };
    sfx.tap();
    if(s.kind === 'lesson') App.launch(task, 'learn', () => App.modes.learn.open(s.id));
    else if(s.kind === 'cards') App.launch(task, 'cards', () => App.modes.cards.startDeck(s.id));
    else if(s.kind === 'quiz') App.launch(task, 'quiz', () => App.modes.quiz.start(s.op, s.level));
    else if(s.kind === 'bridge') App.launch(task, 'bridge', () => App.modes.bridge.start(s.op, s.level));
    else if(s.kind === 'little') App.launch(task, 'little', () => App.modes.little.start(s.topic, s.mode));
  }
  function coursesInit(){
    $('#courseList').addEventListener('click', e => { const b = e.target.closest('[data-course]'); if(b && !b.disabled) launchStep(b.dataset.course, Number(b.dataset.step)); });
    App.on('courses', { enter: renderCourses });
  }

  /* =========================================================
     Grown-ups: players, ages, and what each child is learning
     ========================================================= */
  const AGES = [2, 3, 4, 5, 6, 7, 8, 9];
  // Little Learners progress: level 1-3 per game (starts from age), and games played.
  function littleSkills(p){
    const s0 = App.modes.little ? App.modes.little.startLevel(p.age) : 1;
    const lv = Object.assign({ numbers: s0, colors: s0, letters: s0, games: 0 }, App.peek(p.id, 'little', {}));
    const words = ['', 'Just starting', 'Growing', 'Ready for more'];
    return `<div class="skills">${[['numbers', '123', 'Numbers', 'op-add'], ['colors', '\u25cf', 'Colors', 'op-mix'], ['letters', 'ABC', 'Letters', 'op-mul']].map(([k, sym, name, cls]) =>
      `<div class="sk ${cls}"><span class="sk-name"><b>${sym}</b> ${name}</span><span class="sk-bar"><i style="width:${Math.round(lv[k] / 3 * 100)}%"></i></span><span class="sk-lvl">${words[lv[k]]}</span></div>`).join('')}`
      + `<p class="muted small">${lv.games} little game${lv.games === 1 ? '' : 's'} played. A perfect game moves a level up; a hard one moves it down.</p></div>`;
  }
  const ageChips = (name, sel) => `<div class="chips" role="group" aria-label="Age">${AGES.map(a => `<button type="button" class="chip t-level" data-age-for="${name}" data-age="${a}" aria-pressed="${sel === a}">${a}</button>`).join('')}</div>`;
  const levelWord = r => r >= 4 ? 'Expert' : r >= 3 ? 'Hard' : r >= 2 ? 'Medium' : 'Easy';
  let editing = null, removing = null, removeTimer = null, newAge = 7;
  function playerCard(p){
    const cur = App.profile().id === p.id, sk = App.skillsFor(p), st = App.peek(p.id, 'stats', {}), tr = App.peek(p.id, 'tricky', {});
    const done = App.peek(p.id, 'done', {}), doneCount = Object.keys(done).length, stars = App.peek(p.id, 'stars', 0) || 0;
    const trick = Object.keys(tr).slice(0, 10);
    if(editing === p.id){
      return `<article class="panel player-card"><h3>Edit ${p.name}</h3><label class="field">Name<input id="editName" type="text" maxlength="24" value="${p.name.replace(/"/g, '&quot;')}"></label>`
        + `<div class="field">Age${ageChips('edit', p.age)}</div><div class="row start"><button class="btn go" data-g="save" data-id="${p.id}">Save</button><button class="btn" data-g="cancel">Cancel</button></div></article>`;
    }
    return `<article class="panel player-card${cur ? ' current' : ''}">
      <div class="pc-head"><span class="pl-face big">${p.name.charAt(0).toUpperCase()}</span><div><h3>${p.name}</h3><p class="muted">Age ${p.age} \u00b7 ${App.BAND_NAMES[App.band(p.age)]} path \u00b7 ${stars} star${stars === 1 ? '' : 's'} \u00b7 ${doneCount} course steps done</p></div>${cur ? '<span class="now-tag">Playing now</span>' : ''}</div>
      ${App.band(p.age) === 'little' ? littleSkills(p) : ''}
      <div class="skills"${App.band(p.age) === 'little' ? ' hidden' : ''}>${['add', 'sub', 'mul', 'div'].map(op => { const r = sk[op], o = st[op]; return `<div class="sk op-${op}"><span class="sk-name"><b>${OPS[op].sym}</b> ${OPS[op].name}</span><span class="sk-bar"><i style="width:${Math.round((r - 1) / 3.95 * 100)}%"></i></span><span class="sk-lvl">${levelWord(r)}${o && o.total ? ` \u00b7 ${Math.round(o.right / o.total * 100)}% right of ${o.total}` : ' \u00b7 not tried yet'}</span></div>`; }).join('')}</div>
      <p class="muted small">${trick.length ? 'Tricky facts the app keeps bringing back:' : 'No tricky facts yet. Facts that get missed show up here and come back in games until they stick.'}</p>
      ${trick.length ? `<div class="trick">${trick.map(t => `<span>${t}</span>`).join('')}</div>` : ''}
      <div class="row start">${cur ? '' : `<button class="btn primary" data-g="play" data-id="${p.id}">Play as ${p.name}</button>`}<button class="btn small" data-g="edit" data-id="${p.id}">Edit name or age</button><button class="btn small${removing === p.id ? ' danger' : ''}" data-g="remove" data-id="${p.id}">${removing === p.id ? `Tap again to remove ${p.name}` : 'Remove'}</button></div>
    </article>`;
  }
  function renderGrownups(){
    const list = App.profiles;
    $('#gPlayers').innerHTML = list.map(playerCard).join('') || '<p class="muted">No players yet. Add one below so the app can match each child\u2019s age.</p>';
    $('#gAddAges').innerHTML = ageChips('new', newAge);
  }
  function grownupsInit(){
    const root = $('#view-grownups');
    root.addEventListener('click', e => {
      const ag = e.target.closest('[data-age]');
      if(ag){
        const a = Number(ag.dataset.age);
        if(ag.dataset.ageFor === 'new') newAge = a;
        ag.parentElement.querySelectorAll('[data-age]').forEach(x => x.setAttribute('aria-pressed', String(x === ag)));
        sfx.tap(); return;
      }
      const b = e.target.closest('[data-g]'); if(!b) return;
      const act = b.dataset.g, id = b.dataset.id;
      if(act === 'play'){ App.setProfile(id); App.toast('Now playing: ' + App.profile().name); App.go('home'); }
      else if(act === 'edit'){ editing = id; renderGrownups(); }
      else if(act === 'cancel'){ editing = null; renderGrownups(); }
      else if(act === 'save'){
        const sel = root.querySelector('[data-age-for="edit"][aria-pressed="true"]');
        App.updateProfile(id, { name: $('#editName').value, age: sel ? Number(sel.dataset.age) : undefined });
        editing = null; App.toast('Saved'); renderGrownups();
      }
      else if(act === 'remove'){
        if(removing !== id){ removing = id; clearTimeout(removeTimer); removeTimer = setTimeout(() => { removing = null; renderGrownups(); }, 4000); renderGrownups(); return; }
        clearTimeout(removeTimer); removing = null; App.removeProfile(id); App.toast('Player removed'); renderGrownups();
      }
    });
    $('#gAddForm').addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#gName').value.trim();
      if(!name){ $('#gName').focus(); App.toast('Type a name first'); return; }
      App.addProfile(name, newAge);
      $('#gName').value = '';
      App.toast(`Added ${name}. Now playing as ${name}.`);
      renderGrownups();
    });
    App.on('grownups', { enter(){ editing = null; removing = null; renderGrownups(); } });
  }

  /* =========================================================
     Home: set up a player, then show what to do next
     ========================================================= */
  let homeAge = 7;
  function renderHome(){
    const p = App.profile(), box = $('#homeForYou');
    if(p.guest){
      box.innerHTML = `<form class="panel for-you setup" id="homeSetup"><div><p class="eyebrow">Start here</p><h2>Who\u2019s learning today?</h2><p class="muted">Pick an age so the lessons, games and quizzes start at the right level. Each child gets their own stars and progress.</p></div>`
        + `<label class="field">First name<input id="homeName" type="text" maxlength="24" placeholder="Name" autocomplete="off"></label>`
        + `<div class="field">Age${ageChips('home', homeAge)}</div><button class="btn primary big" type="submit">Let\u2019s go</button></form>`;
      return;
    }
    if(App.band(p.age) === 'little'){
      box.innerHTML = `<div class="panel for-you lt-home"><div><p class="eyebrow">Hi, ${p.name}! \u00b7 Age ${p.age}</p><h2>Let\u2019s play!</h2><p class="muted">Turn the sound on and pick a game. The voice tells you what to do.</p></div>`
        + `<div class="row start">${[['numbers', '1 2 3'], ['colors', 'Colors'], ['letters', 'A B C']].map(([t, label]) => `<button class="btn primary big" data-lt-go="${t}">${label}</button>`).join('')}</div></div>`;
      return;
    }
    const n = nextStep(p), tricky = App.trickyFor(null).length;
    box.innerHTML =`<div class="panel for-you"><div><p class="eyebrow">Hi, ${p.name}! \u00b7 Age ${p.age}</p><h2>${n ? 'Your next step' : 'Every course is done!'}</h2>`
      + `<p class="muted">${n ? `${n.c.name}: ${KIND[n.s.kind].toLowerCase()} \u201c${n.s.label}\u201d` : 'Play The Math Bridge on Just right to keep growing.'}</p></div>`
      + `<div class="row start">${n ? `<button class="btn primary big" data-h="next">Start</button>` : `<a class="btn primary big" href="#bridge">Play the bridge</a>`}`
      + `${tricky ? `<button class="btn big" data-h="tricky">Practice ${tricky} tricky fact${tricky > 1 ? 's' : ''}</button>` : ''}</div></div>`;
  }
  function homeInit(){
    const box = $('#homeForYou');
    box.addEventListener('click', e => {
      const ag = e.target.closest('[data-age]');
      if(ag){ homeAge = Number(ag.dataset.age); ag.parentElement.querySelectorAll('[data-age]').forEach(x => x.setAttribute('aria-pressed', String(x === ag))); sfx.tap(); return; }
      const lt = e.target.closest('[data-lt-go]');
      if(lt){ sfx.tap(); const t = lt.dataset.ltGo; App.go('little', () => App.modes.little.start(t, 'play')); return; }
      const b = e.target.closest('[data-h]'); if(!b) return;
      if(b.dataset.h === 'next'){ const n = nextStep(App.profile()); if(n) launchStep(n.c.id, n.i); }
      else if(b.dataset.h === 'tricky'){ App.go('cards', () => App.modes.cards.tricky('mix')); }
    });
    box.addEventListener('submit', e => {
      e.preventDefault();
      const name = ($('#homeName').value || '').trim();
      if(!name){ $('#homeName').focus(); App.toast('Type a name first'); return; }
      App.addProfile(name, homeAge);
      sfx.win(); App.toast(`Welcome, ${name}!`);
    });
    App.on('home', { enter(){ const svg = $('#homeScene'); if(svg && !svg.firstChild) drawStatic(svg, 6, 'h', 2); renderHome(); } });
    const rb = $('#resetBtn');
    let armed = null;
    rb.addEventListener('click', () => {
      const who = App.profile().guest ? 'this device' : App.profile().name;
      if(!armed){
        rb.textContent = `Tap again to erase ${App.profile().guest ? 'all' : who + '\u2019s'} stars and progress`;
        rb.classList.add('danger');
        armed = setTimeout(() => { armed = null; rb.textContent = 'Reset progress'; rb.classList.remove('danger'); }, 4000);
        return;
      }
      clearTimeout(armed); armed = null;
      App.PROFILE_KEYS.forEach(k => store.remove(k));
      App.resetStars();
      rb.textContent = 'Reset progress'; rb.classList.remove('danger');
      App.toast('Progress reset');
      App.show(App.current);
    });
  }

  [bridgeInit, cardsInit, quizInit, coursesInit, grownupsInit, homeInit].forEach(f => { try{ f(); }catch(e){ window.mbaReport && window.mbaReport(f.name, e); } });
  App.start();
})();
