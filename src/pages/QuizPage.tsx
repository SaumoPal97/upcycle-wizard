import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { QuizProgress } from '@/components/Quiz/QuizProgress'
import { QuizNavigation } from '@/components/Quiz/QuizNavigation'
import { GuideCreationScreen } from '@/components/Quiz/GuideCreationScreen'
import { PhotoUploadStep } from '@/components/Quiz/Steps/PhotoUploadStep'
import { FurnitureTypeStep } from '@/components/Quiz/Steps/FurnitureTypeStep'
import { SizeStep } from '@/components/Quiz/Steps/SizeStep'
import { MaterialStep } from '@/components/Quiz/Steps/MaterialStep'
import { ConditionStep } from '@/components/Quiz/Steps/ConditionStep'
import { RoomStep } from '@/components/Quiz/Steps/RoomStep'
import { StyleStep } from '@/components/Quiz/Steps/StyleStep'
import { ColorStep } from '@/components/Quiz/Steps/ColorStep'
import { AddonsStep } from '@/components/Quiz/Steps/AddonsStep'
import { RecyclablesStep } from '@/components/Quiz/Steps/RecyclablesStep'
import { ToolsStep } from '@/components/Quiz/Steps/ToolsStep'
import { BudgetStep } from '@/components/Quiz/Steps/BudgetStep'
import { useQuizState } from '@/hooks/useQuizState'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

const TOTAL_STEPS = 12

