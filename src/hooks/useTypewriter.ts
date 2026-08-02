import { useState, useEffect, useRef } from 'react'

export function useTypewriter(text: string, speed = 40) {
  const [displayedText, setDisplayedText] = useState('')
  const [isComplete, setIsComplete] = useState(false)
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayedText('')
    setIsComplete(false)
    indexRef.current = 0

    if (!text) {
      setIsComplete(true)
      return
    }

    const interval = setInterval(() => {
      indexRef.current++
      if (indexRef.current >= text.length) {
        setDisplayedText(text)
        setIsComplete(true)
        clearInterval(interval)
      } else {
        setDisplayedText(text.slice(0, indexRef.current))
      }
    }, speed)

    return () => clearInterval(interval)
  }, [text, speed])

  return { displayedText, isComplete }
}
