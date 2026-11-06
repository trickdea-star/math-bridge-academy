/* Math Bridge Academy - narrated lesson videos (animated scenes + read-aloud) */
'use strict';
(function(){
  const App = window.MBA;
  const { $, store, sfx, say, hush, canSpeak, ICON, OPS } = App;
  const COL = { sky: 'var(--sky)', berry: 'var(--berry)', sun: 'var(--sun)', grass: 'var(--grass)', grape: 'var(--grape)', orange: 'var(--orange)' };

  /* Each scene: `say` is spoken and shown as the caption; `show` is the picture. */
  const LESSONS = [
    { id: 'add-counton', op: 'add', deck: 'add-10', title: 'Count On from the Big Number', sample: '2 + 7', scenes: [
      { say: 'Let\u2019s add 2 + 7.', show: { type: 'eq', lines: ['2 + 7 = ?'] } },
      { say: 'Here\u2019s a trick. Don\u2019t start at 2. Start with the bigger number, 7, and hold it in your head.', show: { type: 'eq', lines: ['<span class="dim">2</span> + <mark>7</mark>'] } },
      { say: 'Now count on 2 more. Eight\u2026 nine!', show: { type: 'line', from: 0, to: 12, start: 7, hops: [8, 9] } },
      { say: 'So 2 + 7 = 9.', show: { type: 'eq', lines: ['2 + 7 = <mark>9</mark>'] } },
      { say: 'Try 3 + 8. Start at 8, then count on 3: nine, ten, eleven!', show: { type: 'line', from: 0, to: 14, start: 8, hops: [9, 10, 11] } },
      { say: '3 + 8 = 11. Start with the big number, then count on the small one.', show: { type: 'eq', lines: ['3 + 8 = <mark>11</mark>'], note: 'Start big. Count on small.' } }
    ] },
    { id: 'add-make10', op: 'add', deck: 'add-make10', title: 'Make 10 to Add Fast', sample: '8 + 5', scenes: [
      { say: 'Ten is a super friendly number. Let\u2019s use it to solve 8 + 5.', show: { type: 'eq', lines: ['8 + 5 = ?'] } },
      { say: 'Here are 8 blue dots in a ten frame, and 5 red dots.', show: { type: 'tenframe', a: 8, b: 5, stage: 0 } },
      { say: 'The ten frame has 2 empty spots. Move 2 red dots over to fill it up.', show: { type: 'tenframe', a: 8, b: 5, stage: 1 } },
      { say: 'Now we have one full ten, and 3 dots left over. 10 + 3 = 13!', show: { type: 'tenframe', a: 8, b: 5, stage: 1, label: '10 + 3 = 13' } },
      { say: 'So 8 + 5 = 13. We split the 5 into 2 and 3.', show: { type: 'eq', lines: ['8 + 5', '8 + 2 + 3', '10 + 3 = <mark>13</mark>'] } },
      { say: 'Remember the ten friends: 1 and 9, 2 and 8, 3 and 7, 4 and 6, 5 and 5.', show: { type: 'chips', items: ['1 + 9', '2 + 8', '3 + 7', '4 + 6', '5 + 5'] } },
      { say: 'Try 9 + 6. Give 1 to the 9 to make 10. Then 10 + 5 = 15!', show: { type: 'tenframe', a: 9, b: 6, stage: 1, label: '10 + 5 = 15' } }
    ] },
    { id: 'add-doubles', op: 'add', deck: 'add-doubles', title: 'Doubles and Near Doubles', sample: '6 + 7', scenes: [
      { say: 'A double is a number added to itself, like 4 + 4. That makes 8.', show: { type: 'dots', groups: [{ n: 4, cols: 2 }, { n: 4, cols: 2 }], sep: '+', total: 8 } },
      { say: 'Doubles are easy to remember. Say them with me! 1 + 1 = 2, 2 + 2 = 4, 3 + 3 = 6, 4 + 4 = 8, 5 + 5 = 10.', show: { type: 'chips', items: ['1 + 1 = 2', '2 + 2 = 4', '3 + 3 = 6', '4 + 4 = 8', '5 + 5 = 10'] } },
      { say: 'And the bigger doubles: 6 + 6 = 12, 7 + 7 = 14, 8 + 8 = 16, 9 + 9 = 18.', show: { type: 'chips', items: ['6 + 6 = 12', '7 + 7 = 14', '8 + 8 = 16', '9 + 9 = 18', '10 + 10 = 20'] } },
      { say: 'Now the magic. What is 6 + 7? It\u2019s almost a double!', show: { type: 'eq', lines: ['6 + 7 = ?'] } },
      { say: '6 + 6 = 12. And 7 is one more than 6, so the answer is one more: 13!', show: { type: 'dots', groups: [{ n: 6, cols: 3 }, { n: 6, cols: 3 }, { n: 1, cols: 1, color: 'sun' }], sep: '+', total: 13 } },
      { say: 'Near doubles: find the double you know, then add one more.', show: { type: 'eq', lines: ['6 + 7', '6 + 6 + 1 = <mark>13</mark>'] } }
    ] },
    { id: 'sub-countup', op: 'sub', deck: 'sub-10', title: 'Count Up to Subtract', sample: '12 \u2212 9', scenes: [
      { say: 'Let\u2019s solve 12 \u2212 9.', show: { type: 'eq', lines: ['12 \u2212 9 = ?'] } },
      { say: 'Counting back 9 times is slow. Here\u2019s a faster way: count UP from 9 to 12.', show: { type: 'eq', lines: ['9 <span class="arrow">\u2192</span> 12'], note: 'How far apart are they?' } },
      { say: 'From 9, hop 1 to get to 10.', show: { type: 'line', from: 5, to: 15, start: 9, hops: [10] } },
      { say: 'From 10, hop 2 more to get to 12.', show: { type: 'line', from: 5, to: 15, start: 9, hops: [10, 12] } },
      { say: '1 hop and 2 hops make 3. So 12 \u2212 9 = 3!', show: { type: 'line', from: 5, to: 15, start: 9, hops: [10, 12], label: '1 + 2 = 3' } },
      { say: 'Count up when the numbers are close together, like 15 \u2212 13 or 21 \u2212 18.', show: { type: 'eq', lines: ['15 \u2212 13 = <mark>2</mark>', '21 \u2212 18 = <mark>3</mark>'] } }
    ] },
    { id: 'sub-take10', op: 'sub', deck: 'sub-20', title: 'Take Away 10, Give Some Back', sample: '15 \u2212 9', scenes: [
      { say: 'How about 15 \u2212 9?', show: { type: 'eq', lines: ['15 \u2212 9 = ?'] } },
      { say: '9 is almost 10, and taking away 10 is easy. 15 \u2212 10 = 5.', show: { type: 'line', from: 0, to: 16, start: 15, hops: [5] } },
      { say: 'But we took away one too many! So give 1 back. 5 + 1 = 6.', show: { type: 'line', from: 0, to: 16, start: 15, hops: [5, 6] } },
      { say: 'So 15 \u2212 9 = 6.', show: { type: 'eq', lines: ['15 \u2212 9 = <mark>6</mark>'], note: 'Take away 10, give 1 back.' } },
      { say: 'It works for 8 too. For 14 \u2212 8, take away 10 to get 4. You took 2 too many, so give 2 back: 6!', show: { type: 'line', from: 0, to: 16, start: 14, hops: [4, 6] } },
      { say: 'Take away 10, then give back the extra. Your brain can do it in one second!', show: { type: 'eq', lines: ['23 \u2212 9', '23 \u2212 10 + 1 = <mark>14</mark>'] } }
    ] },
    { id: 'mul-groups', op: 'mul', deck: 'mul-3', title: 'Times Means Groups Of', sample: '3 \u00d7 4', scenes: [
      { say: 'What does 3 \u00d7 4 mean? It means 3 groups of 4.', show: { type: 'eq', lines: ['3 \u00d7 4'], note: '3 groups of 4' } },
      { say: 'Here are 3 bags with 4 apples in each bag.', show: { type: 'dots', groups: [{ n: 4, cols: 2, color: 'berry' }, { n: 4, cols: 2, color: 'berry' }, { n: 4, cols: 2, color: 'berry' }] } },
      { say: 'You could count every apple, but skip counting is faster: 4, 8, 12!', show: { type: 'dots', groups: [{ n: 4, cols: 2, color: 'berry', label: 4 }, { n: 4, cols: 2, color: 'berry', label: 8 }, { n: 4, cols: 2, color: 'berry', label: 12 }] } },
      { say: 'So 3 \u00d7 4 = 12.', show: { type: 'eq', lines: ['3 \u00d7 4 = <mark>12</mark>'] } },
      { say: 'We can line them up in rows. This is called an array: 3 rows of 4.', show: { type: 'array', rows: 3, cols: 4, color: 'berry' } },
      { say: 'Turn it on its side and it\u2019s 4 rows of 3. Still 12! You can multiply in any order.', show: { type: 'array', rows: 4, cols: 3, color: 'sky' } },
      { say: 'So if you know 3 \u00d7 4, you also know 4 \u00d7 3. Two facts for the price of one!', show: { type: 'eq', lines: ['3 \u00d7 4 = 4 \u00d7 3 = <mark>12</mark>'] } }
    ] },
    { id: 'mul-easy', op: 'mul', deck: 'mul-5', title: 'Easy Tables: 2, 10 and 5', sample: '8 \u00d7 5', scenes: [
      { say: 'Some times tables are super easy. Let\u2019s learn three of them: 2, 10 and 5.', show: { type: 'chips', items: ['\u00d7 2', '\u00d7 10', '\u00d7 5'] } },
      { say: 'Times 2 is just a double. 2 \u00d7 7 is 7 + 7, which is 14.', show: { type: 'dots', groups: [{ n: 7, cols: 4 }, { n: 7, cols: 4 }], sep: '+', total: 14 } },
      { say: 'Times 10: just put a zero on the end. 6 \u00d7 10 = 60.', show: { type: 'eq', lines: ['6 \u00d7 10 = 6<mark>0</mark>'], note: 'Add a zero!' } },
      { say: 'Times 5 is half of times 10. 8 \u00d7 10 = 80, and half of 80 is 40. So 8 \u00d7 5 = 40.', show: { type: 'eq', lines: ['8 \u00d7 10 = 80', 'half of 80 = <mark>40</mark>'], note: 'so 8 \u00d7 5 = 40' } },
      { say: 'The 5 times table always ends in 5 or 0. 5, 10, 15, 20, 25, 30!', show: { type: 'chips', items: ['5', '10', '15', '20', '25', '30', '35', '40', '45', '50'] } },
      { say: 'Remember: double it for 2, add a zero for 10, and take half of the 10s for 5.', show: { type: 'chips', items: ['\u00d7 2 \u2192 double it', '\u00d7 10 \u2192 add a zero', '\u00d7 5 \u2192 half of \u00d7 10'] } }
    ] },
    { id: 'mul-nine', op: 'mul', deck: 'mul-9', title: 'The 9s Finger Trick', sample: '9 \u00d7 3', scenes: [
      { say: 'Your hands can do the 9 times table! Hold up all 10 fingers.', show: { type: 'fingers' } },
      { say: 'Let\u2019s do 9 \u00d7 3. Count to your 3rd finger from the left, and fold it down.', show: { type: 'fingers', down: 3 } },
      { say: 'Fingers on the left of the folded finger are tens. There are 2. Fingers on the right are ones. There are 7.', show: { type: 'fingers', down: 3, labels: true } },
      { say: '2 tens and 7 ones. So 9 \u00d7 3 = 27!', show: { type: 'eq', lines: ['9 \u00d7 3 = <mark>27</mark>'] } },
      { say: 'Try 9 \u00d7 7. Fold down finger 7. Six fingers on the left, three on the right: 63!', show: { type: 'fingers', down: 7, labels: true } },
      { say: 'One more trick: 9 times a number is 10 times the number, take away the number. 9 \u00d7 4 is 40 \u2212 4, which is 36.', show: { type: 'eq', lines: ['9 \u00d7 4', '40 \u2212 4 = <mark>36</mark>'] } }
    ] },
    { id: 'div-share', op: 'div', deck: 'div-2', title: 'Division Means Sharing', sample: '12 \u00f7 3', scenes: [
      { say: 'We have 12 cookies and 3 friends. If we share fairly, how many cookies does each friend get?', show: [{ type: 'eq', lines: ['12 \u00f7 3 = ?'] }, { type: 'cookies', n: 12 }] },
      { say: 'Let\u2019s hand them out one at a time, like dealing cards.', show: { type: 'share', total: 12, groups: 3 } },
      { say: 'Each friend gets 4 cookies. Nobody has more than anyone else. That\u2019s fair!', show: { type: 'share', total: 12, groups: 3, fast: true, counts: true } },
      { say: 'So 12 \u00f7 3 = 4.', show: { type: 'eq', lines: ['12 \u00f7 3 = <mark>4</mark>'] } },
      { say: 'The divide sign means: share into equal groups.', show: { type: 'eq', lines: ['\u00f7'], note: 'share into equal groups' } },
      { say: 'Try 10 \u00f7 2. Share 10 cookies between 2 friends. Each one gets 5!', show: { type: 'share', total: 10, groups: 2, counts: true } }
    ] },
    { id: 'div-family', op: 'div', deck: 'div-5', title: 'Use Times Tables to Divide', sample: '20 \u00f7 5', scenes: [
      { say: 'Here\u2019s the fastest way to divide: use multiplication backwards!', show: { type: 'text', text: 'Divide = times, backwards' } },
      { say: '3, 4 and 12 are a fact family. Together they make four facts.', show: { type: 'family', a: 3, b: 4, c: 12 } },
      { say: 'If you know 3 \u00d7 4 = 12, then you also know 12 \u00f7 3 = 4, and 12 \u00f7 4 = 3.', show: { type: 'family', a: 3, b: 4, c: 12, hl: [2, 3] } },
      { say: 'For 20 \u00f7 5, ask yourself: 5 times what makes 20?', show: { type: 'eq', lines: ['20 \u00f7 5 = ?', '5 \u00d7 <mark>?</mark> = 20'] } },
      { say: '5 \u00d7 4 = 20. So 20 \u00f7 5 = 4.', show: { type: 'eq', lines: ['5 \u00d7 <mark>4</mark> = 20', '20 \u00f7 5 = <mark>4</mark>'] } },
      { say: 'Every times table you learn is also a division table. Two for one!', show: { type: 'text', text: 'Learn \u00d7 and you get \u00f7 for free!' } }
    ] },
    { id: 'add-tens', op: 'add', deck: 'add-tens', minAge: 8, title: 'Add Tens, Then Ones', sample: '47 + 25', scenes: [
      { say: 'Big numbers? No problem. Let\u2019s add 47 + 25 in our heads.', show: { type: 'eq', lines: ['47 + 25 = ?'] } },
      { say: 'Split each number into tens and ones. 47 is 40 and 7. 25 is 20 and 5.', show: { type: 'eq', lines: ['47 = <mark>40</mark> + 7', '25 = <mark>20</mark> + 5'] } },
      { say: 'Add the tens first: 40 + 20 = 60.', show: { type: 'eq', lines: ['40 + 20 = <mark>60</mark>'], note: 'tens first' } },
      { say: 'Now add the ones: 7 + 5 = 12.', show: { type: 'eq', lines: ['7 + 5 = <mark>12</mark>'], note: 'then the ones' } },
      { say: 'Put them together: 60 + 12 = 72. So 47 + 25 = 72!', show: { type: 'eq', lines: ['60 + 12 = 72', '47 + 25 = <mark>72</mark>'] } },
      { say: 'Try 36 + 23. Tens: 30 + 20 = 50. Ones: 6 + 3 = 9. That makes 59!', show: { type: 'chips', items: ['30 + 20 = 50', '6 + 3 = 9', '50 + 9 = 59'] } }
    ] },
    { id: 'sub-jumps', op: 'sub', deck: 'sub-tens', minAge: 8, title: 'Subtract in Two Jumps', sample: '52 \u2212 17', scenes: [
      { say: 'Let\u2019s take on 52 \u2212 17.', show: { type: 'eq', lines: ['52 \u2212 17 = ?'] } },
      { say: 'Split 17 into 10 and 7. We will jump back 10, then jump back 7.', show: { type: 'eq', lines: ['17 = <mark>10</mark> + <mark>7</mark>'] } },
      { say: 'Jump back 10 from 52 to land on 42. Then jump back 7 to land on 35.', show: { type: 'line', from: 33, to: 53, start: 52, hops: [42, 35] } },
      { say: 'Taking 7 from 42 is easier in two small jumps: back 2 to 40, then back 5 to 35.', show: { type: 'line', from: 34, to: 44, start: 42, hops: [40, 35] } },
      { say: 'So 52 \u2212 17 = 35.', show: { type: 'eq', lines: ['52 \u2212 17 = <mark>35</mark>'], note: 'Jump the tens, then the ones.' } },
      { say: 'Try 64 \u2212 28. Back 20 to 44, then back 8 to 36!', show: { type: 'chips', items: ['64 \u2212 20 = 44', '44 \u2212 8 = 36'] } }
    ] },
    { id: 'mul-double', op: 'mul', deck: 'mul-4', minAge: 8, title: 'Double It for 4s and 8s', sample: '4 \u00d7 6', scenes: [
      { say: 'Here\u2019s a trick for the 4 and 8 times tables: just keep doubling!', show: { type: 'chips', items: ['\u00d7 2 = double', '\u00d7 4 = double, double', '\u00d7 8 = double, double, double'] } },
      { say: '4 \u00d7 6. Double 6 is 12. Double 12 is 24.', show: { type: 'eq', lines: ['6 \u2192 12 \u2192 <mark>24</mark>'], note: 'double, then double again' } },
      { say: 'Here are 4 rows of 6. Count them up: 6, 12, 18, 24.', show: { type: 'array', rows: 4, cols: 6, color: 'sky' } },
      { say: '8 \u00d7 6. Double three times: 12, 24, 48!', show: { type: 'eq', lines: ['6 \u2192 12 \u2192 24 \u2192 <mark>48</mark>'], note: '8 \u00d7 6 = 48' } },
      { say: 'Try 4 \u00d7 7. Double 7 is 14. Double 14 is 28.', show: { type: 'eq', lines: ['4 \u00d7 7', '7 \u2192 14 \u2192 <mark>28</mark>'] } },
      { say: 'Double, double for 4. Double, double, double for 8. You\u2019ve got it!', show: { type: 'text', text: 'Keep doubling!' } }
    ] }
  ];
  App.LESSONS = LESSONS;

  /* ---------- scene pictures ---------- */
  const dot = (color, delay, moved) => `<i class="dot${moved ? ' moved' : ''}" style="--dc:${COL[color] || COL.sky};animation-delay:${delay}ms"></i>`;
  const cap = (text, delayMs) => text ? `<div class="v-cap" style="animation-delay:${delayMs}ms">${text}</div>` : '';
  const V = {
    eq(s){
      const lines = s.lines || [];
      return `<div class="v-eq${lines.length > 2 ? ' many' : ''}">${lines.map((l, i) => `<div class="eq-line" style="animation-delay:${i * 0.7}s">${l}</div>`).join('')}${s.note ? `<div class="v-note" style="animation-delay:${lines.length * 0.7}s">${s.note}</div>` : ''}</div>`;
    },
    text(s){ return `<div class="v-text">${s.text}</div>`; },
    chips(s){ return `<div class="v-chips">${s.items.map((t, i) => `<span style="animation-delay:${i * 0.3}s">${t}</span>`).join('')}</div>`; },
    dots(s){
      let k = 0;
      const parts = s.groups.map(g => {
        const cols = g.cols || Math.min(g.n, 5);
        let html = '';
        for(let i = 0; i < g.n; i++) html += dot(g.color || 'sky', (k++) * 80);
        const lbl = g.label != null ? `<b class="lbl" style="animation-delay:${k * 80 + 150}ms">${g.label}</b>` : '';
        return `<div class="bag"><div class="pile" style="--cols:${cols}">${html}</div>${lbl}</div>`;
      });
      const sep = s.sep ? `<span class="v-sep">${s.sep}</span>` : '';
      const total = s.total != null ? `<span class="v-sep">=</span><b class="v-total" style="animation-delay:${k * 80 + 300}ms">${s.total}</b>` : '';
      return `<div class="v-dots">${parts.join(sep)}${total}</div>`;
    },
    tenframe(s){
      const moved = s.stage ? Math.min(10 - s.a, s.b) : 0, rest = s.b - moved;
      let f1 = '', f2 = '';
      for(let i = 0; i < 10; i++){
        const inner = i < s.a ? dot('sky', i * 60) : i < s.a + moved ? dot('berry', (i - s.a) * 200, true) : '';
        f1 += `<span class="cell">${inner}</span>`;
      }
      for(let i = 0; i < 10; i++){
        const inner = i < rest ? dot('berry', (s.stage ? 0 : s.a * 60) + i * 60) : '';
        f2 += `<span class="cell">${inner}</span>`;
      }
      return `<div class="v-tf"><div class="frame">${f1}</div><span class="v-sep">+</span><div class="frame">${f2}</div>${cap(s.label, 1200)}</div>`;
    },
    line(s){
      const from = s.from, to = s.to, n = to - from, x0 = 50, x1 = 950, y = 190;
      const X = v => x0 + (v - from) * (x1 - x0) / n;
      let svg = `<svg class="v-line" viewBox="0 0 1000 260" role="img" aria-label="Number line from ${from} to ${to}">`;
      svg += `<line class="nl-axis" x1="${x0 - 22}" y1="${y}" x2="${x1 + 22}" y2="${y}"/>`;
      for(let v = from; v <= to; v++){
        const big = v % 5 === 0;
        svg += `<line class="nl-tick" x1="${X(v)}" y1="${y - (big ? 15 : 9)}" x2="${X(v)}" y2="${y + (big ? 15 : 9)}"/>`;
        if(n <= 24 || big) svg += `<text class="${v === s.start ? 'on' : ''}" x="${X(v)}" y="${y + 50}">${v}</text>`;
      }
      let prev = s.start, delay = 0.3;
      (s.hops || []).forEach(tgt => {
        const xa = X(prev), xb = X(tgt), mid = (xa + xb) / 2, ht = Math.min(125, 42 + Math.abs(xb - xa) * 0.3);
        const lab = (tgt > prev ? '+' : '\u2212') + Math.abs(tgt - prev);
        svg += `<path class="nl-hop" pathLength="1" d="M${xa} ${y - 8} Q${mid} ${y - 8 - ht * 2} ${xb} ${y - 8}" style="animation-delay:${delay}s"/>`;
        svg += `<text class="nl-hl" x="${mid}" y="${y - ht - 22}" style="animation-delay:${delay + 0.5}s">${lab}</text>`;
        svg += `<circle class="nl-land" cx="${xb}" cy="${y}" r="13" style="animation-delay:${delay + 0.6}s"/>`;
        prev = tgt; delay += 1.1;
      });
      svg += `<circle class="nl-start" cx="${X(s.start)}" cy="${y}" r="15"/></svg>`;
      return `<div class="v-linewrap">${svg}${cap(s.label, Math.round(delay * 1000))}</div>`;
    },
    array(s){
      const ds = s.rows > 4 ? 3.8 : 4.6;
      let html = '';
      for(let r = 0; r < s.rows; r++){
        for(let c = 0; c < s.cols; c++) html += dot(s.color || 'sky', r * 450 + c * 60);
        html += `<b class="rl" style="animation-delay:${r * 450 + s.cols * 60}ms">${(r + 1) * s.cols}</b>`;
      }
      return `<div class="v-arrwrap"><div class="v-arr" style="--cols:${s.cols};--ds:${ds}cqw">${html}</div>${cap(`${s.rows} rows of ${s.cols} = ${s.rows * s.cols}`, s.rows * 450 + 300)}</div>`;
    },
    cookies(s){ return `<div class="v-cookies">${Array.from({ length: s.n }, (_, i) => `<i class="cookie" style="animation-delay:${400 + i * 60}ms"></i>`).join('')}</div>`; },
    share(s){
      const colors = ['sky', 'berry', 'grass', 'grape', 'orange'], step = s.fast ? 90 : 300;
      const plates = Array.from({ length: s.groups }, () => []);
      for(let i = 0; i < s.total; i++) plates[i % s.groups].push(i);
      const html = plates.map((items, pi) => `<div class="plate">
        <svg class="friend" viewBox="0 0 60 60" aria-hidden="true"><circle class="fr" cx="30" cy="30" r="26" style="fill:${COL[colors[pi % colors.length]]}"/><circle class="fe" cx="22" cy="26" r="3.6"/><circle class="fe" cx="38" cy="26" r="3.6"/><path class="fm" d="M20 37 Q30 46 40 37"/></svg>
        <div class="dish">${items.map(i => `<i class="cookie" style="animation-delay:${200 + i * step}ms"></i>`).join('')}</div>
        ${s.counts ? `<b class="pc" style="animation-delay:${300 + s.total * step}ms">${items.length}</b>` : ''}
      </div>`).join('');
      return `<div class="v-share">${html}</div>`;
    },
    fingers(s){
      const down = s.down || 0, base = 200, H = [70, 92, 100, 92, 60, 60, 92, 100, 92, 70];
      let fingers = '', nums = '';
      for(let i = 0; i < 10; i++){
        const x = (i < 5 ? 40 : 400) + (i % 5) * 58, isDown = i + 1 === down, hgt = isDown ? 40 : H[i];
        let cls = 'finger';
        if(down && s.labels) cls += i + 1 < down ? ' tens' : i + 1 > down ? ' ones' : ' down';
        else if(isDown) cls += ' down';
        fingers += `<rect class="${cls}" x="${x}" y="${base - hgt + 18}" width="46" height="${hgt + 10}" rx="23"/>`;
        nums += `<text class="fnum" x="${x + 23}" y="${base + 48}">${i + 1}</text>`;
      }
      const svg = `<svg class="v-fingers" viewBox="0 0 720 290" role="img" aria-label="Ten fingers${down ? ', finger ' + down + ' folded down' : ''}">${fingers}<rect class="palm" x="30" y="${base}" width="300" height="72" rx="26"/><rect class="palm" x="390" y="${base}" width="300" height="72" rx="26"/>${nums}</svg>`;
      const lab = down && s.labels ? `<div class="v-cap"><span class="t-tens">${down - 1} tens</span> and <span class="t-ones">${10 - down} ones</span> = ${(down - 1) * 10 + (10 - down)}</div>` : '';
      return `<div class="v-fwrap">${svg}${lab}</div>`;
    },
    family(s){
      const { a, b, c } = s, hl = s.hl || [];
      const facts = [`${a} \u00d7 ${b} = ${c}`, `${b} \u00d7 ${a} = ${c}`, `${c} \u00f7 ${a} = ${b}`, `${c} \u00f7 ${b} = ${a}`];
      const tri = `<svg class="v-tri" viewBox="0 0 240 210" aria-hidden="true"><path class="tri" d="M120 14 L224 194 L16 194 Z"/><circle class="tc top" cx="120" cy="58" r="30"/><text x="120" y="69">${c}</text><circle class="tc" cx="66" cy="156" r="30"/><text x="66" y="167">${a}</text><circle class="tc" cx="174" cy="156" r="30"/><text x="174" y="167">${b}</text><text class="sym" x="120" y="167">\u00d7</text></svg>`;
      return `<div class="v-family">${tri}<ol>${facts.map((f, i) => `<li class="${hl.indexOf(i) >= 0 ? 'hl' : ''}" style="animation-delay:${i * 0.35}s">${f}</li>`).join('')}</ol></div>`;
    }
  };
  const one = s => (V[s.type] ? V[s.type](s) : '');
  const render = show => Array.isArray(show) ? `<div class="v-stack">${show.map(one).join('')}</div>` : one(show);

  /* ---------- player ---------- */
  const el = {};
  let L = null, idx = 0, playing = false, timer = null, token = 0;

  function paintPlay(){
    el.lpPlay.innerHTML = playing ? ICON.pause : ICON.play;
    el.lpPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play');
  }
  function renderScene(){
    const s = L.scenes[idx];
    el.lpStage.innerHTML = render(s.show);
    el.lpCap.textContent = s.say;
    el.lpCount.textContent = (idx + 1) + ' / ' + L.scenes.length;
    el.lpScrub.innerHTML = L.scenes.map((_, i) => `<button class="seg${i < idx ? ' done' : ''}${i === idx ? ' now' : ''}" data-seg="${i}" aria-label="Go to scene ${i + 1}"></button>`).join('');
    el.lpPrev.disabled = idx === 0;
    paintPlay();
  }
  function runScene(){
    clearTimeout(timer);
    const my = ++token;
    renderScene();
    const s = L.scenes[idx], words = s.say.split(/\s+/).length, est = 1500 + words * 420;
    const advance = () => { if(my === token && playing) next(); };
    if(canSpeak()){
      let finished = false;
      const fin = () => { if(finished || my !== token) return; finished = true; clearTimeout(timer); timer = setTimeout(advance, 1100); };
      say(s.say, fin);
      timer = setTimeout(fin, est + 5000); // backup in case the browser never reports the end of speech
    } else {
      timer = setTimeout(advance, est + 900);
    }
  }
  function stop(){ playing = false; token++; clearTimeout(timer); hush(); }
  function play(){
    if(!L) return;
    sfx.tap();
    playing = true; el.lpBig.hidden = true; el.lpEnd.hidden = true;
    runScene();
  }
  function pause(){ stop(); paintPlay(); }
  function next(){
    if(idx < L.scenes.length - 1){ idx++; if(playing) runScene(); else { token++; renderScene(); } }
    else finish();
  }
  function prev(){ if(idx > 0){ idx--; if(playing) runScene(); else renderScene(); } }
  function jump(i){ idx = i; el.lpBig.hidden = true; el.lpEnd.hidden = true; if(playing) runScene(); else renderScene(); }

  function finish(){
    stop(); paintPlay();
    el.lpScrub.querySelectorAll('.seg').forEach(s => { s.classList.add('done'); s.classList.remove('now'); });
    const done = store.get('lessonsDone', {}), first = !done[L.id];
    if(first){ done[L.id] = true; store.set('lessonsDone', done); App.addStars(1); }
    App.finishTask('lesson', L.id, true);
    sfx.win(); App.confetti(40);
    const nextL = LESSONS[LESSONS.indexOf(L) + 1];
    el.lpEnd.innerHTML = `<div class="panel result"><h3>Video done!</h3><p>${first ? 'You earned a star for watching.' : 'Great review!'} Now try the trick yourself.</p><div class="row">${App.courseBtn()}${L.deck ? '<button class="btn primary" data-act="practice">Practice with flash cards</button>' : ''}<button class="btn" data-act="again">Watch again</button>${nextL && !App.task ? '<button class="btn" data-act="nextvid">Next video</button>' : ''}</div></div>`;
    el.lpEnd.hidden = false;
    el.lpEnd.scrollIntoView({ behavior: App.reduced ? 'auto' : 'smooth', block: 'nearest' });
    say(first ? 'Video done! You earned a star.' : 'Video done!');
  }

  function renderList(){
    const done = store.get('lessonsDone', {});
    el.lessonGroups.innerHTML = ['add', 'sub', 'mul', 'div'].map(op => {
      const ls = LESSONS.filter(l => l.op === op);
      return `<div class="lgroup op-${op}"><h3><span class="opbadge">${OPS[op].sym}</span>${OPS[op].name}</h3><div class="lcards">${ls.map(l => `
        <button class="lcard" data-lesson="${l.id}">
          <span class="thumb"><span class="tsample">${l.sample}</span><span class="tplay">${ICON.play}</span></span>
          ${l.minAge ? `<span class="agetag">Ages ${l.minAge}+</span>` : ''}
          <span class="lbody"><b>${l.title}</b><small>${l.scenes.length} scenes \u00b7 about 1 minute${done[l.id] ? ' \u00b7 <span class="watched">Watched \u2713</span>' : ''}</small></span>
        </button>`).join('')}</div></div>`;
    }).join('');
  }
  function showList(){
    stop();
    renderList();
    el.learnList.hidden = false; el.learnPlayer.hidden = true;
  }
  function open(id){
    const l = LESSONS.find(x => x.id === id); if(!l) return;
    stop();
    L = l; idx = 0;
    el.learnList.hidden = true; el.learnPlayer.hidden = false;
    el.learnPlayer.className = 'op-' + l.op;
    el.lpTitle.textContent = l.title;
    el.lpEnd.hidden = true; el.lpBig.hidden = false;
    renderScene();
    window.scrollTo(0, 0);
  }

  function init(){
    ['learnList', 'learnPlayer', 'lessonGroups', 'lpTitle', 'lpStage', 'lpCap', 'lpBig', 'lpBigIcon', 'lpEnd', 'lpPrev', 'lpPlay', 'lpNext', 'lpScrub', 'lpCount', 'lpBack']
      .forEach(id => { el[id] = $('#' + id); });
    el.lpBigIcon.innerHTML = ICON.play;
    el.lpPrev.innerHTML = ICON.prev;
    el.lpNext.innerHTML = ICON.next;
    el.lessonGroups.addEventListener('click', e => { const b = e.target.closest('[data-lesson]'); if(b){ sfx.tap(); open(b.dataset.lesson); } });
    el.lpBig.addEventListener('click', play);
    el.lpPlay.addEventListener('click', () => { if(playing) pause(); else { if(!el.lpEnd.hidden) idx = 0; play(); } });
    el.lpNext.addEventListener('click', () => { el.lpBig.hidden = true; if(el.lpEnd.hidden) next(); });
    el.lpPrev.addEventListener('click', () => { el.lpBig.hidden = true; el.lpEnd.hidden = true; prev(); });
    el.lpScrub.addEventListener('click', e => { const b = e.target.closest('[data-seg]'); if(b) jump(Number(b.dataset.seg)); });
    el.lpBack.addEventListener('click', showList);
    el.lpEnd.addEventListener('click', e => {
      const a = e.target.closest('[data-act]'); if(!a) return;
      const act = a.dataset.act;
      if(act === 'again'){ idx = 0; play(); }
      else if(act === 'practice'){ const d = L.deck; App.go('cards', () => App.modes.cards.startDeck(d)); }
      else if(act === 'nextvid'){ const n = LESSONS[LESSONS.indexOf(L) + 1]; if(n){ open(n.id); play(); } }
    });
  }

  try{ init(); }catch(e){ window.mbaReport && window.mbaReport('videos', e); }
  App.on('learn', { enter: showList, leave: stop });
  App.modes.learn = { open };
})();
