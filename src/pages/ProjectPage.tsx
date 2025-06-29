import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, BarChart3, DollarSign, Play, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { GuideStepView } from '@/components/Guide/GuideStepView'
import { VoiceAssistant } from '@/components/Guide/VoiceAssistant'
import { FeedbackModal } from '@/components/Guide/FeedbackModal'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Database } from '@/types/database'
import confetti from 'canvas-confetti'

type Project = Database['public']['Tables']['projects']['Row']
type Step = Database['public']['Tables']['steps']['Row']

export function ProjectPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState<'overview' | 'steps'>('overview')
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())
  const [showFeedback, setShowFeedback] = useState(false)

  useEffect(() => {
    if (id) {
      fetchProject()
    }
  }, [id])

  const fetchProject = async () => {
    try {
      // Fetch project
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (projectError) throw projectError

      // Fetch steps
      const { data: stepsData, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .eq('project_id', id)
        .order('step_number')

      if (stepsError) throw stepsError

      setProject(projectData)
      setSteps(stepsData || [])
    } catch (error) {
      console.error('Error fetching project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStepComplete = (stepIndex: number) => {
    const newCompleted = new Set(completedSteps)
    newCompleted.add(stepIndex)
    setCompletedSteps(newCompleted)

    // If all steps are completed, show confetti and feedback modal
    if (newCompleted.size === steps.length) {
      triggerConfetti()
      setTimeout(() => setShowFeedback(true), 1000)
    }
  }

  const triggerConfetti = () => {
    const duration = 3000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = 50 * (timeLeft / duration)
      confetti(Object.assign({}, defaults, { 
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      }))
      confetti(Object.assign({}, defaults, { 
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      }))
    }, 250)
  }

  const progressPercentage = steps.length > 0 ? (completedSteps.size / steps.length) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your guide...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Project not found</h1>
          <Button onClick={() => navigate('/')} variant="outline">
            Go Home
          </Button>
        </div>
      </div>
    )
  }

  const guide = project.guide_json as any

  if (currentView === 'steps') {
    return (
      <>
        <GuideStepView
          project={project}
          steps={steps}
          currentStepIndex={currentStepIndex}
          completedSteps={completedSteps}
          onStepComplete={handleStepComplete}
          onStepChange={setCurrentStepIndex}
          onBackToOverview={() => setCurrentView('overview')}
        />
        <VoiceAssistant project={project} currentStep={steps[currentStepIndex]} />
        <FeedbackModal
          isOpen={showFeedback}
          onClose={() => setShowFeedback(false)}
          project={project}
        />
      </>
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
              onClick={() => navigate('/explore')}
              className="flex items-center space-x-2 text-emerald-600"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Quiz</span>
            </Button>
            
            <div className="text-right">
              <div className="text-sm font-medium text-emerald-600">
                Step {completedSteps.size} of {steps.length}
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
        <Progress value={progressPercentage} className="h-2 bg-gray-100" />
      </div>

      {/* Main Content */}
      <div className="w-full px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden shadow-lg">
            <CardContent className="p-8">
              {/* Project Title */}
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {guide?.title || project.title}
              </h1>
              
              {/* Project Description */}
              <p className="text-lg text-emerald-600 mb-8 leading-relaxed">
                {guide?.overview || 'Transform your dresser into a stunning bohemian piece with earthy tones, decorative hardware, and artistic details.'}
              </p>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-gray-900">{guide?.estimated_time || '2-3 days'}</div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <BarChart3 className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-gray-900">{guide?.difficulty || 'Intermediate'}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-gray-900">{steps.length}</div>
                  <div className="text-sm text-gray-600">Steps</div>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <DollarSign className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div className="font-bold text-gray-900">${project.budget || 1000}</div>
                  <div className="text-sm text-gray-600">Budget</div>
                </div>
              </div>

              {/* Materials Needed */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Materials Needed:</h3>
                <div className="flex flex-wrap gap-2">
                  {guide?.materials_list?.map((material: string, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {material}
                    </Badge>
                  )) || [
                    'Chalk paint (sage green, cream)',
                    'Decorative knobs',
                    'Sandpaper (120, 220 grit)',
                    'Wood stain',
                    'Protective finish'
                  ].map((material, index) => (
                    <Badge key={index} variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {material}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Start Building Button */}
              <Button
                onClick={() => setCurrentView('steps')}
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <Play className="mr-2 w-5 h-5" />
                Start Building
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}