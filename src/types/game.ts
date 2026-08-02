export type OwlMood = 'happy' | 'thinking' | 'celebrating' | 'encouraging'

export type GamePhase =
  | 'intro'
  | 'demo'
  | 'quiz'
  | 'feedback'
  | 'counting'
  | 'level-complete'
  | 'game-complete'

export interface Question {
  a: number
  b: number
  correctAnswer: number
  options: number[]
  visual?: {
    emoji: string
  }
}

export interface LevelData {
  id: number
  name: string
  introMessages: string[]
  demoMessages: string[]
  demoEmoji: string
  demoA: number
  demoB: number
  questions: Question[]
}

export interface GameState {
  phase: GamePhase
  currentLevel: number
  currentQuestion: number
  score: number
  owlMessage: string
  owlMood: OwlMood
  selectedAnswer: number | null
  answerResult: 'correct' | 'incorrect' | null
  demoStep: number
  introStep: number
  showCelebration: boolean
}

export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'ADVANCE_INTRO' }
  | { type: 'ADVANCE_DEMO' }
  | { type: 'START_QUIZ' }
  | { type: 'SELECT_ANSWER'; answer: number }
  | { type: 'START_COUNTING' }
  | { type: 'FINISH_COUNTING'; correctAnswer: number }
  | { type: 'NEXT_QUESTION' }
  | { type: 'COMPLETE_LEVEL' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'SET_OWL_MESSAGE'; message: string; mood: OwlMood }
  | { type: 'HIDE_CELEBRATION' }
