import { useState, useEffect } from 'react'
import { QuizData } from '@/types/database'

const QUIZ_STORAGE_KEY = 'upcycle-wizard-quiz'

const initialQuizData: QuizData = {
  photos: [],
  furnitureType: '',
  size: '',
  materials: [],
  condition: '',
  rooms: [],
  style: '',
  colorVibe: '',
  customColor: '',
  addons: [],
  recyclables: [],
  customRecyclables: '',
  tools: [],
  budget: null,
}

export function useQuizState() {
  const [quizData, setQuizData] = useState<QuizData>(initialQuizData)
  const [currentStep, setCurrentStep] = useState(1)

  // Load quiz data from sessionStorage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem(QUIZ_STORAGE_KEY)
    if (saved) {
      try {
        const parsedData = JSON.parse(saved)
        setQuizData(parsedData.quizData || initialQuizData)
        setCurrentStep(parsedData.currentStep || 1)
      } catch (error) {
        console.error('Failed to parse saved quiz data:', error)
      }
    }
  }, [])

  // Save quiz data to sessionStorage whenever it changes
  useEffect(() => {
    sessionStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify({ quizData, currentStep })
    )
  }, [quizData, currentStep])

  const updateQuizData = (updates: Partial<QuizData>) => {
    setQuizData(prev => ({ ...prev, ...updates }))
  }

  const resetQuiz = () => {
    setQuizData(initialQuizData)
    setCurrentStep(1)
    sessionStorage.removeItem(QUIZ_STORAGE_KEY)
  }

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1: // Photos
        return quizData.photos.length >= 2
      case 2: // Furniture Type
        return !!quizData.furnitureType
      case 3: // Size
        return !!quizData.size
      case 4: // Materials
        return quizData.materials.length > 0
      case 5: // Condition
        return !!quizData.condition
      case 6: // Rooms
        return quizData.rooms.length > 0
      case 7: // Style
        return !!quizData.style
      case 8: // Color Vibe
        return !!quizData.colorVibe
      case 9: // Addons
        return quizData.addons.length > 0
      case 10: // Recyclables
        return quizData.recyclables.length > 0 || !!quizData.customRecyclables
      case 11: // Tools
        return quizData.tools.length > 0
      case 12: // Budget
        return quizData.budget !== null
      default:
        return true
    }
  }

  const canSubmit = (): boolean => {
    return [1, 2, 3, 4, 5, 6, 7, 8].every(step => isStepValid(step))
  }

  return {
    quizData,
    currentStep,
    setCurrentStep,
    updateQuizData,
    resetQuiz,
    isStepValid,
    canSubmit,
  }
}