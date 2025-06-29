import { Progress } from '@/components/ui/progress'

interface QuizProgressProps {
  currentStep: number
  totalSteps: number
  completedSteps: number
}

export function QuizProgress({ currentStep, totalSteps, completedSteps }: QuizProgressProps) {
  const progressPercentage = ((currentStep - 1) / totalSteps) * 100

  return (
    <div className="w-full bg-white border-b border-gray-200 p-4">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">
            Step {currentStep} of {totalSteps}
          </span>
          <span className="text-sm text-emerald-600 font-medium">
            {completedSteps} completed
          </span>
        </div>
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-100"
        />
      </div>
    </div>
  )
}