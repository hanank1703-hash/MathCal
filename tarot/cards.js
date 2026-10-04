// Full 78-card tarot deck. Major Arcana are hand-written; Minor Arcana are
// built from a rank (what happens) x suit (where it happens) so every card
// still gets its own keywords, upright and reversed meaning.

const MAJOR = [
  ['The Fool', '✧', ['beginnings', 'innocence', 'leap of faith'],
    'A new journey begins. Trust the unknown, step forward with an open heart and let curiosity lead you.',
    'Recklessness or hesitation. You may be ignoring risks, or fear is keeping you from a leap you are ready for.'],
  ['The Magician', '☿', ['willpower', 'skill', 'manifestation'],
    'You already hold every tool you need. Focus your intent and turn an idea into reality.',
    'Scattered energy or misused talent. Watch for trickery, self-doubt, or plans that never leave the page.'],
  ['The High Priestess', '☽', ['intuition', 'mystery', 'inner voice'],
    'Quiet knowing rises beneath the surface. Listen inward; the answer is not yet spoken aloud.',
    'Ignored instincts or hidden agendas. Secrets are surfacing, or you are drowning out your own inner voice.'],
  ['The Empress', '♀', ['abundance', 'nurture', 'creativity'],
    'Growth, comfort and creative fertility. Something you have tended is ready to bloom.',
    'Smothering, neglect, or creative block. Give care back to yourself before you give it away again.'],
  ['The Emperor', '♈', ['structure', 'authority', 'stability'],
    'Order, leadership and firm foundations. Boundaries and discipline protect what you are building.',
    'Rigidity or control issues. Authority is being abused, or structure has become a cage.'],
  ['The Hierophant', '♉', ['tradition', 'guidance', 'belonging'],
    'Wisdom from a trusted tradition or teacher. Learning the rules helps you know when to honour them.',
    'Breaking convention. Question inherited beliefs and find a path that is truly yours.'],
  ['The Lovers', '♊', ['union', 'choice', 'alignment'],
    'A meaningful bond or a defining choice. Choose what is in harmony with your deepest values.',
    'Misalignment or a difficult choice avoided. Check whether you are choosing from love or from fear.'],
  ['The Chariot', '♋', ['determination', 'victory', 'drive'],
    'Momentum and control. Hold the reins with discipline and you will push through opposition.',
    'Loss of direction or aggression. Forcing progress without a clear goal burns energy fast.'],
  ['Strength', '♌', ['courage', 'patience', 'compassion'],
    'Gentle courage tames the lion. Quiet confidence and compassion are stronger than force.',
    'Self-doubt or raw emotion taking over. Rebuild your confidence with small acts of self-kindness.'],
  ['The Hermit', '♍', ['solitude', 'reflection', 'wisdom'],
    'Step back and seek your own light. Solitude brings clarity you cannot find in the crowd.',
    'Isolation or withdrawal gone too far. Come back down the mountain and share what you have learned.'],
  ['Wheel of Fortune', '♃', ['cycles', 'fate', 'turning point'],
    'Luck turns and a cycle shifts. What goes down rises again; ride the change rather than resist it.',
    'Resisting change or bad timing. A setback is temporary, but clinging to the old cycle prolongs it.'],
  ['Justice', '♎', ['truth', 'fairness', 'accountability'],
    'Cause and effect, honest judgement. Act with integrity and expect fair outcomes.',
    'Unfairness, dishonesty or avoiding responsibility. The scales will balance, so face what you owe.'],
  ['The Hanged Man', '♆', ['surrender', 'new perspective', 'pause'],
    'Pause and let go. By seeing things upside down, you find a truth you were rushing past.',
    'Stalling or pointless sacrifice. Needless waiting; it is time to act or release the sacrifice.'],
  ['Death', '♏', ['endings', 'transformation', 'renewal'],
    'An ending that clears the ground for rebirth. This is change, not literal loss: let the old form fall away.',
    'Resisting a necessary ending. Holding on to what is finished only delays the renewal waiting for you.'],
  ['Temperance', '♐', ['balance', 'patience', 'harmony'],
    'Blend opposites with patience. Moderation and steady flow bring healing.',
    'Excess or imbalance. You may be overdoing one thing; return to the middle path.'],
  ['The Devil', '♑', ['attachment', 'temptation', 'shadow'],
    'Chains you chose, or forgot you could remove. Examine the habits, desires or fears that bind you.',
    'Breaking free. You are loosening an unhealthy grip and reclaiming your power.'],
  ['The Tower', '♂', ['upheaval', 'revelation', 'breakthrough'],
    'Sudden shake-up. False structures collapse so something more honest can be built in their place.',
    'Avoiding disaster or dragging out the inevitable. Change is coming; it hurts less when you meet it.'],
  ['The Star', '♒', ['hope', 'healing', 'inspiration'],
    'Calm after the storm. Hope returns, you are healing, and your path is quietly guided.',
    'Lost hope or disconnection. Faith is low; tend to small sparks until the light returns.'],
  ['The Moon', '♓', ['illusion', 'dreams', 'the unconscious'],
    'Things are not as they seem. Move carefully through uncertainty and trust your instincts over fear.',
    'Confusion lifting. Hidden truths come into view, or anxiety is easing at last.'],
  ['The Sun', '☉', ['joy', 'success', 'vitality'],
    'Warmth, clarity and celebration. Success and happiness shine on you; enjoy it freely.',
    'Dimmed joy or delayed success. The light is still there, only behind a cloud of doubt.'],
  ['Judgement', '♇', ['reckoning', 'rebirth', 'calling'],
    'A call to rise. Reflect honestly, forgive, and answer the summons toward your higher purpose.',
    'Self-doubt or avoiding the call. Harsh self-judgement keeps you from the renewal on offer.'],
  ['The World', '♄', ['completion', 'wholeness', 'achievement'],
    'A cycle completes in triumph. You have arrived and are whole; celebrate before the next journey.',
    'Loose ends and almost-finished goals. One last step remains before closure.'],
];

