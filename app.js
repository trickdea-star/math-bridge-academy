/* Math Bridge Academy - core: storage, sound, read-aloud, routing, problems and hints */
'use strict';
window.MBA = (function(){
  const $ = (s, root) => (root || document).querySelector(s);
  const $$ = (s, root) => Array.from((root || document).querySelectorAll(s));
  const rand = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  function shuffle(arr){
    const a = arr.slice();
    for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); const t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- icons ---------- */
  const ICON = {
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4.6v14.8L19.5 12z" fill="currentColor"/></svg>',
    pause: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4.5" height="14" rx="1.5" fill="currentColor"/><rect x="13.5" y="5" width="4.5" height="14" rx="1.5" fill="currentColor"/></svg>',
    prev: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="5" width="3" height="14" rx="1.2" fill="currentColor"/><path d="M19 5.5v13L9.5 12z" fill="currentColor"/></svg>',
    next: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="16" y="5" width="3" height="14" rx="1.2" fill="currentColor"/><path d="M5 5.5v13L14.5 12z" fill="currentColor"/></svg>',
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-star" d="M12 2.6l2.8 5.9 6.4.8-4.7 4.5 1.2 6.4L12 17.1l-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.8z"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path class="i-heart" d="M12 20.5s-7.6-4.5-9.4-9.2C1.4 8 3.4 4.8 6.6 4.8c2.2 0 3.7 1.3 5.4 3.3 1.7-2 3.2-3.3 5.4-3.3 3.2 0 5.2 3.2 4 6.5-1.8 4.7-9.4 9.2-9.4 9.2z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    lock: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" fill="none" stroke="currentColor" stroke-width="2.6"/></svg>',
    cards: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="5" width="13" height="10" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><rect x="8.5" y="9" width="13" height="10" rx="2" fill="currentColor"/></svg>',
    quiz: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="6.5" r="2" fill="currentColor"/><circle cx="5" cy="12" r="2" fill="currentColor"/><circle cx="5" cy="17.5" r="2" fill="currentColor"/><path d="M10 6.5h10M10 12h10M10 17.5h7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
    bridge: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8q10 7 20 0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M2.5 15h19" stroke="currentColor" stroke-width="3.4" stroke-dasharray="3 1.6"/><path d="M5 10v5M12 11.6v3.4M19 10v5" stroke="currentColor" stroke-width="1.6"/></svg>',
    sound: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.5 9h4l5-4v14l-5-4h-4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.6 6a8.6 8.6 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    voice: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-5 4v-4H4A1.5 1.5 0 0 1 2.5 15V6A1.5 1.5 0 0 1 4 4.5z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9h10M7 12.5h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  ICON.lesson = ICON.play;

  /* ---------- storage (this browser only) ---------- */
  const raw = {
    get(k, d){ try{ const v = localStorage.getItem('mba:' + k); return v == null ? d : JSON.parse(v); }catch(e){ return d; } },
    set(k, v){ try{ localStorage.setItem('mba:' + k, JSON.stringify(v)); }catch(e){} },
    remove(k){ try{ localStorage.removeItem('mba:' + k); }catch(e){} }
  };
  // Progress belongs to the player who is playing; settings belong to the device.
  const PROFILE_KEYS = ['stars', 'done', 'lessonsDone', 'decksDone', 'bridgeBest', 'quizBest', 'skill', 'tricky', 'stats', 'little'];
  let profiles = raw.get('profiles', []), currentId = raw.get('currentProfile', null);
  if(!profiles.some(p => p.id === currentId)) currentId = profiles.length ? profiles[0].id : 'guest';
  PROFILE_KEYS.forEach(k => { const old = raw.get(k, null); if(old != null){ if(raw.get('p:guest:' + k, null) == null) raw.set('p:guest:' + k, old); raw.remove(k); } });
  const pkey = k => PROFILE_KEYS.indexOf(k) >= 0 ? 'p:' + currentId + ':' + k : k;
  const store = {
    get(k, d){ return raw.get(pkey(k), d); },
    set(k, v){ raw.set(pkey(k), v); },
    remove(k){ raw.remove(pkey(k)); }
  };
  const settings = Object.assign({ sound: true, voice: true }, store.get('settings', {}));
  const saveSettings = () => store.set('settings', settings);

  /* ---------- players (each kid has a name, an age and their own progress) ---------- */
  const GUEST = { id: 'guest', name: 'Guest', age: 7, guest: true };
  const profile = () => profiles.find(p => p.id === currentId) || GUEST;
  const band = age => (age || 7) <= 4 ? 'little' : age <= 6 ? 'young' : age === 7 ? 'mid' : 'older';
  const BAND_NAMES = { little: 'Ages 2\u20134', young: 'Ages 5\u20136', mid: 'Age 7', older: 'Ages 8\u20139' };
  function setProfile(id){
    currentId = id; raw.set('currentProfile', id);
    stars = Number(store.get('stars', 0)) || 0;
    renderStars(false); renderProfile();
    if(current) show(current);
  }
  function addProfile(name, age){
    const id = 'k' + Date.now().toString(36);
    const first = profiles.length === 0;
    profiles.push({ id, name: String(name).trim().slice(0, 24) || 'Player', age: Number(age) || 7 });
    raw.set('profiles', profiles);
    // The first player keeps whatever was played before any player was set up.
    if(first) PROFILE_KEYS.forEach(k => { const v = raw.get('p:guest:' + k, null); if(v != null){ raw.set('p:' + id + ':' + k, v); raw.remove('p:guest:' + k); } });
    setProfile(id);
    return id;
  }
  function updateProfile(id, patch){
    const p = profiles.find(x => x.id === id); if(!p) return;
    const ageChanged = patch.age != null && Number(patch.age) !== p.age;
    if(patch.name != null) p.name = String(patch.name).trim().slice(0, 24) || p.name;
    if(patch.age != null) p.age = Number(patch.age) || p.age;
    raw.set('profiles', profiles);
    if(ageChanged) raw.remove('p:' + id + ':skill');
    if(id === currentId) setProfile(id);
  }
  function removeProfile(id){
    PROFILE_KEYS.forEach(k => raw.remove('p:' + id + ':' + k));
    profiles = profiles.filter(p => p.id !== id); raw.set('profiles', profiles);
    setProfile(profiles.length ? profiles[0].id : 'guest');
  }
  function renderProfile(){
    const b = $('#playerBtn'); if(!b) return;
    const p = profile();
    b.querySelector('.pl-face').textContent = p.guest ? '?' : p.name.charAt(0).toUpperCase();
    b.querySelector('.pl-name').textContent = p.guest ? 'Who\u2019s playing?' : p.name;
    b.setAttribute('aria-label', p.guest ? 'Set up a player' : 'Playing as ' + p.name + ', age ' + p.age + '. Switch player');
  }

  /* ---------- stars ---------- */
  let stars = Number(store.get('stars', 0)) || 0;
  function renderStars(pop){
    const n = $('#starCount'); if(n) n.textContent = stars;
    if(pop){ const p = $('#starPill'); if(p){ p.classList.remove('pop'); void p.offsetWidth; p.classList.add('pop'); } }
  }
  function addStars(n){ if(!n) return; stars += n; store.set('stars', stars); renderStars(true); }
  function resetStars(){ stars = 0; renderStars(false); }

  /* ---------- sound effects (Web Audio, no files) ---------- */
  let actx = null;
  function ac(){
    if(!actx){ try{ const C = window.AudioContext || window.webkitAudioContext; if(C) actx = new C(); }catch(e){ actx = null; } }
    if(actx && actx.state === 'suspended'){ actx.resume().catch(() => {}); }
    return actx;
  }
  function tone(freq, at, dur, type, vol, slideTo){
    const c = ac(); if(!c) return;
    const t0 = c.currentTime + at, o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t0);
    if(slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.15, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(at, dur, vol){
    const c = ac(); if(!c) return;
    const len = Math.floor(c.sampleRate * dur), buf = c.createBuffer(1, len, c.sampleRate), d = buf.getChannelData(0);
    for(let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain(), t0 = c.currentTime + at;
    src.buffer = buf; f.type = 'lowpass';
    f.frequency.setValueAtTime(2400, t0); f.frequency.exponentialRampToValueAtTime(300, t0 + dur);
    g.gain.value = vol || 0.4;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start(t0);
  }
  const sfx = {
    good(){ if(settings.sound){ tone(660, 0, .12, 'triangle', .16); tone(990, .1, .2, 'triangle', .16); } },
    bad(){ if(settings.sound){ tone(240, 0, .16, 'square', .06); tone(190, .14, .26, 'square', .06); } },
    step(){ if(settings.sound) tone(420, 0, .07, 'triangle', .12); },
    flip(){ if(settings.sound) tone(900, 0, .07, 'sine', .08, 1300); },
    creak(){ if(settings.sound) tone(150, 0, .35, 'sawtooth', .05, 90); },
    fall(){ if(settings.sound) tone(900, 0, .9, 'sine', .12, 120); },
    splash(){ if(settings.sound) noise(0, .7, .5); },
    win(){ if(settings.sound) [523, 659, 784, 1047].forEach((f, i) => tone(f, i * .12, .3, 'triangle', .15)); },
    tap(){ if(settings.sound) tone(700, 0, .04, 'sine', .06); },
    // Gentle sounds for the little ones: no buzzers.
    oops(){ if(settings.sound){ tone(392, 0, .12, 'triangle', .08); tone(330, .1, .2, 'triangle', .08); } },
    pop(){ if(settings.sound){ noise(0, .1, .18); tone(660, 0, .1, 'sine', .1, 1200); } },
    count(n){ if(settings.sound) tone(392 * Math.pow(2, Math.min(n - 1, 12) / 12 * 2), 0, .16, 'triangle', .13); }
  };

  /* ---------- read-aloud (browser speech) ---------- */
  const synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  let voice = null, speakTimer = null;
  const voiceWatchers = [];
  // Rank the device's voices so the most human-sounding one wins: neural "Natural" voices (Edge), iPhone
  // "Premium"/"Enhanced" downloads, Google voices. Novelty and old robotic voices sink to the bottom.
  const ROBOTIC = /fred|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|espeak|junior|ralph|kathy|grandma|grandpa|rocko|shelley|reed|sandy|eddy|flo\b/i;
  function voiceScore(v){
    const n = v.name || '';
    let s = 0;
    if(/natural|neural/i.test(n)) s += 100;
    if(/premium/i.test(n)) s += 95;
    if(/enhanced/i.test(n)) s += 70;
    if(/siri/i.test(n)) s += 60;
    if(/google/i.test(n)) s += 45;
    if(/\b(ava|zoe|samantha|allison|nicky|susan|evan|nathan|aria|jenny|ana|michelle|emma|libby|sonia|serena|karen|moira|tessa|guy|davis)\b/i.test(n)) s += 20;
    if(/en[-_]US/i.test(v.lang)) s += 10; else if(/en[-_](GB|AU|IE|CA|NZ)/i.test(v.lang)) s += 5;
    if(v.localService === false) s += 5;
    if(ROBOTIC.test(n)) s -= 300;
    return s;
  }
  const englishVoices = () => synth ? (synth.getVoices() || []).filter(v => /^en([-_]|$)/i.test(v.lang)).sort((a, b) => voiceScore(b) - voiceScore(a)) : [];
  function pickVoice(){
    if(!synth) return;
    const en = englishVoices();
    voice = (settings.voiceName && en.find(v => v.name === settings.voiceName)) || en[0] || null;
    voiceWatchers.forEach(f => { try{ f(); }catch(e){} });
  }
  if(synth){ pickVoice(); try{ synth.addEventListener('voiceschanged', pickVoice); }catch(e){ synth.onvoiceschanged = pickVoice; } }
  function setVoice(name){ settings.voiceName = name || ''; saveSettings(); pickVoice(); }
  const voiceInfo = () => ({ list: englishVoices().map(v => ({ name: v.name, lang: v.lang, natural: voiceScore(v) >= 45 })), current: voice ? voice.name : '', chosen: settings.voiceName || '' });
  function speakable(t){
    return String(t).replace(/<[^>]+>/g, '')
      .replace(/=\s*\?/g, ' equals what?')
      .replace(/\u00d7/g, ' times ').replace(/\u00f7/g, ' divided by ').replace(/\u2212/g, ' minus ')
      .replace(/\+/g, ' plus ').replace(/=/g, ' equals ')
      .replace(/\s+/g, ' ').trim();
  }
  /* ---------- the recorded natural voice: voice/index.json maps each sentence to an MP3 ---------- */
  let REC = null;
  const recMisses = new Set();
  try{ fetch('voice/index.json?v=a381acf5c9').then(r => r.ok ? r.json() : null).then(j => { if(j && j.clips){ REC = j; voiceWatchers.forEach(f => { try{ f(); }catch(e){} }); } }).catch(() => {}); }catch(e){}
  const recKey = s => s.toLowerCase().replace(/['\u2019]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
  const sentencesOf = s => (s.match(/[^.!?]+[.!?]*/g) || []).map(x => x.trim()).filter(Boolean);
  function numParts(n){
    n = Number(n);
    if(!(n >= 0) || n >= 1000 || n !== Math.floor(n)) return [null];
    if(n <= 100) return ['num:' + n];
    const h = n - n % 100, r = n % 100;
    return ['num:' + h].concat(r ? ['num:' + r] : []);
  }
  // "47 plus" and "25 equals what?" are recorded as phrases; above 100 the hundreds come first ("three hundred" + "47 plus").
  function chunk(n, kind, word){
    n = Number(n);
    if(!(n >= 0) || n >= 1000 || n !== Math.floor(n)) return [null];
    const id = r => kind === 'pre' ? 'pre:' + r + ' ' + word : 'post:' + r + ' ' + word;
    if(n <= 100) return [id(n)];
    const h = n - n % 100, r = n % 100;
    return ['num:' + h, r ? id(r) : (kind === 'pre' ? 'op:' + word : word === 'what' ? 'op:equals what' : 'op:equals')];
  }
  // A plan is the list of clips to play, with a short pause after each sentence. null = something isn't recorded.
  function recPlan(spoken){
    if(!REC || settings.natural === false) return null;
    const plan = [];
    for(const s of sentencesOf(spoken)){
      const f = REC.clips[recKey(s)];
      if(f){ plan.push({ f, gap: 0.28 }); continue; }
      const m = s.match(/^(\d+) (plus|minus|times|divided by) (\d+) equals (what\?|\d+)[.!]?$/i);
      if(m){
        const op = m[2].toLowerCase(), ask = /^what/i.test(m[4]);
        const ids = [].concat(chunk(m[1], 'pre', op), ask ? chunk(m[3], 'post', 'what') : chunk(m[3], 'post', 'eq').concat(numParts(m[4])));
        const fs = ids.map(id => id && REC.parts[id]);
        if(fs.every(Boolean)){ fs.forEach((x, i) => plan.push({ f: x, gap: i === fs.length - 1 ? 0.28 : 0.07 })); continue; }
      }
      recMisses.add(s);
      return null;
    }
    return plan.length ? plan : null;
  }
  const bufs = new Map();
  function loadClip(f){
    if(!bufs.has(f)){
      const c = ac();
      bufs.set(f, fetch('voice/' + f).then(r => { if(!r.ok) throw new Error('clip ' + r.status); return r.arrayBuffer(); })
        .then(b => new Promise((res, rej) => c.decodeAudioData(b, res, rej))));
      bufs.get(f).catch(() => bufs.delete(f));
    }
    return bufs.get(f);
  }
  let recToken = 0, recSources = [];
  function stopRec(){ recToken++; recSources.forEach(s => { try{ s.stop(); }catch(e){} }); recSources = []; }
  function playRec(plan, spoken, onend){
    const c = ac(); if(!c) return false;
    const my = ++recToken;
    Promise.all(plan.map(p => loadClip(p.f))).then(list => {
      if(my !== recToken) return;
      let t = c.currentTime + 0.04;
      list.forEach((b, i) => {
        const s = c.createBufferSource(); s.buffer = b; s.connect(c.destination); s.start(t);
        recSources.push(s);
        t += b.duration + plan[i].gap;
      });
      if(onend) setTimeout(() => { if(my === recToken) onend(); }, Math.max(0, (t - c.currentTime) * 1000));
    }).catch(() => { if(my === recToken) speakDevice(spoken, onend); });  // a clip didn't load: use the device voice
    return true;
  }
  const hasRec = () => !!REC;
  const canSpeak = () => !!((synth || REC) && settings.voice && settings.sound);
  function say(text, onend){
    if(!canSpeak()) return false;
    const spoken = speakable(text);
    const plan = recPlan(spoken);
    if(plan){ clearTimeout(speakTimer); if(synth){ try{ synth.cancel(); }catch(e){} } stopRec(); return playRec(plan, spoken, onend); }
    stopRec();
    return speakDevice(spoken, onend);
  }
  function speakDevice(spoken, onend){
    if(!synth) return false;
    try{
      clearTimeout(speakTimer);
      const busy = synth.speaking || synth.pending;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(spoken);
      if(voice) u.voice = voice;
      u.lang = (voice && voice.lang) || 'en-US';
      // Natural voices sound best at their own pitch; a raised pitch is what made the old ones sound like robots.
      u.rate = 0.95; u.pitch = 1;
      if(onend){ u.onend = onend; u.onerror = onend; }
      // iPhone and iPad only speak when speech starts inside a tap, so speak at once when nothing else is talking.
      if(!busy){ synth.speak(u); } else { speakTimer = setTimeout(() => synth.speak(u), 60); }
      return true;
    }catch(e){ return false; }
  }
  function hush(){ stopRec(); clearTimeout(speakTimer); if(synth){ try{ synth.cancel(); }catch(e){} } }
  // Unlock sound and speech on the first tap (needed on iPhone and iPad), and let the recorded voice
  // play even when an iPhone's ring/silent switch is set to silent.
  function unlockSpeech(){
    if(unlockSpeech.done) return;
    unlockSpeech.done = true;
    try{ if(navigator.audioSession) navigator.audioSession.type = 'playback'; }catch(e){}
    try{ ac(); }catch(e){}
    if(!synth) return;
    try{ const u = new SpeechSynthesisUtterance(' '); u.volume = 0; synth.speak(u); }catch(e){}
  }

  /* ---------- routing (#home, #learn, #bridge, #cards, #quiz, #courses) ---------- */
  const VIEWS = ['home', 'little', 'learn', 'bridge', 'cards', 'quiz', 'courses', 'grownups'];
  const hooks = {};
  let current = null, pending = null, task = null;
  function on(name, h){ hooks[name] = h; }
  function show(name){
    if(VIEWS.indexOf(name) < 0) name = 'home';
    if(current && hooks[current] && hooks[current].leave) hooks[current].leave();
    hush();
    VIEWS.forEach(v => { const el = $('#view-' + v); if(el) el.hidden = (v !== name); });
    $$('.nav a').forEach(a => {
      const here = a.dataset.view === name;
      a.classList.toggle('on', here);
      if(here) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    current = name;
    const p = pending; pending = null;
    if(!p || !p.keep) task = null;
    if(hooks[name] && hooks[name].enter) hooks[name].enter();
    if(p && p.fn) p.fn();
    window.scrollTo(0, 0);
  }
  function go(name, fn, keepTask){
    pending = { fn: fn || null, keep: !!keepTask };
    if(location.hash.slice(1) !== name) location.hash = name; else show(name);
  }
  // A course step launches a mode and remembers which step it was, so the mode can mark it done.
  function launch(t, view, fn){ task = t; go(view, fn, true); }
  function finishTask(kind, id, passed){
    if(!task || task.kind !== kind || task.id !== id || !passed) return false;
    const done = store.get('done', {}), key = task.course + ':' + task.step;
    if(!done[key]){ done[key] = true; store.set('done', done); }
    return true;
  }
  const isDone = (course, step) => !!store.get('done', {})[course + ':' + step];
  const courseBtn = () => task ? '<button class="btn go" data-act="course">Back to course</button>' : '';

  /* ---------- problems ---------- */
  const OPS = {
    add: { sym: '+', name: 'Adding' },
    sub: { sym: '\u2212', name: 'Subtracting' },
    mul: { sym: '\u00d7', name: 'Multiplying' },
    div: { sym: '\u00f7', name: 'Dividing' },
    mix: { sym: '+\u2212\u00d7\u00f7', name: 'Mixed' }
  };
  const LEVEL_NAMES = { 1: 'Easy', 2: 'Medium', 3: 'Hard', 4: 'Expert', auto: 'Just right' };
  function calc(op, a, b){ return op === 'add' ? a + b : op === 'sub' ? a - b : op === 'mul' ? a * b : a / b; }
  function fact(op, a, b, extra){ return Object.assign({ op, a, b, ans: calc(op, a, b), text: `${a} ${OPS[op].sym} ${b}` }, extra || {}); }
  function makeProblem(op, level){
    level = level || 1;
    if(op === 'mix') op = pick(['add', 'sub', 'mul', 'div']);
    let a, b;
    if(op === 'add'){
      if(level === 1){ a = rand(1, 9); b = rand(1, 10 - a); }
      else if(level === 2){ a = rand(4, 15); b = rand(2, 20 - a); }
      else if(level === 3){ a = rand(12, 69); b = rand(6, Math.min(29, 99 - a)); }
      else { a = rand(120, 499); b = rand(25, 299); }
    } else if(op === 'sub'){
      if(level === 1){ a = rand(3, 10); b = rand(1, a - 1); }
      else if(level === 2){ a = rand(11, 20); b = rand(3, Math.min(12, a - 1)); }
      else if(level === 3){ a = rand(30, 99); b = rand(8, Math.min(49, a - 5)); }
      else { a = rand(200, 999); b = rand(45, Math.min(299, a - 20)); }
    } else if(op === 'mul'){
      const t = level === 1 ? pick([2, 5, 10]) : level === 2 ? pick([2, 3, 4, 5, 10]) : rand(3, 9);
      const k = level === 1 ? rand(1, 6) : level === 4 ? rand(11, 25) : rand(2, 10);
      if(Math.random() < .5){ a = t; b = k; } else { a = k; b = t; }
    } else {
      const t = level === 1 ? pick([2, 5, 10]) : level === 2 ? pick([2, 3, 4, 5, 10]) : rand(3, 9);
      const k = level === 1 ? rand(1, 6) : level === 4 ? rand(11, 20) : rand(2, 10);
      a = t * k; b = t;
    }
    return fact(op, a, b, { level });
  }

  /* ---------- the app learns each kid: a skill level per operation, plus the facts they miss ---------- */
  const START_SKILL = {
    2: { add: 1.0, sub: 1.0, mul: 1.0, div: 1.0 }, 3: { add: 1.0, sub: 1.0, mul: 1.0, div: 1.0 }, 4: { add: 1.0, sub: 1.0, mul: 1.0, div: 1.0 },
    5: { add: 1.0, sub: 1.0, mul: 1.0, div: 1.0 }, 6: { add: 1.4, sub: 1.2, mul: 1.0, div: 1.0 },
    7: { add: 2.0, sub: 1.8, mul: 1.3, div: 1.1 }, 8: { add: 2.9, sub: 2.7, mul: 2.2, div: 1.9 },
    9: { add: 3.4, sub: 3.2, mul: 2.8, div: 2.5 }
  };
  const skills = () => Object.assign({}, START_SKILL[profile().age] || START_SKILL[7], store.get('skill', {}));
  // Read another player's saved progress (for the grown-ups page).
  const peek = (id, k, d) => raw.get('p:' + id + ':' + k, d);
  const skillsFor = p => Object.assign({}, START_SKILL[p.age] || START_SKILL[7], peek(p.id, 'skill', {}));
  // A skill of 2.4 means Medium problems, with a 40% chance of a Hard one.
  function autoLevel(op){ const r = skills()[op] || 1, lo = Math.floor(r); return Math.min(4, Math.random() < r - lo ? lo + 1 : lo); }
  function trickyFor(op){
    const tr = store.get('tricky', {});
    return Object.keys(tr).map(k => tr[k]).filter(e => !op || op === 'mix' || e.op === op);
  }
  function nextProblem(op, level){
    const real = Array.isArray(op) ? pick(op) : op === 'mix' ? pick(['add', 'sub', 'mul', 'div']) : op;
    if(level !== 'auto') return makeProblem(real, level);
    const tr = trickyFor(real).filter(e => e.text.indexOf('?') < 0);
    if(tr.length && Math.random() < 0.3) return Object.assign({}, pick(tr), { level: Math.floor(skills()[real] || 1), retry: true });
    return makeProblem(real, autoLevel(real));
  }
  function record(p, ok){
    if(!p || !OPS[p.op] || p.op === 'mix') return;
    const s = skills(), r = s[p.op] || 1, lvl = p.level || Math.floor(r);
    s[p.op] = ok ? Math.min(4.95, r + (lvl >= Math.floor(r) ? 0.07 : 0.02)) : Math.max(1, r - (lvl <= Math.floor(r) ? 0.12 : 0.05));
    store.set('skill', s);
    const tr = store.get('tricky', {});
    if(!ok){
      const e = tr[p.text] || { op: p.op, a: p.a, b: p.b, ans: p.ans, text: p.text, n: 0 };
      ['tip', 'full', 'sayQ'].forEach(k => { if(p[k]) e[k] = p[k]; });
      e.n = Math.min(3, e.n + 1); tr[p.text] = e;
    } else if(tr[p.text]){
      tr[p.text].n -= 1; if(tr[p.text].n <= 0) delete tr[p.text];
    }
    store.set('tricky', tr);
    const st = store.get('stats', {}), o = st[p.op] || { right: 0, total: 0 };
    o.total++; if(ok) o.right++; st[p.op] = o; store.set('stats', st);
  }

  function choices(p, n){
    n = n || 4;
    const ans = p.ans, out = new Set([ans]);
    const c = [ans + 1, ans - 1, ans + 2, ans - 2, ans + 10, ans - 10];
    if(ans >= 100) c.push(ans + 100, ans - 100, ans + 20, ans - 20);
    if(p.op === 'add') c.push(Math.abs(p.a - p.b));
    if(p.op === 'sub') c.push(p.a + p.b);
    if(p.op === 'mul') c.push(p.a + p.b, ans + p.a, ans - p.a, ans + p.b, ans - p.b);
    if(p.op === 'div') c.push(p.b, ans * 2, p.a - p.b);
    const near = shuffle([ans + 1, ans - 1].filter(v => v >= 0));
    if(near.length) out.add(near[0]);
    shuffle(c.filter(v => Number.isInteger(v) && v >= 0 && v !== ans)).forEach(v => { if(out.size < n) out.add(v); });
    let guard = 0;
    while(out.size < n && guard++ < 60){ const v = ans + rand(-6, 6); if(v >= 0) out.add(v); }
    return shuffle(Array.from(out));
  }

  /* ---------- the "how to think about it" hint for any problem ---------- */
  const countOn = (start, n) => Array.from({ length: n }, (_, i) => start + i + 1).join(', ');
  const countBack = (start, n) => Array.from({ length: n }, (_, i) => start - i - 1).join(', ');
  function hint(p){
    if(p.tip) return p.tip;
    const a = p.a, b = p.b, ans = p.ans;
    if(p.op === 'add'){
      const big = Math.max(a, b), small = Math.min(a, b);
      if(small === 0) return `Adding 0 changes nothing. It stays ${big}.`;
      if(a === b && a <= 10) return `It\u2019s a double! ${a} + ${a} = ${ans}.`;
      if(Math.abs(a - b) === 1 && big <= 10) return `Near double: ${small} + ${small} = ${small * 2}, and 1 more is ${ans}.`;
      if(small <= 3) return `Start at ${big} and count on ${small}: ${countOn(big, small)}.`;
      if(big < 10 && ans > 10){ const need = 10 - big; return `Make 10: ${big} + ${need} = 10, then ${small - need} more makes ${ans}.`; }
      if(a >= 10 && b >= 10){
        const ta = a - a % 10, tb = b - b % 10, o = a % 10 + b % 10;
        return `Tens first: ${ta} + ${tb} = ${ta + tb}. Then ones: ${a % 10} + ${b % 10} = ${o}. ${ta + tb} + ${o} = ${ans}.`;
      }
      if(big >= 10 && big % 10 + small > 10){ const up = 10 - big % 10; return `${big} + ${up} = ${big + up}, then ${small - up} more makes ${ans}.`; }
      return `Start at ${big} and count on ${small} more to get ${ans}.`;
    }
    if(p.op === 'sub'){
      if(b === 0) return `Taking away 0 leaves ${a}.`;
      if(a === b) return 'Any number take away itself is 0.';
      if(b === 10) return `Take away 10: ${a} \u2212 10 = ${ans}.`;
      if((b === 9 || b === 8) && a >= 10){ const back = 10 - b; return `Take away 10 to get ${a - 10}, then give ${back} back: ${ans}.`; }
      if(ans <= 4) return `Count up from ${b} to ${a}: ${countOn(b, ans)}. That\u2019s ${ans} hop${ans > 1 ? 's' : ''}.`;
      if(b <= 3) return `Start at ${a} and count back ${b}: ${countBack(a, b)}.`;
      if(a >= 20 && b >= 10){ const t = b - b % 10, o = b % 10; return `Take away ${t} first: ${a} \u2212 ${t} = ${a - t}. Then take away ${o} more: ${ans}.`; }
      return `Think addition: ${b} + ? = ${a}. Since ${b} + ${ans} = ${a}, the answer is ${ans}.`;
    }
    if(p.op === 'mul'){
      if(a === 0 || b === 0) return 'Zero groups of anything is 0.';
      if(a === 1 || b === 1) return `One group of ${a === 1 ? b : a} is just ${ans}.`;
      const has = t => a === t || b === t, other = t => a === t ? b : a;
      if(has(10)) return `Times 10: put a zero on the end of ${other(10)}. That makes ${ans}.`;
      if(has(2)) return `Times 2 is a double: ${other(2)} + ${other(2)} = ${ans}.`;
      if(has(5)) return `Times 5 is half of times 10: ${other(5)} \u00d7 10 = ${other(5) * 10}, and half of that is ${ans}.`;
      if(has(9)) return `${other(9)} \u00d7 10 = ${other(9) * 10}. Take away one ${other(9)}: ${ans}.`;
      const step = Math.max(a, b), times = Math.min(a, b);
      if(step > 10){ const t = step - step % 10, o = step % 10; return `Split ${step} into ${t} and ${o}: ${t} \u00d7 ${times} = ${t * times}, ${o} \u00d7 ${times} = ${o * times}. Together that makes ${ans}.`; }
      return `Skip count by ${step}, ${times} times: ${Array.from({ length: times }, (_, i) => step * (i + 1)).join(', ')}.`;
    }
    if(p.op === 'div'){
      if(b === 1) return `Sharing into 1 group keeps all ${ans} together.`;
      if(ans > 10 && ans % 10){ const q1 = ans - ans % 10, p1 = q1 * b, p2 = a - p1; return `Split ${a} into ${p1} and ${p2}: ${p1} \u00f7 ${b} = ${q1}, ${p2} \u00f7 ${b} = ${ans - q1}. So the answer is ${ans}.`; }
      return `Think times: ${b} \u00d7 ? = ${a}. Since ${b} \u00d7 ${ans} = ${a}, the answer is ${ans}.`;
    }
    return '';
  }

  /* ---------- little celebrations ---------- */
  function confetti(n){
    if(reduced) return;
    const fx = $('#fx'); if(!fx) return;
    const colors = ['var(--sun)', 'var(--berry)', 'var(--sky)', 'var(--grass)', 'var(--grape)', 'var(--orange)'];
    for(let i = 0; i < (n || 70); i++){
      const s = document.createElement('i');
      s.className = 'cf';
      s.style.left = (Math.random() * 100) + 'vw';
      s.style.background = colors[i % colors.length];
      s.style.setProperty('--x', (Math.random() * 200 - 100).toFixed(0) + 'px');
      s.style.setProperty('--r', (Math.random() * 720 - 360).toFixed(0) + 'deg');
      s.style.setProperty('--d', (1.6 + Math.random() * 1.4).toFixed(2) + 's');
      s.style.animationDelay = (Math.random() * .4).toFixed(2) + 's';
      fx.appendChild(s);
      setTimeout(() => s.remove(), 3800);
    }
  }
  let toastT = null;
  function toast(msg){
    const t = $('#toast'); if(!t) return;
    t.textContent = msg; t.classList.add('show');
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
  }
  const PRAISE = ['Nice!', 'You got it!', 'Super!', 'Great thinking!', 'Awesome!', 'Way to go!', 'Brainy!', 'Yes!'];

  /* ---------- start-up ---------- */
  function start(){
    const si = $('#starIcon'); if(si) si.innerHTML = ICON.star;
    renderStars(false);
    const sb = $('#soundBtn'), vb = $('#voiceBtn');
    sb.innerHTML = ICON.sound; vb.innerHTML = ICON.voice;
    // Speaker = mute everything (narrator and effects). Speech bubble = narrator only.
    const paint = () => {
      sb.setAttribute('aria-pressed', String(settings.sound));
      sb.setAttribute('aria-label', settings.sound ? 'Mute all sound' : 'Turn sound back on');
      sb.title = settings.sound ? 'Mute all sound' : 'Sound is off';
      vb.setAttribute('aria-pressed', String(settings.voice && settings.sound));
      vb.setAttribute('aria-label', settings.voice && settings.sound ? 'Turn the narrator off' : 'Turn the narrator on');
      vb.title = settings.voice && settings.sound ? 'Narrator on' : 'Narrator off';
      vb.hidden = !synth && !(window.AudioContext || window.webkitAudioContext);
    };
    sb.addEventListener('click', () => {
      settings.sound = !settings.sound; saveSettings(); paint();
      if(settings.sound) sfx.tap(); else hush();
      toast(settings.sound ? 'Sound on' : 'All sound off, narrator too');
    });
    vb.addEventListener('click', () => {
      if(!settings.sound){ settings.sound = true; settings.voice = true; }
      else settings.voice = !settings.voice;
      saveSettings(); paint();
      if(!canSpeak()) hush();
      toast(canSpeak() ? 'Narrator on' : 'Narrator off');
    });
    paint();
    renderProfile();
    const pb = $('#playerBtn'); if(pb) pb.addEventListener('click', () => go('grownups'));
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlockSpeech, { once: true, capture: true }));

    document.addEventListener('click', e => {
      const back = e.target.closest('[data-act="course"]');
      if(back){ e.preventDefault(); go('courses'); return; }
      const same = e.target.closest('.nav a, .brand');
      if(same && same.dataset.view === current){ e.preventDefault(); show(current); }
    });
    // Number keys 1-4 pick an answer on desktop.
    document.addEventListener('keydown', e => {
      if(e.altKey || e.ctrlKey || e.metaKey || !/^[1-4]$/.test(e.key) || !current) return;
      const box = $('#view-' + current + ' .answers');
      if(!box || box.offsetParent === null) return;
      const b = box.querySelectorAll('.ans')[Number(e.key) - 1];
      if(b && !b.disabled){ e.preventDefault(); b.click(); }
    });
    window.addEventListener('hashchange', () => show(location.hash.slice(1)));
    try{ show(location.hash.slice(1) || 'home'); }catch(e){ window.mbaReport && window.mbaReport('start', e); }
    const note = $('#bootNote'); if(note && !note.classList.contains('err')) note.hidden = true;
  }

  return {
    $, $$, rand, pick, shuffle, reduced, ICON, store, settings, sfx, say, hush, canSpeak,
    addStars, resetStars, on, go, show, launch, finishTask, isDone, courseBtn,
    get task(){ return task; }, get current(){ return current; },
    get profiles(){ return profiles.slice(); }, profile, band, BAND_NAMES, setProfile, addProfile, updateProfile, removeProfile, PROFILE_KEYS,
    skills, skillsFor, peek, trickyFor, nextProblem, record,
    voiceInfo, setVoice, onVoices(f){ voiceWatchers.push(f); },
    hasRec, setNatural(on){ settings.natural = !!on; saveSettings(); }, recMisses: () => Array.from(recMisses),
    OPS, LEVEL_NAMES, fact, makeProblem, choices, hint, confetti, toast, PRAISE, start, modes: {}
  };
})();
