"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedTextProps {
  texts: string[]
  className?: string
  interval?: number
}

export function AnimatedText({ texts, className = "", interval = 3000 }: AnimatedTextProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length)
    }, interval)

    return () => clearInterval(timer)
  }, [texts.length, interval])

  return (
    <motion.span
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {texts[currentIndex]}
    </motion.span>
  )
}