const ROMAN = ['0','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII','XIII','XIV','XV','XVI','XVII','XVIII','XIX','XX','XXI'];

const SUITS = [
  { name: 'Wands', theme: 'passion and ambition', kw: ['fire', 'action'], topic: 'career' },
  { name: 'Cups', theme: 'emotion and relationships', kw: ['feeling', 'heart'], topic: 'love' },
  { name: 'Swords', theme: 'thought, truth and conflict', kw: ['mind', 'clarity'], topic: 'general' },
  { name: 'Pentacles', theme: 'work, money and the material world', kw: ['earth', 'security'], topic: 'money' },
];

// rank: [name, keyword, upright template, reversed template]
const RANKS = [
  ['Ace', 'new spark', 'A fresh seed of potential appears in matters of {t}. Say yes to the opening.', 'A missed or blocked beginning in {t}. The potential is real, but timing or doubt is in the way.'],
  ['Two', 'balance', 'You weigh a choice or a partnership in matters of {t}. Balance and dialogue serve you best.', 'Indecision or imbalance in {t}. Something is being avoided and the scales will not hold.'],
  ['Three', 'growth', 'Early results and collaboration in {t}. Growth comes through connection and shared effort.', 'Friction or delay in {t}. Cooperation stalls and expectations are not being met.'],
  ['Four', 'stability', 'A pause to consolidate in {t}. Rest, structure and a solid base are the theme.', 'Stagnation in {t}. Stability has become stuckness, so shake something loose.'],
  ['Five', 'conflict', 'Challenge and friction in {t}. Competing needs test you; learn what is worth fighting for.', 'The worst of the conflict in {t} is passing. Resolution comes through letting go of the fight.'],
  ['Six', 'harmony', 'Relief and progress in {t}. Help arrives, tension eases and you move toward calmer waters.', 'Progress you cannot yet feel in {t}. Unfinished business keeps pulling you backward.'],
  ['Seven', 'reflection', 'A moment of assessment in {t}. Stand your ground, weigh your options and be patient.', 'Scattered effort in {t}. Doubt or distraction drains your focus; choose one path.'],
  ['Eight', 'movement', 'Focused momentum in {t}. Skill, change and steady effort move things forward quickly.', 'Frustration or a stall in {t}. Rushing or perfectionism is holding you back.'],
  ['Nine', 'near completion', 'You are nearly there in {t}. Resilience and self-reliance carry you through the final stretch.', 'Exhaustion or anxiety in {t}. You are carrying too much alone; ask for support.'],
  ['Ten', 'culmination', 'A cycle reaches its peak in {t}. Fulfilment, or the weight of too much, asks you to finish and release.', 'Burden or an ending resisted in {t}. Put something heavy down before starting afresh.'],
  ['Page', 'curiosity', 'A message or new learning in {t}. Approach with curiosity and a beginner\'s mind.', 'Immaturity or unfocused ideas in {t}. A message is delayed or poorly received.'],
  ['Knight', 'pursuit', 'Energetic pursuit in {t}. Drive and commitment push toward a goal, so mind the pace.', 'Haste or inertia in {t}. Either charging blindly ahead or refusing to move at all.'],
  ['Queen', 'mastery', 'Mature, nurturing command of {t}. Lead with empathy, confidence and inner security.', 'Insecurity or coldness in {t}. Guard against manipulation, whether you give it or receive it.'],
  ['King', 'authority', 'Seasoned authority in {t}. Calm, decisive leadership and a long view bring success.', 'Domination or abuse of power in {t}. Rule yourself before you try to rule the situation.'],
];


