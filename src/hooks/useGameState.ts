import { useReducer } from 'react'
import type { GameState, GameAction } from '../types/game'
import { LEVELS, getRandomPraise } from '../data/levels'

const initialState: GameState = {
  phase: 'intro',
  currentLevel: 0,
  currentQuestion: 0,
  score: 0,
  owlMessage: LEVELS[0].introMessages[0],
  owlMood: 'happy',
  selectedAnswer: null,
  answerResult: null,
  demoStep: 0,
  introStep: 0,
  showCelebration: false,
}

function gameReducer(state: GameState, action: GameAction): GameState {
  const level = LEVELS[state.currentLevel]

  switch (action.type) {
    case 'START_GAME':
      return {
        ...initialState,
        owlMessage: LEVELS[0].introMessages[0],
      }

    case 'ADVANCE_INTRO': {
      const nextStep = state.introStep + 1
      if (nextStep >= level.introMessages.length) {
        return {
          ...state,
          phase: 'demo',
          demoStep: 0,
          owlMessage: level.demoMessages[0],
          owlMood: 'thinking',
        }
      }
      return {
        ...state,
        introStep: nextStep,
        owlMessage: level.introMessages[nextStep],
      }
    }

    case 'ADVANCE_DEMO': {
      const nextStep = state.demoStep + 1
      if (nextStep >= level.demoMessages.length) {
        return {
          ...state,
          phase: 'quiz',
          currentQuestion: 0,
          owlMessage: 'Now it\'s your turn!\nTap the right answer!',
          owlMood: 'happy',
          selectedAnswer: null,
          answerResult: null,
        }
      }
      return {
        ...state,
        demoStep: nextStep,
        owlMessage: level.demoMessages[nextStep],
      }
    }

    case 'START_QUIZ':
      return {
        ...state,
        phase: 'quiz',
        currentQuestion: 0,
        owlMessage: 'Now it\'s your turn!\nTap the right answer!',
        owlMood: 'happy',
        selectedAnswer: null,
        answerResult: null,
      }

    case 'SELECT_ANSWER': {
      const question = level.questions[state.currentQuestion]
      const isCorrect = action.answer === question.correctAnswer
      if (isCorrect) {
        return {
          ...state,
          phase: 'feedback',
          selectedAnswer: action.answer,
          answerResult: 'correct',
          score: state.score + 1,
          owlMessage: getRandomPraise(),
          owlMood: 'celebrating',
          showCelebration: true,
        }
      }
      return {
        ...state,
        phase: 'feedback',
        selectedAnswer: action.answer,
        answerResult: 'incorrect',
        owlMessage: 'Hmm...\nLet\'s count together!',
        owlMood: 'encouraging',
      }
    }

    case 'START_COUNTING':
      return {
        ...state,
        phase: 'counting',
      }

    case 'FINISH_COUNTING':
      return {
        ...state,
        owlMessage: `See? The answer is ${action.correctAnswer}!`,
        owlMood: 'happy',
      }

    case 'NEXT_QUESTION': {
      const nextQ = state.currentQuestion + 1
      if (nextQ >= level.questions.length) {
        return {
          ...state,
          phase: 'level-complete',
          owlMessage: `You completed ${level.name}!\nYou got ${state.score} out of ${level.questions.length}!`,
          owlMood: 'celebrating',
          showCelebration: true,
          selectedAnswer: null,
          answerResult: null,
        }
      }
      return {
        ...state,
        phase: 'quiz',
        currentQuestion: nextQ,
        owlMessage: 'Let\'s try the next one!',
        owlMood: 'happy',
        selectedAnswer: null,
        answerResult: null,
        showCelebration: false,
      }
    }

    case 'COMPLETE_LEVEL':
      return {
        ...state,
        phase: 'level-complete',
        owlMessage: `You completed ${level.name}!\nYou got ${state.score} out of ${level.questions.length}!`,
        owlMood: 'celebrating',
        showCelebration: true,
      }

    case 'NEXT_LEVEL': {
      const nextLevel = state.currentLevel + 1
      if (nextLevel >= LEVELS.length) {
        return {
          ...state,
          phase: 'game-complete',
          owlMessage: 'You finished all the levels!\nYou\'re an addition superstar!',
          owlMood: 'celebrating',
          showCelebration: true,
        }
      }
      return {
        ...state,
        phase: 'intro',
        currentLevel: nextLevel,
        currentQuestion: 0,
        score: 0,
        introStep: 0,
        demoStep: 0,
        owlMessage: LEVELS[nextLevel].introMessages[0],
        owlMood: 'happy',
        selectedAnswer: null,
        answerResult: null,
        showCelebration: false,
      }
    }

    case 'SET_OWL_MESSAGE':
      return {
        ...state,
        owlMessage: action.message,
        owlMood: action.mood,
      }

    case 'HIDE_CELEBRATION':
      return {
        ...state,
        showCelebration: false,
      }

    default:
      return state
  }
}

export function useGameState() {
  return useReducer(gameReducer, initialState)
}
