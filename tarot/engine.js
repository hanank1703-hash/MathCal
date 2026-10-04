// Three-card verdict engine.
// QUESTION + CARD MEANING + POSITION + REVERSAL + INTERACTION + OUTCOME WEIGHT -> one verdict.
//
// Every card has four numbers: [upright value, reversed value, upright delay, reversed delay]
// Values run -2 (strongly against) to +2 (strongly for). Delay runs 0 to 1.
// Values are then adjusted for the question's domain (work, money, love, health).

const TarotEngine = (() => {
  'use strict';

  const ROLES = [
    { num: 1, name: 'Current Energy', weight: 0.2 },
    { num: 2, name: 'Deciding Influence', weight: 0.3 },
    { num: 3, name: 'Likely Outcome', weight: 0.5 },
  ];
  const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));

  // ---------- question analysis ----------
  const DOMAINS = {
    health: { re: /\b(health|healing|heal|recover\w*|sick|illness|body|anxiety|stress|sleep|mental|wellbeing|weight|energy)\b/i, label: 'your wellbeing' },
    love: { re: /\b(love|relationship|partner|boyfriend|girlfriend|husband|wife|crush|ex|marry|marriage|dating|date|romance|romantic|together|he|she|him|her|text|message|reconcile|commit\w*)\b/i, label: 'your relationship' },
    money: { re: /\b(money|finance|financial|salary|raise|pay|income|saving|savings|debt|rich|buy|house|property|rent|profit|revenue|sales)\b/i, label: 'your finances' },
    work: { re: /\b(job|career|work|offer|interview|promotion|boss|hire|hired|resume|application|apply|business|project|exam|study|school|college|admission|startup|client|deal|contract|launch|get in|accepted)\b/i, label: 'your career or opportunity' },
  };
  function detectDomain(q) {
    for (const k of ['health', 'love', 'money', 'work']) if (DOMAINS[k].re.test(q)) return k;
    return 'general';
  }
  const DOMAIN_LABEL = { work: DOMAINS.work.label, money: DOMAINS.money.label, love: DOMAINS.love.label, health: DOMAINS.health.label, general: 'this situation' };

  const SAFETY = [
    ['crisis', /\b(suicid\w*|kill myself|end my life|self[- ]harm|want to die|hurt myself)\b/i],
    ['medical', /\b(cancer|tumou?r|diagnos\w*|surgery|operation|chemo\w*|biopsy|medication|disease|pregnan\w*|miscarriage|conceive|conception|test results?|hospital|dying|die|death|survive|terminal)\b/i],
    ['legal', /\b(court|lawsuit|sue|lawyer|attorney|custody|divorce|trial|verdict|arrest\w*|prison|jail|visa|immigration|sentence|legal\w*)\b/i],
    ['financial', /\b(invest\w*|stocks?|crypto\w*|bitcoin|loan|mortgage|bankrupt\w*|lottery|gambl\w*|forex|trading)\b/i],
    ['safety', /\b(abus\w*|violen\w*|stalk\w*|danger\w*|unsafe|weapon|attack\w*)\b/i],
  ];
  function detectSafety(q) {
    for (const [k, re] of SAFETY) if (re.test(q)) return k;
    return null;
  }

  const TIMEFRAME = /\b(today|tonight|tomorrow|this (week|weekend|month|year)|next (week|weekend|month|year)|by (the )?(end of )?(the )?(week|month|year|friday|monday|tuesday|wednesday|thursday|saturday|sunday|january|february|march|april|may|june|july|august|september|october|november|december)|within (the next )?(a |an |one |two |three |four |five |six |\d+ )?(few )?(day|week|month|year)s?|in (a |an |one |two |three |four |five |six |\d+ )?(few )?(day|week|month|year)s?|soon)\b/i;
  const detectTimeframe = (q) => { const m = q.match(TIMEFRAME); return m ? m[0] : null; };

  // ---------- card values ----------
  const MAJOR_TUNE = {
    'The Fool': [1, 0, 0, 0.5], 'The Magician': [1.5, -0.5, 0, 0.3], 'The High Priestess': [0, -0.5, 0.5, 0.5],
    'The Empress': [1.5, -0.5, 0, 0.5], 'The Emperor': [1, -0.8, 0, 0.3], 'The Hierophant': [0.5, -0.3, 0.2, 0.3],
    'The Lovers': [1.5, -1, 0.2, 0.3], 'The Chariot': [1.5, -1, 0, 0.3], 'Strength': [1.2, -0.3, 0, 0.4],
    'The Hermit': [0, -0.5, 0.6, 0.5], 'Wheel of Fortune': [1.2, -0.7, 0, 0.6], 'Justice': [1, -1, 0.2, 0.4],
    'The Hanged Man': [-0.3, -0.5, 1, 0.6], 'Death': [-0.8, -0.5, 0.3, 0.7], 'Temperance': [1, -0.5, 0.4, 0.3],
    'The Devil': [-1.5, 0.5, 0, 0], 'The Tower': [-2, -0.8, 0, 0.6], 'The Star': [1.8, 0.3, 0.3, 0.5],
    'The Moon': [-1, 0.5, 0.5, 0], 'The Sun': [2, 1, 0, 0.5], 'Judgement': [1.2, -0.3, 0, 0.4], 'The World': [2, 0.5, 0, 0.7],
  };
  // Majors that read differently depending on what is being asked.
  const DOM_ADJ = {
    'The Lovers': { work: -0.7, money: -0.7, health: -0.8 },
    'The Empress': { love: 0.3, money: 0.3, health: 0.3 },
    'The Emperor': { love: -0.4, work: 0.3 },
    'The Hierophant': { love: 0.3 },
    'The Chariot': { love: -0.3, health: 0.2 },
    'The Magician': { love: -0.3 },
    'The Hermit': { love: -0.5 },
    'Strength': { health: 0.3 },
    'Temperance': { health: 0.4, money: 0.2 },
    'The Star': { health: 0.3, love: 0.2 },
    'Wheel of Fortune': { money: 0.2 },
    'The Devil': { love: -0.3 },
  };
  const RANK_TUNE = [
    [1.8, 0.3, 0, 0.7], [0.4, -0.3, 0.5, 0.6], [1.2, -0.6, 0, 0.4], [0.4, -0.2, 0.3, 0.3], [-1, 0.3, 0, 0.2],
    [1, -0.2, 0.2, 0.5], [0.2, -0.4, 0.4, 0.4], [1, -0.4, 0, 0.6], [0.8, -0.5, 0, 0.3], [0.3, -0.3, 0, 0.3],
    [0.8, -0.3, 0.2, 0.5], [0.6, -0.5, 0, 0.5], [1, -0.4, 0, 0.3], [1.2, -0.5, 0, 0.3],
  ];
  // Cards whose meaning departs from their rank. {t} = what the suit means for this question.
  const MINOR_OVERRIDE = {
    'Two of Cups': { kw: 'connection', t: [1.7, -0.5, 0, 0.5], up: 'A real meeting of minds and mutual attraction in {t}.', rev: 'Imbalance or a break in the connection in {t}.' },
    'Two of Swords': { kw: 'indecision', t: [-0.2, 0.3, 1, 0.3], up: 'A decision is being avoided in {t}, and nothing can move until it is made.', rev: 'The stalemate is breaking and hidden information is coming out in {t}.', note: 'a decision is still unresolved' },
    'Two of Wands': { kw: 'planning', t: [0.5, -0.3, 0.5, 0.5], up: 'Planning and weighing options in {t}, with the next move not yet made.', note: 'plans are still being weighed' },
    'Two of Pentacles': { kw: 'juggled priorities', t: [0.3, -0.3, 0.4, 0.5], note: 'too many things are being juggled at once' },
    'Three of Swords': { kw: 'heartbreak', t: [-1.6, 0.2, 0, 0.2], up: 'Disappointment or a painful truth in {t}.', rev: 'The hurt is easing and recovery is starting in {t}.' },
    'Four of Cups': { kw: 'a missed opportunity', t: [-1.6, 0.4, 0.3, 0], up: 'Apathy or a missed opportunity in {t}: something is offered but overlooked or refused.', rev: 'You are finally noticing what was on offer in {t}, and a second chance is possible.' },
    'Four of Swords': { kw: 'rest', t: [0, 0.3, 1, 0.3], up: 'A deliberate pause and rest in {t}.', rev: 'Restlessness and a pause that is ending in {t}.', note: 'everything is on pause' },
    'Four of Pentacles': { kw: 'holding on', t: [-0.1, 0.1, 0.4, 0.2], up: 'Holding on tightly in {t}: security, but at the cost of openness.', rev: 'Letting go of control in {t}.' },
    'Four of Wands': { kw: 'celebration', t: [1.5, -0.3, 0, 0.3], up: 'Celebration and a stable foundation in {t}.' },
    'Five of Cups': { kw: 'regret', t: [-1.2, 0.5, 0, 0.2], up: 'Loss and regret in {t}, with attention fixed on what went wrong.', rev: 'Acceptance and recovery in {t}; you begin to see what remains.' },
    'Five of Swords': { kw: 'conflict and defeat', t: [-1.4, 0.2, 0, 0.2], up: 'A hollow win or a defeat in {t}, where conflict leaves everyone worse off.', rev: 'The conflict is ending in {t}, through regret or reconciliation.' },
    'Five of Wands': { kw: 'competition', t: [-0.4, 0.3, 0, 0.1], up: 'Competition and clashing agendas in {t}.', rev: 'The competition is settling down in {t}.' },
    'Five of Pentacles': { kw: 'hardship', t: [-1.5, 0.4, 0, 0.2], up: 'Lack and hardship in {t}, feeling left out in the cold.', rev: 'Recovery after hardship in {t}; help is within reach.' },
    'Six of Wands': { kw: 'recognition', t: [1.8, 0, 0, 0.3], up: 'Recognition, success and public approval in {t}.', rev: 'Recognition is delayed or a win rings hollow in {t}.' },
    'Six of Swords': { kw: 'moving on', t: [0.6, -0.3, 0.5, 0.6], up: 'A move toward calmer waters in {t}, made slowly and in stages.', note: 'the move is gradual' },
    'Seven of Swords': { kw: 'deception', t: [-1, 0.2, 0, 0.2], up: 'Deception or a sneaky shortcut in {t}; someone is not playing straight.', rev: 'A hidden truth in {t} is coming out.' },
    'Seven of Pentacles': { kw: 'patience', t: [0.4, -0.3, 0.8, 0.6], up: 'Patient waiting for results in {t}; the harvest is not yet ripe.', rev: 'Impatience or poor returns for the effort put into {t}.', note: 'results need more time to ripen' },
    'Seven of Cups': { kw: 'too many options', t: [-0.3, 0.3, 0.7, 0.3], up: 'Too many options and daydreams in {t}, which makes it hard to choose.', rev: 'The options are clearing and a real choice emerges in {t}.', note: 'too many options are blurring the choice' },
    'Eight of Cups': { kw: 'walking away', t: [-0.8, 0.2, 0, 0.5], up: 'Walking away from something that no longer satisfies in {t}.', rev: 'Fear of leaving, or drifting back, in {t}.' },
    'Eight of Swords': { kw: 'feeling trapped', t: [-1.2, 0.5, 0, 0.2], up: 'Feeling trapped in {t}, with restrictions that are mostly mental.', rev: 'Release from the trap in {t}; you start to see the way out.' },
    'Eight of Pentacles': { kw: 'steady effort', t: [1, -0.4, 0.5, 0.5], up: 'Skilled, steady work in {t}, with progress through effort over time.', note: 'results come through steady effort over time' },
    'Eight of Wands': { kw: 'speed', t: [1.6, -0.4, 0, 0.7], up: 'Fast movement and quick news in {t}.', rev: 'Delays and frustrating holdups in {t}.' },
    'Nine of Cups': { kw: 'a wish fulfilled', t: [1.9, 0, 0, 0.2], up: 'Satisfaction and a wish coming true in {t}.', rev: 'Smugness or a wish that does not satisfy in {t}.' },
    'Nine of Swords': { kw: 'anxiety', t: [-1.5, 0.3, 0, 0.1], up: 'Anxiety and sleepless worry in {t}.', rev: 'The worry is lifting; the fear was bigger than the facts in {t}.' },
    'Ten of Cups': { kw: 'fulfilment', t: [2, 0.2, 0, 0.3], up: 'Lasting happiness and emotional fulfilment in {t}.' },
    'Ten of Swords': { kw: 'a painful ending', t: [-2, 0.4, 0, 0.2], up: 'A painful, final ending in {t}; you have hit bottom.', rev: 'The worst is over in {t} and slow recovery begins.' },
    'Ten of Wands': { kw: 'burden', t: [-0.5, 0.2, 0.3, 0.2], up: 'Overload and heavy burdens in {t}.', rev: 'Putting a heavy burden down in {t}.' },
    'Ten of Pentacles': { kw: 'lasting security', t: [1.8, 0, 0, 0.3], up: 'Lasting security and long-term success in {t}.' },
    'Nine of Pentacles': { kw: 'self-made security', t: [1.5, -0.3, 0, 0.3], up: 'Self-made security and comfort in {t}.' },
    'Three of Wands': { kw: 'expansion', t: [1.2, -0.5, 0.2, 0.5], up: 'Plans in motion and results coming in from afar in {t}.' },
  };

  // Tempo: positive = quick, negative = slow. Used only for the timing verdict.
  const PACE = {
    'Ace of Wands': 1, 'Eight of Wands': 1, 'Knight of Wands': 0.7, 'Knight of Swords': 0.7, 'Wheel of Fortune': 0.6,
    'The Chariot': 0.6, 'Page of Wands': 0.5, 'Page of Swords': 0.4, 'Ace of Swords': 0.5, 'The Sun': 0.4,
    'The Tower': 0.8, 'Judgement': 0.4, 'Three of Wands': 0.3,
    'The Hanged Man': -1, 'Four of Swords': -0.8, 'Eight of Pentacles': -0.7, 'Four of Pentacles': -0.6,
    'Seven of Pentacles': -0.8, 'Two of Swords': -0.6, 'The Hermit': -0.7, 'The High Priestess': -0.4,
    'Seven of Cups': -0.4, 'Ten of Pentacles': -0.6, 'Death': -0.3, 'Temperance': -0.6, 'Two of Pentacles': -0.3,
    'Four of Cups': -0.3, 'The Empress': -0.3, 'Nine of Pentacles': -0.4, 'Six of Swords': -0.3,
  };

  // How strongly a suit matters for a domain. Above 1 amplifies the card both ways;
  // below 1 mutes its positive meaning.
  const AFFINITY = {
    work: { Wands: 1.2, Pentacles: 1.3, Swords: 1, Cups: 0.7 },
    money: { Wands: 1, Pentacles: 1.4, Swords: 0.9, Cups: 0.7 },
    love: { Wands: 1, Pentacles: 0.6, Swords: 1.15, Cups: 1.4 },
    health: { Wands: 1.1, Pentacles: 1.1, Swords: 1, Cups: 0.9 },
    general: { Wands: 1, Pentacles: 1, Swords: 1, Cups: 1 },
  };
  const GLOSS = {
    general: { Wands: 'matters of drive and action', Cups: 'emotional matters', Swords: 'matters of thought and truth', Pentacles: 'practical matters' },
    work: { Wands: 'your drive, projects and ambition', Cups: 'morale and how people feel about you', Swords: 'negotiation, communication and the facts', Pentacles: 'the job itself, pay and tangible opportunities' },
    money: { Wands: 'risk-taking and new ventures', Cups: 'emotional spending and generosity', Swords: 'contracts, calculation and tough decisions', Pentacles: 'income, assets and material security' },
    love: { Wands: 'chemistry and pursuit', Cups: 'feelings and emotional connection', Swords: 'honesty, words and conflict', Pentacles: 'commitment, stability and practical support' },
    health: { Wands: 'energy and vitality', Cups: 'emotional wellbeing', Swords: 'stress and mental strain', Pentacles: 'the body, routines and physical stability' },
  };

  function tune(card) {
    if (card.arcana === 'major') {
      const [v, rv, d, rd] = MAJOR_TUNE[card.name];
      return { v, rv, d, rd };
    }
    const o = MINOR_OVERRIDE[card.name] || {};
    const [v, rv, d, rd] = o.t || RANK_TUNE[card.rank];
    return { v, rv, d, rd, up: o.up, rev: o.rev, note: o.note, kw: o.kw };
  }

  function evaluate(h, domain) {
    const t = tune(h.card);
    let v = h.reversed ? t.rv : t.v;
    const d = h.reversed ? t.rd : t.d;
    if (h.card.arcana === 'major') {
      const adj = (DOM_ADJ[h.card.name] || {})[domain] || 0;
      v += h.reversed ? adj * 0.5 : adj;
    } else {
      const aff = AFFINITY[domain][h.card.suit] || 1;
      if (aff > 1) v *= aff; else if (v > 0) v *= aff;
    }
    let pace = PACE[h.card.name] || 0;
    if (h.reversed && pace > 0) pace = -pace * 0.7;
    pace -= d * 0.5;
    return { v: clamp(v, -2, 2), d, pace };
  }

  // ---------- scoring ----------
  function score(ev) {
    const [v1, v2, v3] = ev.map((e) => e.v);
    let s = 0.2 * v1 + 0.3 * v2 + 0.5 * v3;
    if (v3 <= -1.2) s = Math.min(s, 0.55 * v3); // a strongly negative outcome cannot be outvoted
    if (v3 >= 1.5) s = Math.max(s, 0.5 * v3);
    if (v2 <= -1.2 && v3 > 0) s -= 0.2; // a real blocker costs the good outcome something
    const signs = [v1, v2, v3].map((v) => (v > 0.6 ? 1 : v < -0.6 ? -1 : 0));
    if (signs[0] !== 0 && signs.every((x) => x === signs[0])) s *= 1.15;
    return clamp(s, -2, 2);
  }
  const weightedDelay = (ev) => ev.reduce((a, e, i) => a + ROLES[i].weight * e.d, 0);

  function decide(ev, s) {
    const v3 = ev[2].v;
    if (s >= 0.3 && weightedDelay(ev) >= 0.28) return 'YES, BUT DELAYED';
    if (s >= 1.25 && v3 >= 1.2) return 'STRONG YES';
    if (s >= 0.3) return 'YES';
    if (s <= -1.0 && v3 <= -1.2) return (ev[0].v < 0.5 || ev[1].v < 0.5) ? 'STRONG NO' : 'UNLIKELY';
    if (s <= -0.2) return 'UNLIKELY';
    // Balanced overall: let the outcome card break the tie. Only a neutral outcome stays uncertain.
    if (v3 >= 0.35) return 'YES';
    if (v3 <= -0.35) return 'UNLIKELY';
    return 'UNCERTAIN';
  }

  const RANGE = { 'STRONG YES': [85, 95], 'YES': [70, 84], 'YES, BUT DELAYED': [65, 84], 'UNCERTAIN': [50, 64], 'UNLIKELY': [65, 84], 'STRONG NO': [85, 95] };
  function strength(verdict, ev, s) {
    const dir = s >= 0 ? 1 : -1;
    let agree = 0, posW = 0, negW = 0;
    ev.forEach((e, i) => {
      const w = ROLES[i].weight;
      agree += w * (Math.abs(e.v) < 0.3 ? 0.5 : Math.sign(e.v) === dir ? 1 : 0);
      if (e.v > 0.5) posW += w;
      if (e.v < -0.5) negW += w;
    });
    const conflict = clamp(4 * posW * negW, 0, 1);
    const mag = clamp(Math.abs(s) / 2, 0, 1);
    const t = verdict === 'UNCERTAIN'
      ? clamp(1 - conflict * 0.8)
      : clamp(0.55 * agree + 0.45 * mag - 0.35 * conflict);
    const [lo, hi] = RANGE[verdict];
    return clamp(Math.round(lo + (hi - lo) * t), 50, 95);
  }

  // ---------- wording ----------
  const sentences = (t) => t.split(/(?<=[.!?])\s+/).filter(Boolean);
  const lc = (t) => t.charAt(0).toLowerCase() + t.slice(1);
  const kwOf = (card) => tune(card).kw || card.keywords[0];
  const MAJOR_NOTE = {
    'The Hanged Man': 'things are on hold while the situation waits', 'The High Priestess': 'key information is still hidden',
    'The Hermit': 'this needs time and reflection first', 'Temperance': 'it develops slowly and in stages',
    'Death': 'an ending has to happen before the next step', 'Justice': 'a fair process has to run its course',
  };
  function noteOf(card, reversed) {
    const t = tune(card);
    if (t.note) return t.note;
    if (MAJOR_NOTE[card.name]) return MAJOR_NOTE[card.name];
    if (reversed) return 'the opening is blocked or arriving late';
    return `${kwOf(card)} needs more time`;
  }
  const gloss = (domain, card) => GLOSS[domain][card.suit];

  function gistOf(h, domain) {
    const c = h.card;
    if (c.arcana === 'major') return h.reversed ? c.reversed : c.upright;
    const t = tune(c);
    const tpl = h.reversed ? (t.rev || RANKS[c.rank][3]) : (t.up || RANKS[c.rank][2]);
    return tpl.replace('{t}', gloss(domain, c));
  }

  function reversalKind(h) {
    const t = tune(h.card);
    if (t.v > 0.3) {
      if (t.rd >= 0.5) return 'blocks or delays it rather than removing it';
      if (t.rv < -0.2) return 'turns its usual promise against you';
      return 'weakens it and turns it inward';
    }
    if (t.v < -0.3) return t.rv >= 0.1 ? 'eases a difficulty that would otherwise weigh on you' : 'keeps the problem alive through resistance';
    return 'adds hesitation and inner resistance';
  }

  function reversalClause(h, role) {
    if (!h.reversed) return '';
    const t = tune(h.card);
    if (t.v > 0.3) {
      if (role === 3 && t.rd >= 0.5) return 'Reversed, the chance is blocked or delayed, and could be missed if it is left alone.';
      if (t.rd >= 0.5) return 'Reversed, the energy is blocked or delayed rather than lost.';
      if (t.rv < -0.2) return 'Reversed, it works against its usual promise.';
      return 'Reversed, the energy is weakened or turned inward.';
    }
    if (t.v < -0.3) return t.rv >= 0.1 ? 'Reversed, the worst of it is easing.' : 'Reversed, the problem lingers because it is being resisted.';
    return 'Reversed, this points to hesitation and inner resistance.';
  }

  function roleSentence(role, e, h, s) {
    if (role === 1) {
      if (e.d >= 0.6) return 'Things are on hold right now.';
      if (e.v >= 1) return 'Momentum is already with you.';
      if (e.v >= 0.3) return 'There is some positive movement, though it is not decisive yet.';
      if (e.v > -0.3) return 'Momentum is flat at the moment.';
      if (e.v > -1) return 'Momentum is running against you.';
      return 'You are starting from a difficult position.';
    }
    if (role === 2) {
      if (e.d >= 0.6) return `This is what slows things down: ${noteOf(h.card, h.reversed)}.`;
      if (e.v <= -0.6) return 'This is the main obstacle, and it decides whether the outcome can be reached.';
      if (e.v >= 0.6) return 'This is the factor working in your favour, and the one to lean on.';
      return 'This is the turning point: how you respond to it shifts the result.';
    }
    if (e.v >= 1.5) return 'This is a clear, favourable end point for your question.';
    if (e.v >= 0.5) return 'The outcome leans positive.';
    if (e.v > -0.5) {
      if (s <= -0.2) return 'On its own this card is quiet, so the cards before it decide the end point, and they lean away from you.';
      if (s >= 0.3) return 'On its own this card is quiet, so the cards before it decide the end point, and they lean your way.';
      return 'This card is quiet, so the end point rests on the deciding influence.';
    }
    if (e.v > -1.3) return 'The outcome leans against you.';
    return 'This is a firm closed door on the current path.';
  }

  function cardBlock(role, h, e, domain, s) {
    const g = sentences(gistOf(h, domain));
    const third = h.reversed ? reversalClause(h, role) : g[1];
    return [g[0], roleSentence(role, e, h, s), third].filter(Boolean).join(' ');
  }

  function whyText(verdict, hand, ev, s, domain) {
    const [h1, h2, h3] = hand;
    const n1 = h1.card.name, n2 = h2.card.name, n3 = h3.card.name;
    const sg = ev.map((e) => (e.v > 0.5 ? 1 : e.v < -0.5 ? -1 : 0));
    const delayed = verdict === 'YES, BUT DELAYED';
    const q = DOMAIN_LABEL[domain];
    let t;
    if (delayed) {
      const dc = hand.map((h, i) => [h, ROLES[i].weight * ev[i].d]).sort((a, b) => b[1] - a[1])[0][0];
      const note = noteOf(dc.card, dc.reversed);
      t = dc === h3
        ? `The outcome card, ${n3}, is positive but held back: ${note}. The result is real but not immediate, and the yes depends on clearing that block.`
        : `Direction and outcome both lean positive, led by ${n3}. But ${dc.card.name} shows that ${note}, so the result is real but not immediate. The yes depends on that point being resolved.`;
    } else if (sg[0] === 1 && sg[1] === 1 && sg[2] === -1) {
      t = `${n1} and ${n2} give real momentum and support, but ${n3} carries half the weight of this reading and points the other way. The good start does not outrank the outcome, so the spread ends at ${verdict.toLowerCase()} despite the encouragement.`;
    } else if (sg[0] >= 0 && sg[1] <= 0 && sg[2] <= -1 && ev[0].v > 0.3) {
      t = `There may have been positive consideration at first with ${n1}, but ${n2} stalls it and ${n3} points to disappointment or a missed opportunity. Momentum is gone, and the outcome follows it.`;
    } else if (sg[0] === -1 && sg[2] === 1) {
      t = `This starts from a hard place with ${n1}, but ${n2} ${ev[1].v >= 0 ? 'moves it along' : 'is the obstacle to clear'}, and ${n3} turns the end point toward a better result. The recovery matters more than the rough start.`;
    } else if (sg[1] === -1 && sg[2] === 1) {
      t = `The outcome is positive with ${n3}, but ${n2} is the obstacle between you and it. The result is available only if that blocker is dealt with first.`;
    } else if (sg.every((x) => x === 1)) {
      t = `All three cards agree: ${n1} gives momentum, ${n2} supports it and ${n3} confirms where it ends. Nothing in the spread contradicts the answer.`;
    } else if (sg.every((x) => x === -1)) {
      t = `All three cards point the same way: ${n1} drains momentum, ${n2} blocks the path and ${n3} confirms the end. Nothing in the spread offers a way around it.`;
    } else if (verdict === 'UNCERTAIN') {
      t = `${n1}, ${n2} and ${n3} pull in different directions with no card strong enough to settle it. The final card decides the lean, and it is not decisive.`;
    } else {
      t = `${n3}, the outcome card, sets the direction. ${n2} shapes how you get there, and ${n1} is only the starting point.`;
    }
    const revs = hand.filter((h) => h.reversed).map((h) => `${h.card.name} is reversed, which ${reversalKind(h)}`);
    if (revs.length) t += ` ${revs.join('; ')}.`;
    return t;
  }

  function outcomePhrase(h) {
    const kw = kwOf(h.card), t = tune(h.card);
    if (!h.reversed) return `${h.card.name} brings ${kw}`;
    if (t.v > 0.3) return `${h.card.name}, reversed, shows ${kw} blocked or turned against you`;
    if (t.v < -0.3) return `${h.card.name}, reversed, shows ${kw} easing but unresolved`;
    return `${h.card.name}, reversed, shows hesitation around ${kw}`;
  }

  function oneLine(verdict, hand, ev, lean, delayCard) {
    const n3 = hand[2].card, ph = outcomePhrase(hand[2]);
    switch (verdict) {
      case 'STRONG YES': return `Yes, and strongly: ${ph}.`;
      case 'YES': return ev[1].v < -0.5 ? `Yes: ${ph}, once ${hand[1].card.name} is dealt with.` : `Yes: ${ph}.`;
      case 'YES, BUT DELAYED': return `Yes, but not on your timeline: ${noteOf(delayCard.card, delayCard.reversed)}.`;
      case 'UNCERTAIN': return `Too finely balanced to call, but it leans ${lean}.`;
      case 'UNLIKELY': return `Unlikely as things stand: ${ph}.`;
      default: return `No: ${ph}, and it closes this path.`;
    }
  }

  function timingOf(verdict, hand, ev, question, isSymbolic) {
    if (isSymbolic) return null;
    const frame = detectTimeframe(question);
    const positive = ['STRONG YES', 'YES', 'YES, BUT DELAYED'].includes(verdict);
    const pace = ev.reduce((a, e, i) => a + ROLES[i].weight * e.pace, 0);
    const slow = pace <= -0.25 || verdict === 'YES, BUT DELAYED';
    const fast = pace >= 0.3 && !slow;
    const outcome = verdict.replace(', BUT DELAYED', '');
    if (frame) {
      const F = frame.toUpperCase();
      if (!positive) return { outcome, label: 'NOT SUPPORTED', text: 'The spread does not support the outcome itself, so it gives no support to this timeframe either.' };
      if (slow) return { outcome, label: `NOT NECESSARILY ${F}`, text: 'Positive outcome, but the cards do not strongly support the requested timeframe. The pace here is gradual.' };
      if (fast) return { outcome, label: `PLAUSIBLE ${F}`, text: 'The cards carry quick, active energy, so the timeframe is plausible. It is not guaranteed.' };
      return { outcome, label: 'NO CLEAR SIGNAL', text: 'The cards speak to direction, not date. They give no clear signal for this timeframe, so no date is offered.' };
    }
    if (slow && positive) return { label: 'GRADUAL, NOT IMMEDIATE', text: 'The cards point to weeks or months of steady development rather than a fast result.' };
    if (fast && positive) return { label: 'SOONER RATHER THAN LATER', text: 'Quick, active cards suggest movement before long, with no exact date implied.' };
    return null;
  }

  // ---------- main ----------
  function read(hand, question) {
    const domain = detectDomain(question);
    const safety = detectSafety(question);
    const symbolic = !!safety;
    const ev = hand.map((h) => evaluate(h, domain));
    const s = score(ev);
    const verdict = decide(ev, s);
    const str = strength(verdict, ev, s);
    const lean = ev[2].v >= 0.15 ? 'slightly toward yes' : ev[2].v <= -0.15 ? 'slightly toward no' : ev[1].v >= 0 ? 'slightly toward yes' : 'slightly toward no';
    const delayCard = hand.map((h, i) => [h, ROLES[i].weight * ev[i].d]).sort((a, b) => b[1] - a[1])[0][0];
    const cls = verdict.includes('YES') ? (verdict === 'YES, BUT DELAYED' ? 'delayed' : 'yes') : verdict === 'UNCERTAIN' ? 'uncertain' : 'no';
    const bestMove = symbolic ? null : (hand[1].reversed ? hand[1].card.adviceRev : hand[1].card.advice);
    let line = oneLine(verdict, hand, ev, lean, delayCard);
    if (symbolic) line = `Symbolically, the spread leans ${verdict.toLowerCase()}. This is a reflection, not a prediction.`;
    return {
      verdict, cls, strength: str, symbolic, safety, domain, score: s,
      oneLine: line,
      cards: hand.map((h, i) => ({
        num: ROLES[i].num, role: ROLES[i].name, name: h.card.name, orient: h.reversed ? 'Reversed' : 'Upright',
        text: cardBlock(i + 1, h, ev[i], domain, s),
      })),
      why: whyText(verdict, hand, ev, s, domain) + (bestMove ? ` Best move: ${lc(bestMove)}` : ''),
      timing: timingOf(verdict, hand, ev, question, symbolic),
    };
  }

  const SAFETY_NOTE = {
    medical: 'medical',
    legal: 'legal',
    financial: 'financial',
    safety: 'safety',
  };
  const safetyMessage = (k) => `This touches on a ${SAFETY_NOTE[k]} matter. A tarot spread is a symbolic reflection, not a factual prediction or professional advice. Please speak with a qualified professional before making any decision.`;

  return { read, detectSafety, safetyMessage, ROLES, _eval: { evaluate, score, decide, strength } };
})();

if (typeof module !== 'undefined') module.exports = TarotEngine;