// Outlook (+1 favourable, 0 neutral, -1 challenging) and a concrete action for
// each card, upright and reversed. Used to build the verdict and next steps.
const MAJOR_EXTRA = {
  'The Fool': [1, 'Take the first step now, even before every detail is clear.', 'Pause and list the real risks before you leap.'],
  'The Magician': [1, 'Use the skills and resources you already have; start the project today.', 'Stop scattering your effort; pick one goal and be honest about your skills.'],
  'The High Priestess': [0, 'Wait and observe; do not decide until your intuition is clear.', 'Find the missing information; something is being left unsaid.'],
  'The Empress': [1, 'Invest time and care in this; it is ready to grow.', 'Look after yourself first and unblock your creative energy.'],
  'The Emperor': [1, 'Set clear rules, a plan and a deadline, then follow them.', 'Loosen your grip, or push back on someone controlling.'],
  'The Hierophant': [0, 'Follow the proven route or ask an experienced mentor.', 'Trust your own judgement over what is expected of you.'],
  'The Lovers': [1, 'Make the choice that matches your values and commit to it.', 'Stop avoiding the decision; check whether fear is driving it.'],
  'The Chariot': [1, 'Set a clear goal and push forward with discipline.', 'Regain direction before you spend more energy.'],
  'Strength': [1, 'Stay patient and calm; gentle persistence will win.', 'Rebuild confidence with small wins; do not react in anger.'],
  'The Hermit': [0, 'Take time alone to think, and decide what you really want.', 'Reconnect with people; do not isolate yourself.'],
  'Wheel of Fortune': [1, 'Move with the change; the timing is turning in your favour.', 'Stop resisting the change; adapt and be patient through the setback.'],
  'Justice': [1, 'Be honest, read the fine print and make the fair choice.', 'Own your part in this and fix any unfairness.'],
  'The Hanged Man': [0, 'Pause and look at it from another angle before acting.', 'Stop stalling; decide, or release the sacrifice that is not paying off.'],
  'Death': [-1, 'Let the finished chapter go so the next one can start.', 'Stop clinging to what is over; plan the change instead of fearing it.'],
  'Temperance': [1, 'Go step by step and keep a balanced pace.', 'Cut back the excess; restore balance in one area of life.'],
  'The Devil': [-1, 'Name the habit, fear or dependency holding you, and make a plan to loosen it.', 'Take the first practical step out of what binds you.'],
  'The Tower': [-1, 'Expect a shake-up; build the new plan on honest foundations.', 'Face the problem now rather than letting it build.'],
  'The Star': [1, 'Keep going; stay hopeful and take care of yourself.', 'Do one small thing each day that restores your faith.'],
  'The Moon': [-1, 'Do not decide on partial information; check the facts first.', 'The fog is lifting; act on what has become clear.'],
  'The Sun': [1, 'Go ahead with confidence and share the good news.', 'Look for what is dimming your confidence; success is close.'],
  'Judgement': [1, 'Reflect honestly, forgive, and answer the call.', 'Stop judging yourself harshly; accept the lesson and move on.'],
  'The World': [1, 'Finish what you started and celebrate before the next step.', 'Close the last open loop; one step remains.'],
};
const RANK_EXTRA = [
  [1, 'Act on the new opportunity quickly while it is fresh.', 'Do not force it; prepare and wait for a clearer opening.'],
  [0, 'Decide between your options and commit; talk it over with the other person involved.', 'Stop postponing the choice; name what you are avoiding.'],
  [1, 'Work with others, share the effort and celebrate early wins.', 'Clear up miscommunication before moving on.'],
  [0, 'Consolidate what you have; rest, then protect your foundation.', 'Shake up the routine; stagnation is the real risk.'],
  [-1, 'Pick your battles; do not spend energy on a fight you cannot win.', 'Make peace and let go of the grudge or the loss.'],
  [1, 'Accept help and keep moving toward calmer ground.', 'Finish unresolved business before you leave it behind.'],
  [0, 'Hold your position and commit to one strategy.', 'Cut distractions; stop spreading yourself thin.'],
  [1, 'Keep up the momentum; steady effort pays off now.', 'Slow down and fix the process instead of rushing.'],
  [0, 'Push through the last stretch; you are closer than it feels.', 'Ask for support; you do not have to carry it alone.'],
  [0, 'Complete this cycle and release what weighs you down.', 'Put down the heaviest burden before starting anything new.'],
  [1, 'Learn, ask questions and start small.', 'Verify before you rely on a rumour or half-formed idea.'],
  [0, 'Move with energy, but keep your direction clear.', 'Set a steady pace; avoid rushing in or stalling.'],
  [1, 'Lead calmly and with care, and trust your judgement.', 'Rebuild confidence; avoid people-pleasing or control.'],
  [1, 'Make the decision and take responsibility for it.', 'Check whether you are controlling; lead by example.'],
];

