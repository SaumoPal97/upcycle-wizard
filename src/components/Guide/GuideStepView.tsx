import { useState } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Step = Database['public']['Tables']['steps']['Row']

interface GuideStepViewProps {
  project: Project
  steps: Step[]
  currentStepIndex: number
  completedSteps: Set<number>
  onStepComplete: (stepIndex: number) => void
  onStepChange: (stepIndex: number) => void
  onBackToOverview: () => void
}

export function GuideStepView({
  project,
  steps,
  currentStepIndex,
  completedSteps,
  onStepComplete,
  onStepChange,
  onBackToOverview
}: GuideStepViewProps) {
  const currentStep = steps[currentStepIndex]
  const isCompleted = completedSteps.has(currentStepIndex)
  const progressPercentage = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0

  if (!currentStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Step not found</h1>
          <Button onClick={onBackToOverview} variant="outline">
            Back to Overview
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="w-full px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={onBackToOverview}
              className="bg-white border-emerald-600 flex items-center space-x-2 text-emerald-600 hover:text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Explore</span>
            </Button>
            
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-600">
                Step {currentStepIndex + 1} of {steps.length}
              </div>
              <div className="text-xs text-gray-500">
                {completedSteps.size} completed
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b px-4 py-2">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-gray-100"
        />
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-lg">
            {/* Step Image */}
            <div className="aspect-video bg-gray-200 relative">
              {currentStep.image_url ? (
                <img
                  src={currentStep.image_url}
                  alt={currentStep.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-emerald-200 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl font-bold text-emerald-700">
                        {currentStepIndex + 1}
                      </span>
                    </div>
                    <p className="text-emerald-600 font-medium">Step {currentStepIndex + 1}</p>
                  </div>
                </div>
              )}
            </div>

            <CardContent className="p-8">
              {/* Step Header */}
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {currentStep.title}
                </h1>
                
                <Button
                  onClick={() => onStepComplete(currentStepIndex)}
                  variant={isCompleted ? "default" : "outline"}
                  className={`flex items-center space-x-2 ${
                    isCompleted 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isCompleted ? 'Completed' : 'Mark Complete'}</span>
                </Button>
              </div>

              {/* Step Description */}
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                {currentStep.description}
              </p>

              {/* Tools and Materials */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Tools Needed:</h3>
                  <ul className="space-y-2">
                    {currentStep.tools_needed.map((tool, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                        <span className="text-gray-700">{tool}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-4">Materials:</h3>
                  <ul className="space-y-2">
                    {currentStep.materials_needed.map((material, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-emerald-600 rounded-full" />
                        <span className="text-gray-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Estimated Time */}
              {currentStep.estimated_time && (
                <div className="flex items-center space-x-2 p-4 bg-emerald-50 rounded-lg mb-8">
                  <Clock className="w-5 h-5 text-emerald-600" />
                  <span className="text-emerald-800 font-medium">
                    Estimated time: {currentStep.estimated_time}
                  </span>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => onStepChange(Math.max(0, currentStepIndex - 1))}
                  disabled={currentStepIndex === 0}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </Button>

                {/* Progress Dots */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500 mr-2">Progress: {Math.round(progressPercentage)}%</span>
                  <div className="flex space-x-1">
                    {steps.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => onStepChange(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          completedSteps.has(index)
                            ? 'bg-emerald-600'
                            : index === currentStepIndex
                            ? 'bg-emerald-400'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => onStepChange(Math.min(steps.length - 1, currentStepIndex + 1))}
                  disabled={currentStepIndex === steps.length - 1}
                  className="bg-emerald-600 hover:bg-emerald-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}