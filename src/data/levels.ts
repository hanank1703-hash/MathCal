import type { LevelData, Question } from '../types/game'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function generateOptions(correct: number): number[] {
  const opts = new Set<number>([correct])
  const candidates = [correct - 1, correct + 1, correct - 2, correct + 2, correct + 3]
    .filter(n => n >= 0 && n !== correct)
  for (const c of shuffleArray(candidates)) {
    if (opts.size >= 3) break
    opts.add(c)
  }
  while (opts.size < 3) {
    opts.add(correct + opts.size + 1)
  }
  return shuffleArray([...opts])
}

function makeQ(a: number, b: number, emoji?: string): Question {
  const correct = a + b
  return {
    a,
    b,
    correctAnswer: correct,
    options: generateOptions(correct),
    ...(emoji ? { visual: { emoji } } : {}),
  }
}

export const LEVELS: LevelData[] = [
  {
    id: 0,
    name: 'First Steps',
    introMessages: [
      'Hello little mathematician!\nToday we\'ll learn how to ADD numbers.',
      'Adding means putting things together\nto make MORE!',
    ],
    demoMessages: [
      'When we ADD...\nwe put things together.',
      'One apple...\nplus one apple...',
      'Makes TWO apples!',
    ],
    demoEmoji: '🍎',
    demoA: 1,
    demoB: 1,
    questions: [
      makeQ(1, 1),
      makeQ(2, 1),
      makeQ(3, 1),
    ],
  },
  {
    id: 1,
    name: 'Getting Bigger',
    introMessages: [
      'Great job on Level 1!\nYou\'re getting really good at this!',
      'Let\'s try some\nbigger numbers now!',
    ],
    demoMessages: [
      'Let\'s count stars!',
      'Two stars...\nplus two more stars...',
      'Makes FOUR stars!',
    ],
    demoEmoji: '⭐',
    demoA: 2,
    demoB: 2,
    questions: [
      makeQ(2, 2),
      makeQ(3, 2),
      makeQ(4, 1),
    ],
  },
  {
    id: 2,
    name: 'Counting Fun',
    introMessages: [
      'Wow, you\'re a superstar!\nLet\'s try counting with pictures!',
      'Look at the objects\nand count them all together!',
    ],
    demoMessages: [
      'Let\'s count teddy bears!',
      'Two teddy bears...\nplus one more teddy bear...',
      'Makes THREE teddy bears!',
    ],
    demoEmoji: '🧸',
    demoA: 2,
    demoB: 1,
    questions: [
      makeQ(2, 1, '🍎'),
      makeQ(2, 2, '🧸'),
      makeQ(3, 1, '⭐'),
    ],
  },
]

export const PRAISE_MESSAGES = [
  'You did it!',
  'Awesome!',
  'Great job!',
  'Fantastic!',
  'You\'re becoming a\nmaths superstar!',
  'Amazing work!',
  'Super!',
  'Brilliant!',
  'You\'re so smart!',
  'Wonderful!',
]

export function getRandomPraise(): string {
  return PRAISE_MESSAGES[Math.floor(Math.random() * PRAISE_MESSAGES.length)]
}