export function QuizPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    quizData,
    currentStep,
    setCurrentStep,
    updateQuizData,
    isStepValid,
    canSubmit,
  } = useQuizState()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showGuideCreation, setShowGuideCreation] = useState(false)
  const [generatedProjectId, setGeneratedProjectId] = useState<string | null>(null)

  // Check for initial prompt from home page
  useEffect(() => {
    const initialPrompt = sessionStorage.getItem('upcycle-prompt')
    if (initialPrompt) {
      // Store prompt for later use in guide generation
      updateQuizData({ initialPrompt })
      sessionStorage.removeItem('upcycle-prompt')
    }
  }, [updateQuizData])

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!user || !canSubmit()) return

    setSubmitting(true)
    setError(null)
    
    try {
      console.log('Starting quiz submission for user:', user.id)
      
      // Create project in database
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          title: `${quizData.furnitureType} Upcycling Project`,
          quiz_data: quizData,
          guide_json: {},
          public: false,
        })
        .select()
        .single()

      if (projectError) {
        console.error('Database error creating project:', projectError)
        throw new Error(`Failed to create project: ${projectError.message}`)
      }

      console.log('Project created successfully:', project.id)
      setGeneratedProjectId(project.id)

      // Show the guide creation screen
      setShowGuideCreation(true)

      // Start the guide generation in the background
      generateGuideInBackground(project.id)

    } catch (error) {
      console.error('Error submitting quiz:', error)
      
      let userFriendlyMessage = 'Failed to generate your upcycling guide. '
      
      if (error.message.includes('AI service is not properly configured') || 
          error.message.includes('MISSING_API_KEY')) {
        userFriendlyMessage += 'Our AI service needs to be configured. Please contact support or try again later.'
      } else if (error.message.includes('rate limit') || 
                 error.message.includes('Too many requests')) {
        userFriendlyMessage += 'Too many people are using the service right now. Please wait a few minutes and try again.'
      } else if (error.message.includes('AI service authentication') || 
                 error.message.includes('INVALID_API_KEY')) {
        userFriendlyMessage += 'There\'s an issue with our AI service authentication. Please contact support.'
      } else if (error.message.includes('temporarily unavailable') || 
                 error.message.includes('EXTERNAL_API_ERROR')) {
        userFriendlyMessage += 'Our AI service is temporarily down. Please try again in a few minutes.'
      } else if (error.message.includes('Database') || 
                 error.message.includes('DATABASE_ERROR')) {
        userFriendlyMessage += 'There was a database issue. Please try again.'
      } else {
        userFriendlyMessage += 'Please try again or contact support if the problem persists.'
      }
      
      setError(userFriendlyMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const generateGuideInBackground = async (projectId: string) => {
    try {
      // Call edge function to generate guide
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-guide`
      console.log('Calling edge function:', functionUrl)
      
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId,
          quizData,
        }),
      })

      console.log('Edge function response:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok) {
        let errorMessage = 'Failed to generate guide'
        let errorDetails = ''
        
        try {
          const errorData = await response.json()
          console.error('Edge function error response:', errorData)
          
          if (errorData.error) {
            errorMessage = errorData.error
          }
          
          if (errorData.code) {
            switch (errorData.code) {
              case 'MISSING_API_KEY':
                errorDetails = 'The AI service is not properly configured. Please contact support.'
                break
              case 'RATE_LIMIT_EXCEEDED':
                errorDetails = 'Too many requests. Please try again in a few minutes.'
                break
              case 'INVALID_API_KEY':
                errorDetails = 'AI service authentication failed. Please contact support.'
                break
              case 'EXTERNAL_API_ERROR':
                errorDetails = 'AI service is temporarily unavailable. Please try again later.'
                break
              case 'DATABASE_ERROR':
                errorDetails = 'Database operation failed. Please try again.'
                break
              default:
                errorDetails = errorData.details || 'Unknown error occurred'
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorDetails = `Server returned ${response.status}: ${response.statusText}`
        }
        
        throw new Error(`${errorMessage}${errorDetails ? ` - ${errorDetails}` : ''}`)
      }

      const result = await response.json()
      console.log('Guide generation successful:', result)
      
    } catch (error) {
      console.error('Background guide generation failed:', error)
      // Don't show error to user since they're already on the loading screen
      // The guide creation screen will handle the completion regardless
    }
  }

  const handleGuideCreationComplete = () => {
    if (generatedProjectId) {
      navigate(`/project/${generatedProjectId}`)
    } else {
      // Fallback to home page if no project ID
      navigate('/')
    }
  }

  // Show guide creation screen if submitting
  if (showGuideCreation) {
    return <GuideCreationScreen onComplete={handleGuideCreationComplete} />
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhotoUploadStep
            photos={quizData.photos}
            onUpdate={(photos) => updateQuizData({ photos })}
          />
        )
      case 2:
        return (
          <FurnitureTypeStep
            furnitureType={quizData.furnitureType}
            onUpdate={(furnitureType) => updateQuizData({ furnitureType })}
          />
        )
      case 3:
        return (
          <SizeStep
            size={quizData.size}
            onUpdate={(size) => updateQuizData({ size })}
          />
        )
      case 4:
        return (
          <MaterialStep
            materials={quizData.materials}
            onUpdate={(materials) => updateQuizData({ materials })}
          />
        )
      case 5:
        return (
          <ConditionStep
            condition={quizData.condition}
            onUpdate={(condition) => updateQuizData({ condition })}
          />
        )
      case 6:
        return (
          <RoomStep
            rooms={quizData.rooms}
            onUpdate={(rooms) => updateQuizData({ rooms })}
          />
        )
      case 7:
        return (
          <StyleStep
            style={quizData.style}
            onUpdate={(style) => updateQuizData({ style })}
          />
        )
      case 8:
        return (
          <ColorStep
            colorVibe={quizData.colorVibe}
            customColor={quizData.customColor}
            onUpdate={(colorVibe, customColor) => updateQuizData({ colorVibe, customColor })}
          />
        )
      case 9:
        return (
          <AddonsStep
            addons={quizData.addons}
            onUpdate={(addons) => updateQuizData({ addons })}
          />
        )
      case 10:
        return (
          <RecyclablesStep
            recyclables={quizData.recyclables}
            customRecyclables={quizData.customRecyclables}
            onUpdate={(recyclables, customRecyclables) => 
              updateQuizData({ recyclables, customRecyclables })
            }
          />
        )
      case 11:
        return (
          <ToolsStep
            tools={quizData.tools}
            onUpdate={(tools) => updateQuizData({ tools })}
          />
        )
      case 12:
        return (
          <BudgetStep
            budget={quizData.budget}
            onUpdate={(budget) => updateQuizData({ budget })}
          />
        )
      default:
        return null
    }
  }

  // Count completed steps
  const completedSteps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1)
    .filter(step => isStepValid(step)).length

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizProgress 
        currentStep={currentStep} 
        totalSteps={TOTAL_STEPS}
        completedSteps={completedSteps}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center space-x-2 text-emerald-600 bg-white border-emerald-600 hover:text-emerald-600 hover:border-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quiz</span>
            </Button>
            
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-600">
                Step {currentStep} of {TOTAL_STEPS}
              </div>
              <div className="text-xs text-gray-500">
                {completedSteps} completed
              </div>
            </div>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            {renderCurrentStep()}
          </div>

          <QuizNavigation
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            canGoNext={isStepValid(currentStep)}
            canSubmit={canSubmit()}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onSubmit={handleSubmit}
            loading={submitting}
          />
        </div>
      </div>
    </div>
  )
}