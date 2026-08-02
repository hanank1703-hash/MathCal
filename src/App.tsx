import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Background } from './components/Background'
import { OwlMentor } from './components/OwlMentor'
import { SpeechBubble } from './components/SpeechBubble'
import { QuestionCard } from './components/QuestionCard'
import { AnswerButton } from './components/AnswerButton'
import { ProgressBar } from './components/ProgressBar'
import { ContinueButton } from './components/ContinueButton'
import { Celebration } from './components/Celebration'
import { FruitAnimation } from './components/FruitAnimation'
import { useGameState } from './hooks/useGameState'
import { useSound } from './hooks/useSound'
import { LEVELS } from './data/levels'

export default function App() {
  const [state, dispatch] = useGameState()
  const { play } = useSound()
  const [countStep, setCountStep] = useState(0)
  const countTimerRef = useRef<ReturnType<typeof setTimeout>>(null)
  const level = LEVELS[state.currentLevel]
  const question = level.questions[state.currentQuestion]

  useEffect(() => {
    return () => { if (countTimerRef.current) clearTimeout(countTimerRef.current) }
  }, [])

  const handleContinueIntro = useCallback(() => {
    play('buttonTap')
    dispatch({ type: 'ADVANCE_INTRO' })
  }, [dispatch, play])

  const handleContinueDemo = useCallback(() => {
    play('buttonTap')
    dispatch({ type: 'ADVANCE_DEMO' })
  }, [dispatch, play])

  const handleSelectAnswer = useCallback((answer: number) => {
    play('buttonTap')
    dispatch({ type: 'SELECT_ANSWER', answer })

    const q = LEVELS[state.currentLevel].questions[state.currentQuestion]
    const isCorrect = answer === q.correctAnswer

    if (isCorrect) {
      play('correct')
      setTimeout(() => play('sparkle'), 300)
      setTimeout(() => {
        dispatch({ type: 'NEXT_QUESTION' })
      }, 1800)
    } else {
      play('encourage')
      setTimeout(() => {
        dispatch({ type: 'START_COUNTING' })
        setCountStep(0)

        const total = q.a + q.b
        let step = 0
        const countUp = () => {
          step++
          setCountStep(step)
          play('pop')
          if (step >= total) {
            setTimeout(() => {
              dispatch({ type: 'FINISH_COUNTING', correctAnswer: q.correctAnswer })
              setTimeout(() => {
                dispatch({ type: 'NEXT_QUESTION' })
                setCountStep(0)
              }, 1500)
            }, 600)
          } else {
            countTimerRef.current = setTimeout(countUp, 600)
          }
        }
        countTimerRef.current = setTimeout(countUp, 500)
      }, 1200)
    }
  }, [state.currentLevel, state.currentQuestion, dispatch, play])

  const handleNextLevel = useCallback(() => {
    play('buttonTap')
    dispatch({ type: 'NEXT_LEVEL' })
  }, [dispatch, play])

  const handleRestart = useCallback(() => {
    play('buttonTap')
    dispatch({ type: 'START_GAME' })
  }, [dispatch, play])

  const getAnswerButtonState = (value: number): 'default' | 'correct' | 'incorrect' | 'dimmed' => {
    if (state.answerResult === null) return 'default'
    if (value === state.selectedAnswer) {
      return state.answerResult === 'correct' ? 'correct' : 'incorrect'
    }
    if (state.answerResult === 'correct' && value === question?.correctAnswer) return 'correct'
    return 'dimmed'
  }

  const showProgressBar = state.phase === 'quiz' || state.phase === 'feedback' || state.phase === 'counting'

  return (
    <div className="relative min-h-screen overflow-hidden select-none" style={{ fontFamily: "'Nunito', 'Segoe UI', system-ui, sans-serif" }}>
      <Background />

      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        {/* Progress bar */}
        {showProgressBar && (
          <motion.div
            className="pt-4 pb-2"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <ProgressBar
              current={state.currentQuestion}
              total={level.questions.length}
              levelName={level.name}
            />
          </motion.div>
        )}

        {/* Main content area */}
        <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-4 px-4 py-2">
          {/* Owl + Speech bubble */}
          <div className="flex items-start gap-1 shrink-0">
            <OwlMentor mood={state.owlMood} />
            <SpeechBubble message={state.owlMessage} />
          </div>

          {/* Center content */}
          <div className="flex flex-col items-center gap-6 flex-1 max-w-lg w-full">
            <AnimatePresence mode="wait">
              {/* INTRO */}
              {state.phase === 'intro' && (
                <motion.div
                  key="intro"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6"
                >
                  {state.currentLevel === 0 && state.introStep === 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                      className="text-center"
                    >
                      <h1
                        className="font-extrabold"
                        style={{
                          fontSize: 'clamp(1.8rem, 6vw, 3rem)',
                          color: '#FF5722',
                          textShadow: '0 2px 8px rgba(255,87,34,0.2)',
                        }}
                      >
                        Math Owl
                      </h1>
                      <p
                        className="font-bold mt-1"
                        style={{
                          fontSize: 'clamp(1rem, 3vw, 1.4rem)',
                          color: '#1565C0',
                        }}
                      >
                        Learn Addition
                      </p>
                    </motion.div>
                  )}
                  <ContinueButton onClick={handleContinueIntro} label="Let's Go" />
                </motion.div>
              )}

              {/* DEMO */}
              {state.phase === 'demo' && (
                <motion.div
                  key="demo"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div
                    className="rounded-3xl px-8 py-6"
                    style={{
                      background: 'rgba(255,255,255,0.9)',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                    }}
                  >
                    <FruitAnimation
                      emoji={level.demoEmoji}
                      groupA={level.demoA}
                      groupB={level.demoB}
                      mode="demo"
                    />
                  </div>
                  <ContinueButton onClick={handleContinueDemo} />
                </motion.div>
              )}

              {/* QUIZ */}
              {(state.phase === 'quiz' || state.phase === 'feedback' || state.phase === 'counting') && question && (
                <motion.div
                  key={`quiz-${state.currentQuestion}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-8 w-full"
                >
                  {state.phase === 'counting' && question.visual ? (
                    <div
                      className="rounded-3xl px-8 py-6"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                      }}
                    >
                      <FruitAnimation
                        emoji={question.visual.emoji}
                        groupA={question.a}
                        groupB={question.b}
                        mode="counting"
                        countUpTo={countStep}
                      />
                    </div>
                  ) : state.phase === 'counting' ? (
                    <div
                      className="rounded-3xl px-8 py-6"
                      style={{
                        background: 'rgba(255,255,255,0.9)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
                      }}
                    >
                      <FruitAnimation
                        emoji="🔵"
                        groupA={question.a}
                        groupB={question.b}
                        mode="counting"
                        countUpTo={countStep}
                      />
                    </div>
                  ) : (
                    <QuestionCard question={question} />
                  )}

                  <div className="flex gap-4 flex-wrap justify-center">
                    {question.options.map((opt, i) => (
                      <AnswerButton
                        key={`${state.currentQuestion}-${opt}`}
                        value={opt}
                        index={i}
                        onClick={handleSelectAnswer}
                        disabled={state.answerResult !== null}
                        state={getAnswerButtonState(opt)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* LEVEL COMPLETE */}
              {state.phase === 'level-complete' && (
                <motion.div
                  key="level-complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  >
                    <div style={{ fontSize: 'clamp(3rem, 10vw, 5rem)' }}>
                      {state.score === level.questions.length ? '🌟🌟🌟' : state.score >= 2 ? '🌟🌟' : '🌟'}
                    </div>
                  </motion.div>
                  <h2
                    className="font-extrabold"
                    style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: '#FF5722' }}
                  >
                    Level Complete!
                  </h2>
                  <p
                    className="font-bold"
                    style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#333' }}
                  >
                    You got {state.score} out of {level.questions.length} correct!
                  </p>
                  <ContinueButton
                    onClick={handleNextLevel}
                    label={state.currentLevel < LEVELS.length - 1 ? 'Next Level' : 'Finish'}
                  />
                </motion.div>
              )}

              {/* GAME COMPLETE */}
              {state.phase === 'game-complete' && (
                <motion.div
                  key="game-complete"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-6 text-center"
                >
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                  >
                    <div style={{ fontSize: 'clamp(4rem, 12vw, 6rem)' }}>🏆</div>
                  </motion.div>
                  <h2
                    className="font-extrabold"
                    style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', color: '#FF5722' }}
                  >
                    You're an Addition Superstar!
                  </h2>
                  <p
                    className="font-bold"
                    style={{ fontSize: 'clamp(1rem, 3vw, 1.3rem)', color: '#333' }}
                  >
                    You completed all levels!
                  </p>
                  <ContinueButton onClick={handleRestart} label="Play Again" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Celebration
        show={state.showCelebration}
        intensity={state.phase === 'level-complete' || state.phase === 'game-complete' ? 'large' : 'small'}
      />
    </div>
  )
}
