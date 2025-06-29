import { ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QuizNavigationProps {
  currentStep: number
  totalSteps: number
  canGoNext: boolean
  canSubmit: boolean
  onPrevious: () => void
  onNext: () => void
  onSubmit: () => void
  loading?: boolean
}

export function QuizNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  canSubmit,
  onPrevious,
  onNext,
  onSubmit,
  loading = false
}: QuizNavigationProps) {
  const isLastStep = currentStep === totalSteps

  return (
    <div className="flex items-center justify-between pt-6 border-t border-gray-200">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center space-x-2"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Previous</span>
      </Button>

      <div className="flex space-x-2">
        <div className="text-sm text-gray-500 flex items-center">
          Progress: {Math.round(((currentStep - 1) / totalSteps) * 100)}%
        </div>
        <div className="flex space-x-1">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                i < currentStep - 1
                  ? 'bg-emerald-600'
                  : i === currentStep - 1
                  ? 'bg-emerald-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {isLastStep ? (
        <Button
          onClick={onSubmit}
          disabled={!canSubmit || loading}
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <span>Submit & Get My DIY Plan</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
        >
          <span>Next</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      )}
    </div>
  )
}