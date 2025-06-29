import { useState, useEffect } from 'react'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

interface GuideCreationScreenProps {
  onComplete: () => void
}

interface LoadingStep {
  id: string
  text: string
  duration: number
}

const loadingSteps: LoadingStep[] = [
  { id: 'analyzing', text: 'Analyzing your furniture...', duration: 3000 },
  { id: 'generating', text: 'Generating personalized guide...', duration: 4000 },
  { id: 'images', text: 'Creating step-by-step images...', duration: 3500 },
  { id: 'finalizing', text: 'Finalizing recommendations...', duration: 2500 },
]

export function GuideCreationScreen({ onComplete }: GuideCreationScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    if (currentStepIndex >= loadingSteps.length) {
      setIsComplete(true)
      return
    }

    const currentStep = loadingSteps[currentStepIndex]
    const stepProgress = (currentStepIndex / loadingSteps.length) * 100
    
    // Animate progress for current step
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        const nextProgress = stepProgress + ((currentStepIndex + 1) / loadingSteps.length) * 100
        if (prev >= nextProgress) {
          clearInterval(progressInterval)
          return nextProgress
        }
        return prev + 2
      })
    }, 50)

    // Move to next step after duration
    const stepTimeout = setTimeout(() => {
      setCurrentStepIndex(prev => prev + 1)
    }, currentStep.duration)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(stepTimeout)
    }
  }, [currentStepIndex])

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Your Plan is Ready! 🎉
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            We've created a personalized upcycling guide just for you, complete with step-by-step instructions and material recommendations.
          </p>

          {/* CTA Button */}
          <Button
            onClick={onComplete}
            size="lg"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            View Your Guide
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Loading Icon */}
        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8">
          <Sparkles className="w-12 h-12 text-white animate-spin" />
        </div>

        {/* Main Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Creating Your Guide
        </h1>

        {/* Loading Steps */}
        <div className="space-y-4 mb-8">
          {loadingSteps.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center p-4 rounded-lg transition-all duration-500 ${
                index === currentStepIndex
                  ? 'bg-emerald-100 border-2 border-emerald-300'
                  : index < currentStepIndex
                  ? 'bg-emerald-50 border border-emerald-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 transition-all duration-300 ${
                index < currentStepIndex
                  ? 'bg-emerald-600'
                  : index === currentStepIndex
                  ? 'bg-emerald-400'
                  : 'bg-gray-300'
              }`}>
                {index < currentStepIndex ? (
                  <CheckCircle className="w-4 h-4 text-white" />
                ) : index === currentStepIndex ? (
                  <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-3 h-3 bg-white rounded-full opacity-50" />
                )}
              </div>
              
              <span className={`text-left transition-colors duration-300 ${
                index === currentStepIndex
                  ? 'text-emerald-800 font-medium'
                  : index < currentStepIndex
                  ? 'text-emerald-700'
                  : 'text-gray-500'
              }`}>
                {step.text}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress 
            value={progress} 
            className="h-3 bg-emerald-100"
          />
          <p className="text-sm text-emerald-600 font-medium">
            {Math.round(progress)}% complete
          </p>
        </div>
      </div>
    </div>
  )
}