function buildDeck() {
  const deck = [];
  MAJOR.forEach(([name, glyph, keywords, up, rev], i) => {
    deck.push({ id: 'major-' + i, name, arcana: 'major', numeral: ROMAN[i], glyph, keywords, upright: up, reversed: rev, topic: 'general',
      tone: MAJOR_EXTRA[name][0], advice: MAJOR_EXTRA[name][1], adviceRev: MAJOR_EXTRA[name][2] });
  });
  SUITS.forEach((suit, s) => {
    RANKS.forEach(([rank, kw, up, rev], r) => {
      deck.push({
        id: 'minor-' + s + '-' + r,
        name: rank + ' of ' + suit.name,
        arcana: 'minor',
        suit: suit.name,
        suitIndex: s,
        rank: r,
        numeral: r === 0 ? 'A' : r < 10 ? String(r + 1) : rank === 'Knight' ? 'Kn' : rank[0],
        keywords: [kw, suit.kw[r % 2]],
        upright: up.replace('{t}', suit.theme),
        reversed: rev.replace('{t}', suit.theme),
        topic: suit.topic,
        tone: RANK_EXTRA[r][0], advice: RANK_EXTRA[r][1], adviceRev: RANK_EXTRA[r][2],
      });
    });
  });
  return deck;
}

// Small SVG icons for the four suits (used on card faces).
const SUIT_SVG = [
  '<svg viewBox="0 0 64 64"><path d="M32 6c6 8 10 14 10 22a10 10 0 0 1-20 0c0-4 2-6 4-10 2 3 3 4 6 4-1-6-2-10 0-16z" fill="currentColor"/><rect x="29" y="38" width="6" height="22" rx="3" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 64 64"><path d="M12 12h40c0 14-8 24-20 26-12-2-20-12-20-26z" fill="currentColor"/><rect x="29" y="38" width="6" height="14" fill="currentColor"/><rect x="20" y="52" width="24" height="5" rx="2.5" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 64 64"><path d="M32 4l5 8v30H27V12z" fill="currentColor"/><rect x="18" y="42" width="28" height="5" rx="2.5" fill="currentColor"/><rect x="29" y="47" width="6" height="12" rx="3" fill="currentColor"/></svg>',
  '<svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="24" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 14l5.3 11 12 1.7-8.7 8.4 2 12L32 41.5 21.4 47l2-12-8.7-8.4 12-1.7z" fill="currentColor"/></svg>',
];
