(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ROLES = TarotEngine.ROLES;
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
    if (TarotEngine.detectSafety(q) === 'crisis') {
      $('askError').textContent = 'I will not read cards for this. If you are thinking about harming yourself, please contact your local emergency number or a crisis line right now. You do not have to face this alone.';
      $('askError').hidden = false;
      return;
    }
    $('askError').hidden = true;
    state.question = q;
    startGalaxy();
  });
  $('question').addEventListener('input', () => { $('askError').hidden = true; $('askError').textContent = 'Whisper your question to the stars first…'; });

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
    const hand = state.picks.map((idx) => ({ card: state.deck[idx], reversed: state.deck[idx].reversed_ }));
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
        <div class="pos">${ROLES[i].name}</div>
        <div class="flip" id="flip${i}"><div class="flip-inner"><div class="back"></div>${faceHTML(h.card, h.reversed)}</div></div>
        <p class="cname">${esc(h.card.name)}${h.reversed ? ' <em>reversed</em>' : ''}</p>
      </div>`).join('');
    show('viewReveal');
    await sleep(900);
    for (let i = 0; i < hand.length; i++) {
      $('flip' + i).classList.add('open');
      await sleep(1200);
    }
    const r = TarotEngine.read(hand, state.question);
    const s = $('summary');
    s.innerHTML = reportHTML(r);
    s.className = 'summary ' + r.cls;
    s.hidden = false;
    $('actions').hidden = false;
    state.phase = 'DONE';
    state.reading = plainReading(r);
    s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  }

  // ---------- report (verdict first, then the story) ----------
  function reportHTML(r) {
    const cards = r.cards.map((c) => `
      <section class="rc">
        <h4>Card ${c.num} — ${esc(c.role)}</h4>
        <p class="cn">${esc(c.name)} · ${c.orient}</p>
        <p>${esc(c.text)}</p>
      </section>`).join('');
    let timing = '';
    if (r.timing) {
      timing = `<section class="rc"><h4>Timing</h4>
        ${r.timing.outcome ? `<p class="tl"><span>Outcome</span><b>${esc(r.timing.outcome)}</b></p>` : ''}
        <p class="tl"><span>Timing</span><b>${esc(r.timing.label)}</b></p>
        <p>${esc(r.timing.text)}</p></section>`;
    }
    const note = r.safety ? `<p class="safety">${esc(TarotEngine.safetyMessage(r.safety))}</p>` : '';
    return `
      <p class="vlabel">${r.symbolic ? 'Symbolic verdict' : 'Verdict'}</p>
      <h3 class="vhead">${esc(r.verdict)}</h3>
      <div class="strength">
        <span>Reading Strength</span><b>${r.strength}%</b>
        <div class="bar" role="img" aria-label="Reading strength ${r.strength} percent"><i style="width:${r.strength}%"></i></div>
      </div>
      <p class="vline">${esc(r.oneLine)}</p>
      ${note}
      ${cards}
      <section class="rc why"><h4>Why this verdict</h4><p>${esc(r.why)}</p></section>
      ${timing}
      <p class="disc">Reading Strength shows how strongly the three cards support the verdict. It is not the probability that the event will happen. For reflection and entertainment only.</p>`;
  }
  function plainReading(r) {
    return [
      `Question: ${state.question}`,
      `VERDICT: ${r.verdict}`,
      `READING STRENGTH: ${r.strength}%`,
      r.oneLine,
      ...r.cards.map((c) => `CARD ${c.num} — ${c.role.toUpperCase()}: ${c.name} (${c.orient})\n${c.text}`),
      `WHY THIS VERDICT\n${r.why}`,
      r.timing ? `TIMING\n${r.timing.outcome ? 'OUTCOME: ' + r.timing.outcome + '\n' : ''}TIMING: ${r.timing.label}\n${r.timing.text}` : '',
      r.safety ? TarotEngine.safetyMessage(r.safety) : '',
    ].filter(Boolean).join('\n\n');
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
