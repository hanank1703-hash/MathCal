(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const POSITIONS = ['Past', 'Present', 'Future'];
  const REVERSAL_CHANCE = 0.3;

  const state = { phase: 'ASK', question: '', picks: [], deck: [] };

  // ---------- helpers ----------
  function randInt(n) {
    const buf = new Uint32Array(1);
    const limit = Math.floor(0x100000000 / n) * n;
    do { crypto.getRandomValues(buf); } while (buf[0] >= limit);
    return buf[0] % n;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = randInt(i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 50) : ms));
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function show(view) {
    document.querySelectorAll('.view').forEach((v) => v.classList.remove('active'));
    $(view).classList.add('active');
    window.scrollTo(0, 0);
  }

  // ---------- starfield ----------
  const canvas = $('stars');
  const ctx = canvas.getContext('2d');
  let stars = [], shooting = [], W = 0, H = 0;
  function initStars() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.round((W * H) / (W < 700 ? 9000 : 6000));
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.2, a: Math.random() * Math.PI * 2, s: Math.random() * 0.02 + 0.004,
      hue: Math.random() < 0.2 ? 45 : Math.random() < 0.5 ? 260 : 200,
    }));
  }
  function drawStars() {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      s.a += s.s;
      const o = 0.35 + 0.65 * Math.abs(Math.sin(s.a));
      ctx.fillStyle = `hsla(${s.hue},80%,85%,${o})`;
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 6.283); ctx.fill();
    }
    if (!reduceMotion && Math.random() < 0.004) {
      shooting.push({ x: Math.random() * W, y: Math.random() * H * 0.5, vx: 7 + Math.random() * 4, vy: 3 + Math.random() * 2, life: 1 });
    }
    shooting = shooting.filter((m) => m.life > 0);
    for (const m of shooting) {
      m.x += m.vx; m.y += m.vy; m.life -= 0.02;
      const g = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 9, m.y - m.vy * 9);
      g.addColorStop(0, `rgba(255,240,200,${m.life})`); g.addColorStop(1, 'rgba(255,240,200,0)');
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(m.x - m.vx * 9, m.y - m.vy * 9); ctx.stroke();
    }
    requestAnimationFrame(drawStars);
  }
  addEventListener('resize', initStars);
  initStars();
  drawStars();

  // ---------- 1 · ask ----------
  $('askForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const q = $('question').value.trim();
    if (!q) { $('askError').hidden = false; $('question').focus(); return; }
    $('askError').hidden = true;
    state.question = q;
    startGalaxy();
  });
  $('question').addEventListener('input', () => { $('askError').hidden = true; });

  // ---------- 2 · galaxy ----------
  const galaxyEl = $('galaxy');
  let cardEls = [];
  let angle = 0, hovering = false, raf = 0, lastT = 0;
  const ARMS = 6;

  function startGalaxy() {
    state.phase = 'GALAXY';
    state.picks = [];
    state.deck = shuffle(buildDeck()).map((c) => ({ ...c, reversed_: Math.random() < REVERSAL_CHANCE }));
    $('askedText').textContent = state.question;
    $('pickCount').textContent = '0';
    galaxyEl.classList.remove('dim'); document.querySelector('.galaxy-top').classList.remove('dim');
    document.querySelectorAll('.slot').forEach((s) => { s.classList.remove('filled'); s.querySelectorAll('.back').forEach((b) => b.remove()); });

    galaxyEl.innerHTML = '';
    cardEls = state.deck.map((card, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'gcard';
      b.setAttribute('aria-label', 'Face-down card ' + (i + 1) + ' of 78');
      b.innerHTML = '<div class="back"></div>';
      b.addEventListener('click', () => pick(i));
      b.addEventListener('pointerenter', () => { hovering = true; });
      b.addEventListener('pointerleave', () => { hovering = false; });
      galaxyEl.appendChild(b);
      return b;
    });
    show('viewGalaxy');
    // opening swirl: cards spiral outward from the core
    const t0 = performance.now();
    const intro = reduceMotion ? 0 : 1800;
    cancelAnimationFrame(raf);
    lastT = t0;
    const loop = (t) => {
      const dt = Math.min(t - lastT, 50); lastT = t;
      if (!hovering && !reduceMotion) angle += dt * 0.00005;
      layoutGalaxy(Math.min(1, (t - t0) / intro || 1), t - t0);
      if (state.phase === 'GALAXY' || state.phase === 'PICKING') raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
  }

  function layoutGalaxy(progress, elapsed) {
    const w = galaxyEl.clientWidth, h = galaxyEl.clientHeight;
    const cx = w / 2, cy = h / 2;
    const rx = w / 2 - 36, ry = h / 2 - 50;
    const ease = 1 - Math.pow(1 - progress, 3);
    const spin = (1 - ease) * 6;
    const perArm = Math.ceil(cardEls.length / ARMS);
    cardEls.forEach((el, i) => {
      const arm = i % ARMS, idx = Math.floor(i / ARMS);
      const t = idx / (perArm - 1);
      const r = (0.14 + 0.86 * t) * ease;
      const th = arm * (Math.PI * 2 / ARMS) + t * 2.6 + angle + spin;
      const bob = Math.sin(elapsed / 900 + i) * 3;
      const x = cx + Math.cos(th) * rx * r;
      const y = cy + Math.sin(th) * ry * r + bob;
      el.style.transform = `translate(${x}px, ${y}px) rotate(${(th * 57.3 + 90) % 360}deg) scale(${0.5 + 0.5 * ease})`;
    });
  }

  function pick(i) {
    if (state.picks.length >= 3 || state.picks.includes(i)) return;
    state.phase = 'PICKING';
    state.picks.push(i);
    const n = state.picks.length;
    $('pickCount').textContent = n;
    const el = cardEls[i];
    flyToSlot(el, n - 1);
    el.classList.add('picked');
    el.tabIndex = -1;
    if (n === 3) {
      cardEls.forEach((c) => c.classList.add('locked'));
      finishPicking();
    }
  }

  function flyToSlot(el, slotIndex) {
    const slot = document.querySelector(`.slot[data-i="${slotIndex}"]`);
    const from = el.getBoundingClientRect();
    const to = slot.getBoundingClientRect();
    const clone = document.createElement('div');
    clone.className = 'back';
    Object.assign(clone.style, { position: 'fixed', left: from.left + 'px', top: from.top + 'px', width: from.width + 'px', height: from.height + 'px', zIndex: 30, pointerEvents: 'none' });
    document.body.appendChild(clone);
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const s = to.width / from.width;
    const anim = clone.animate(
      [{ transform: 'none', boxShadow: '0 0 30px 8px #f2d28b' }, { transform: `translate(${dx}px, ${dy}px) scale(${s})`, boxShadow: '0 0 12px 2px #f2d28b' }],
      { duration: reduceMotion ? 1 : 700, easing: 'cubic-bezier(.3,.7,.2,1)', fill: 'forwards' }
    );
    anim.onfinish = () => {
      clone.remove();
      const b = document.createElement('div');
      b.className = 'back';
      slot.appendChild(b);
      slot.classList.add('filled');
    };
  }

  async function finishPicking() {
    await sleep(1100);
    galaxyEl.classList.add('dim'); document.querySelector('.galaxy-top').classList.add('dim');
    await sleep(900);
    cancelAnimationFrame(raf);
    state.phase = 'REVEAL';
    const hand = state.picks.map((idx, k) => ({ card: state.deck[idx], position: POSITIONS[k], reversed: state.deck[idx].reversed_ }));
    await showShock(hand);
    await reveal(hand);
  }

  // ---------- 3 · shock + reveal ----------
  function shockLine(hand) {
    const names = hand.map((h) => h.card.name);
    const majors = hand.filter((h) => h.card.arcana === 'major').length;
    const special = {
      'The Tower': 'The Tower?! Something is about to be shaken to its very foundations…',
      'Death': 'Death has surfaced, and not as you fear. A great transformation has been summoned…',
      'The Devil': 'The Devil stares back at you. The universe wants you to see what binds you…',
      'The Sun': 'The Sun blazes in your spread. Rarely does the universe speak this brightly…',
      'The World': 'The World itself has answered. A grand cycle is closing around you…',
      'The Star': 'The Star shines through. The cosmos is guiding you very directly…',
    };
    const hit = names.find((n) => special[n]);
    if (hit) return special[hit];
    if (majors === 3) return 'Oh my… all three are Major Arcana. This almost never happens. Destiny is in the room.';
    if (majors === 2) return 'Oh my… two Major Arcana have chosen you. This is no ordinary reading.';
    if (hand.filter((h) => h.reversed).length >= 2) return 'Oh my… the cards fell turned. What is hidden is about to surface.';
    const lines = [
      'Oh my… you have drawn something truly shocking.',
      'Oh my… the universe did not hold back. Brace yourself.',
      'Oh my… these three did not come together by chance.',
    ];
    return lines[randInt(lines.length)];
  }
  async function showShock(hand) {
    $('shockText').textContent = shockLine(hand);
    $('shock').hidden = false;
    await sleep(3600);
    $('shock').hidden = true;
  }

  function faceHTML(card, reversed) {
    const art = card.arcana === 'major'
      ? `<span class="glyph" aria-hidden="true">${card.glyph}</span>`
      : SUIT_SVG[card.suitIndex];
    return `<div class="face${reversed ? ' rev' : ''}${card.arcana === 'minor' ? ' s' + card.suitIndex : ''}">
      <div class="num">${card.numeral}</div><div class="art">${art}</div><div class="nm">${esc(card.name)}</div></div>`;
  }

  async function reveal(hand) {
    const grid = $('revealGrid');
    $('askedText2').textContent = state.question;
    $('summary').hidden = true; $('actions').hidden = true;
    grid.innerHTML = hand.map((h, i) => `
      <div class="rcol">
        <div class="pos">${h.position}</div>
        <div class="flip" id="flip${i}"><div class="flip-inner"><div class="back"></div>${faceHTML(h.card, h.reversed)}</div></div>
        <div class="meaning" id="mean${i}">
          <h3>${esc(h.card.name)}</h3>
          <p class="orient">${h.reversed ? 'Reversed' : 'Upright'}</p>
          <p class="kw">${h.card.keywords.map(esc).join(' · ')}</p>
          <p class="txt">${esc(positionText(h))}</p>
        </div>
      </div>`).join('');
    show('viewReveal');
    await sleep(900);
    for (let i = 0; i < hand.length; i++) {
      $('flip' + i).classList.add('open');
      await sleep(1100);
      $('mean' + i).classList.add('show');
      await sleep(1400);
    }
    const s = $('summary');
    s.innerHTML = summaryHTML(hand);
    s.hidden = false;
    $('actions').hidden = false;
    state.phase = 'DONE';
    state.reading = plainReading(hand);
    s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  }

  const FRAMING = {
    Past: 'Behind you: ',
    Present: 'Right now: ',
    Future: 'Ahead of you: ',
  };
  function positionText(h) {
    return FRAMING[h.position] + (h.reversed ? h.card.reversed : h.card.upright);
  }

  // ---------- combined reading ----------
  const TOPICS = [
    ['love', /\b(love|relationship|partner|boyfriend|girlfriend|crush|ex|marriage|marry|dating|romance|heart|date)\b/i, 'matters of the heart'],
    ['career', /\b(job|career|work|boss|promotion|business|interview|study|exam|school|project|goal)\b/i, 'your work and ambitions'],
    ['money', /\b(money|finance|financial|debt|salary|invest|rich|buy|house|savings|income)\b/i, 'money and security'],
    ['health', /\b(health|healing|sick|illness|body|anxiety|stress|sleep|mental|wellbeing)\b/i, 'your wellbeing'],
  ];
  function detectTopic(q) {
    for (const [key, re, label] of TOPICS) if (re.test(q)) return { key, label };
    return { key: 'general', label: 'this situation' };
  }
  const isYesNo = (q) => /^\s*(will|should|can|could|do|does|did|is|are|am|would|shall|have|has|was)\b/i.test(q);

  // Favourability of a card in its drawn orientation.
  function effTone(h) {
    const t = h.card.tone;
    if (!h.reversed) return t;
    return t === 0 ? -0.25 : -t * 0.5; // reversed good = delayed, reversed bad = easing
  }
  const adviceOf = (h) => (h.reversed ? h.card.adviceRev : h.card.advice);

  function verdict(hand, yesNo) {
    // Past counts least, the Future (outcome) counts most.
    const score = effTone(hand[0]) * 0.5 + effTone(hand[1]) * 1 + effTone(hand[2]) * 1.5;
    let key, head, line;
    if (score >= 1.5) { key = 'good'; head = yesNo ? 'Yes' : 'A strongly favourable outlook'; line = 'The cards line up in your favour. Move ahead with confidence.'; }
    else if (score >= 0.5) { key = 'good'; head = yesNo ? 'Leaning yes' : 'A favourable outlook'; line = 'The outlook is positive, so act on it, but stay attentive to the points below.'; }
    else if (score > -0.5) { key = 'mixed'; head = yesNo ? 'It depends on you' : 'A mixed outlook'; line = 'Nothing is settled. The result will follow the choices you make now.'; }
    else if (score > -1.5) { key = 'caution'; head = yesNo ? 'Not yet' : 'Proceed with caution'; line = 'There are obstacles. Prepare, adjust the plan and revisit this before committing.'; }
    else { key = 'caution'; head = yesNo ? 'Probably not as things stand' : 'A challenging outlook'; line = 'The current path is difficult. Change something important before pushing ahead.'; }
    return { key, head, line, score };
  }

  function readingData(hand) {
    const [p, n, f] = hand;
    const topic = detectTopic(state.question);
    const v = verdict(hand, isYesNo(state.question));
    const steps = [
      ['Now', n, adviceOf(n)],
      ['Next', f, adviceOf(f)],
      ['From your past', p, adviceOf(p)],
    ];
    const worst = hand.slice().sort((a, b) => effTone(a) - effTone(b))[0];
    const watch = effTone(worst) < 0
      ? `Be careful with ${worst.card.keywords[0]} (${worst.card.name}${worst.reversed ? ', reversed' : ''}).`
      : null;
    const why = `${p.card.name} (${p.position.toLowerCase()}) shows ${p.card.keywords[0]} shaped this. ${n.card.name} says ${n.card.keywords[0]} is what matters now${n.reversed ? ', though it is blocked or turned inward' : ''}. ${f.card.name} points to ${f.card.keywords[0]} as where this is heading${f.reversed ? ', but with delays or a lesson to learn first' : ''}.`;
    return { topic, v, steps, watch, why };
  }

  function summaryHTML(hand) {
    const d = readingData(hand);
    return `<h3>The Universe Says</h3>
      <div class="verdict ${d.v.key}"><span class="vlabel">${isYesNo(state.question) ? 'Answer' : 'Outlook'}</span><span class="vhead">${esc(d.v.head)}</span></div>
      <p class="vline">${esc(d.v.line)}</p>
      <p class="why">${esc(d.why)}</p>
      <h4>What to do</h4>
      <ol class="steps">${d.steps.map(([label, h, text]) => `<li><b>${label} · ${esc(h.card.name)}</b><span>${esc(text)}</span></li>`).join('')}</ol>
      ${d.watch ? `<p class="watch">${esc(d.watch)}</p>` : ''}
      <p class="disc">For reflection and entertainment only. Not a substitute for professional advice.</p>`;
  }
  function plainReading(hand) {
    const d = readingData(hand);
    return `Question: ${state.question}\n\n` +
      hand.map((h) => `${h.position}: ${h.card.name} (${h.reversed ? 'Reversed' : 'Upright'})\n${positionText(h)}`).join('\n\n') +
      `\n\n${isYesNo(state.question) ? 'Answer' : 'Outlook'}: ${d.v.head}. ${d.v.line}\n\n${d.why}\n\nWhat to do:\n` +
      d.steps.map(([l, h, t], i) => `${i + 1}. ${l} (${h.card.name}): ${t}`).join('\n') +
      (d.watch ? `\n\n${d.watch}` : '');
  }

  // ---------- actions ----------
  $('againBtn').addEventListener('click', () => {
    state.phase = 'ASK';
    $('question').value = '';
    show('viewAsk');
    $('question').focus();
  });
  $('shareBtn').addEventListener('click', async () => {
    const btn = $('shareBtn');
    try { await navigator.clipboard.writeText(state.reading || ''); btn.textContent = 'Copied ✓'; }
    catch { btn.textContent = 'Copy failed'; }
    setTimeout(() => { btn.textContent = 'Copy Reading'; }, 2000);
  });
})();
