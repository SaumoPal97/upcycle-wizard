import { useState, useEffect } from 'react'
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { supabase } from '@/lib/supabase'

interface GuideCreationScreenProps {
  projectId: string
  onComplete: () => void
}

interface LoadingStep {
  id: string
  text: string
  duration: number
}

const loadingSteps: LoadingStep[] = [
  { id: 'analyzing', text: 'Analyzing your furniture...', duration: 9000 }, // 3x 3000
  { id: 'generating', text: 'Generating personalized guide...', duration: 12000 }, // 3x 4000
  { id: 'images', text: 'Creating step-by-step images...', duration: 10500 }, // 3x 3500
  { id: 'finalizing', text: 'Finalizing recommendations...', duration: 7500 }, // 3x 2500
]

export function GuideCreationScreen({ projectId, onComplete }: GuideCreationScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isVisualComplete, setIsVisualComplete] = useState(false)
  const [isGuideDataReady, setIsGuideDataReady] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Visual loading animation effect
  useEffect(() => {
    if (currentStepIndex >= loadingSteps.length) {
      setProgress(100)
      setIsVisualComplete(true)
      return
    }

    const currentStep = loadingSteps[currentStepIndex]
    const baseProgress = (currentStepIndex / loadingSteps.length) * 100
    const stepProgressIncrement = (1 / loadingSteps.length) * 100
    
    // Animate progress for current step
    let startTime = Date.now()
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime
      const stepProgress = Math.min((elapsed / currentStep.duration) * stepProgressIncrement, stepProgressIncrement)
      const totalProgress = baseProgress + stepProgress
      
      setProgress(Math.min(totalProgress, 100))
      
      if (elapsed >= currentStep.duration) {
        clearInterval(progressInterval)
      }
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

  // Polling effect to check if guide data is ready
  useEffect(() => {
    if (!projectId) return

    let pollInterval: NodeJS.Timeout
    let pollAttempts = 0
    const maxPollAttempts = 60 // 5 minutes with 5-second intervals

    const checkGuideReady = async () => {
      try {
        console.log(`🔍 Checking guide readiness for project ${projectId} (attempt ${pollAttempts + 1})`)
        
        const { data: project, error } = await supabase
          .from('projects')
          .select('guide_json, title')
          .eq('id', projectId)
          .single()

        if (error) {
          console.error('❌ Error checking project status:', error)
          
          // If it's a not found error and we've tried a few times, show error
          if (error.code === 'PGRST116' && pollAttempts > 5) {
            setError('Project not found. Please try creating a new project.')
            clearInterval(pollInterval)
            return
          }
          
          // For other errors, continue polling for a bit
          if (pollAttempts > 10) {
            setError('Unable to check project status. Please try refreshing the page.')
            clearInterval(pollInterval)
            return
          }
          
          pollAttempts++
          return
        }

        // Check if guide_json is populated and not empty
        const guideJson = project.guide_json
        const isGuideReady = guideJson && 
                           typeof guideJson === 'object' && 
                           Object.keys(guideJson).length > 0 &&
                           guideJson.steps && 
                           Array.isArray(guideJson.steps) && 
                           guideJson.steps.length > 0

        console.log(`📊 Guide status check:`, {
          hasGuideJson: !!guideJson,
          isObject: typeof guideJson === 'object',
          keyCount: guideJson ? Object.keys(guideJson).length : 0,
          hasSteps: !!(guideJson?.steps),
          stepsCount: guideJson?.steps?.length || 0,
          isReady: isGuideReady
        })

        if (isGuideReady) {
          console.log('✅ Guide data is ready!')
          setIsGuideDataReady(true)
          clearInterval(pollInterval)
        } else {
          pollAttempts++
          
          // If we've been polling for too long, show an error
          if (pollAttempts >= maxPollAttempts) {
            console.error('⏰ Polling timeout reached')
            setError('Guide generation is taking longer than expected. Please try refreshing the page or contact support.')
            clearInterval(pollInterval)
          }
        }
      } catch (error) {
        console.error('💥 Unexpected error during polling:', error)
        pollAttempts++
        
        if (pollAttempts >= maxPollAttempts) {
          setError('An unexpected error occurred. Please try refreshing the page.')
          clearInterval(pollInterval)
        }
      }
    }

    // Start polling immediately, then every 5 seconds
    checkGuideReady()
    pollInterval = setInterval(checkGuideReady, 5000)

    // Cleanup function
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [projectId])

  // Check if both conditions are met to show completion
  useEffect(() => {
    if (isVisualComplete && isGuideDataReady && !isComplete) {
      console.log('🎉 Both visual and data loading complete!')
      setIsComplete(true)
    }
  }, [isVisualComplete, isGuideDataReady, isComplete])

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-8">
            <div className="text-red-600 text-4xl">⚠️</div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {error}
          </p>

          <div className="space-y-4">
            <Button
              onClick={() => window.location.reload()}
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Refresh Page
            </Button>
            
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              size="lg"
              className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 px-8 py-4 text-lg rounded-full"
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Show completion screen
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

  // Show loading screen
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
        <div className="space-y-2 mb-4">
          <Progress 
            value={progress} 
            className="h-3 bg-emerald-100"
          />
          <p className="text-sm text-emerald-600 font-medium">
            {Math.round(progress)}% complete
          </p>
        </div>

        {/* Status Message */}
        <div className="text-sm text-gray-600">
          {isVisualComplete && !isGuideDataReady && (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Finalizing your guide...</span>
            </div>
          )}
          {!isVisualComplete && (
            <span>Processing your preferences...</span>
          )}
        </div>
      </div>
    </div>
  )
}