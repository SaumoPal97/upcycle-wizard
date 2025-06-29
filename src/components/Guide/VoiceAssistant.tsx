import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, MessageCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Database } from '@/types/database'

type Project = Database['public']['Tables']['projects']['Row']
type Step = Database['public']['Tables']['steps']['Row']

interface VoiceAssistantProps {
  project: Project
  currentStep?: Step
}

export function VoiceAssistant({ project, currentStep }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setTranscript(transcript)
        handleVoiceQuery(transcript)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    // Initialize speech synthesis
    synthRef.current = window.speechSynthesis

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript('')
      setResponse('')
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleVoiceQuery = async (query: string) => {
    try {
      // Generate response based on the query and current context
      const contextualResponse = generateContextualResponse(query, project, currentStep)
      setResponse(contextualResponse)
      
      // Speak the response
      if (synthRef.current) {
        const utterance = new SpeechSynthesisUtterance(contextualResponse)
        utterance.rate = 0.9
        utterance.pitch = 1
        utterance.volume = 0.8
        
        utterance.onstart = () => setIsSpeaking(true)
        utterance.onend = () => setIsSpeaking(false)
        
        synthRef.current.speak(utterance)
      }
    } catch (error) {
      console.error('Error processing voice query:', error)
      setResponse('Sorry, I had trouble understanding that. Could you try again?')
    }
  }

  const generateContextualResponse = (query: string, project: Project, currentStep?: Step): string => {
    const lowerQuery = query.toLowerCase()
    
    // Step-specific responses
    if (currentStep) {
      if (lowerQuery.includes('what') && (lowerQuery.includes('do') || lowerQuery.includes('next'))) {
        return `For this step, you need to ${currentStep.description}. The estimated time is ${currentStep.estimated_time || 'about 30 minutes'}.`
      }
      
      if (lowerQuery.includes('tools') || lowerQuery.includes('need')) {
        const tools = currentStep.tools_needed.join(', ')
        return `For this step, you'll need these tools: ${tools}.`
      }
      
      if (lowerQuery.includes('materials')) {
        const materials = currentStep.materials_needed.join(', ')
        return `The materials you'll need are: ${materials}.`
      }
      
      if (lowerQuery.includes('time') || lowerQuery.includes('long')) {
        return `This step should take approximately ${currentStep.estimated_time || '30 minutes'} to complete.`
      }
    }
    
    // Project-specific responses
    const guide = project.guide_json as any
    
    if (lowerQuery.includes('project') || lowerQuery.includes('overview')) {
      return `You're working on ${guide?.title || project.title}. ${guide?.overview || 'This is a furniture upcycling project that will transform your piece into something beautiful and functional.'}`
    }
    
    if (lowerQuery.includes('difficulty')) {
      return `This project is rated as ${guide?.difficulty || 'intermediate'} difficulty.`
    }
    
    if (lowerQuery.includes('budget') || lowerQuery.includes('cost')) {
      return `The estimated budget for this project is $${project.budget || 'around 100 to 500'}.`
    }
    
    if (lowerQuery.includes('help') || lowerQuery.includes('stuck')) {
      return "I'm here to help! You can ask me about the current step, what tools you need, how long something takes, or any other questions about your project."
    }
    
    // Default responses
    return "I can help you with information about your current step, tools needed, materials, timing, or general project questions. What would you like to know?"
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-50"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50 border-emerald-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-emerald-600 rounded-full" />
            <span className="font-medium text-gray-900">Voice Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <Button
                size="sm"
                variant="ghost"
                onClick={stopSpeaking}
                className="p-1 h-8 w-8"
              >
                <VolumeX className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="p-1 h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            className={`w-16 h-16 rounded-full ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
          
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            {isListening ? 'Listening...' : 'Tap to ask a question'}
          </p>
        </div>

        {transcript && (
          <div className="mb-3 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>You:</strong> {transcript}
            </p>
          </div>
        )}

        {response && (
          <div className="mb-3 p-3 bg-emerald-50 rounded-lg">
            <div className="flex items-start space-x-2">
              {isSpeaking && <Volume2 className="w-4 h-4 text-emerald-600 mt-0.5 animate-pulse" />}
              <p className="text-sm text-emerald-800 flex-1">
                <strong>Assistant:</strong> {response}
              </p>
            </div>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center">
          Ask me anything about your project!
        </p>
      </CardContent>
    </Card>
  )
}