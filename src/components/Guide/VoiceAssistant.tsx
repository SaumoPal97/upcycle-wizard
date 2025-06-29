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
  allSteps: Step[]
}

export function VoiceAssistant({ project, currentStep, allSteps }: VoiceAssistantProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

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

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setError('Speech recognition failed. Please try again.')
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true)
      setTranscript('')
      setResponse('')
      setError(null)
      recognitionRef.current.start()
    } else {
      setError('Speech recognition is not supported in your browser.')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    setIsListening(false)
  }

  const handleVoiceQuery = async (query: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      // Generate response based on the query and current context
      const contextualResponse = generateContextualResponse(query, project, currentStep, allSteps)
      setResponse(contextualResponse)
      
      // Convert text to speech using ElevenLabs
      await speakWithElevenLabs(contextualResponse)
      
    } catch (error) {
      console.error('Error processing voice query:', error)
      const errorMessage = 'Sorry, I had trouble processing that. Could you try again?'
      setResponse(errorMessage)
      setError('Voice processing failed')
      
      // Fallback to browser speech synthesis
      fallbackToNativeSpeech(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  const speakWithElevenLabs = async (text: string) => {
    try {
      setIsSpeaking(true)
      
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/text-to-speech`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.0,
            use_speaker_boost: true
          }
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('ElevenLabs TTS error:', errorData)
        throw new Error(errorData.error || 'Text-to-speech service failed')
      }

      // Get audio blob and play it
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)
      
      audioRef.current = new Audio(audioUrl)
      audioRef.current.onended = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
      }
      audioRef.current.onerror = () => {
        setIsSpeaking(false)
        URL.revokeObjectURL(audioUrl)
        console.error('Audio playback failed')
        // Fallback to native speech
        fallbackToNativeSpeech(text)
      }
      
      await audioRef.current.play()
      
    } catch (error) {
      console.error('ElevenLabs TTS error:', error)
      setIsSpeaking(false)
      throw error
    }
  }

  const fallbackToNativeSpeech = (text: string) => {
    try {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      utterance.volume = 0.8
      
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      
      window.speechSynthesis.speak(utterance)
    } catch (error) {
      console.error('Fallback speech synthesis failed:', error)
      setIsSpeaking(false)
    }
  }

  const generateContextualResponse = (query: string, project: Project, currentStep?: Step, allSteps: Step[] = []): string => {
    const lowerQuery = query.toLowerCase()
    
    // Extract step numbers from query (e.g., "step 3", "third step", "step three")
    const stepNumberMatch = lowerQuery.match(/step\s+(\d+|one|two|three|four|five|six|seven|eight|nine|ten)/i)
    const ordinalMatch = lowerQuery.match(/(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+step/i)
    
    let targetStep: Step | undefined = undefined
    let stepNumber: number | undefined = undefined
    
    if (stepNumberMatch) {
      const stepText = stepNumberMatch[1].toLowerCase()
      const numberMap: { [key: string]: number } = {
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10
      }
      stepNumber = isNaN(parseInt(stepText)) ? numberMap[stepText] : parseInt(stepText)
    } else if (ordinalMatch) {
      const ordinalText = ordinalMatch[1].toLowerCase()
      const ordinalMap: { [key: string]: number } = {
        'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
        'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10
      }
      stepNumber = ordinalMap[ordinalText]
    }
    
    if (stepNumber && stepNumber <= allSteps.length) {
      targetStep = allSteps.find(step => step.step_number === stepNumber)
    }

    // Specific step queries
    if (targetStep) {
      if (lowerQuery.includes('what') && (lowerQuery.includes('do') || lowerQuery.includes('next'))) {
        return `For step ${targetStep.step_number}, "${targetStep.title}", you need to ${targetStep.description}. The estimated time is ${targetStep.estimated_time || 'about 30 minutes'}.`
      }
      
      if (lowerQuery.includes('tools') || lowerQuery.includes('need')) {
        const tools = targetStep.tools_needed.join(', ')
        return `For step ${targetStep.step_number}, "${targetStep.title}", you'll need these tools: ${tools}.`
      }
      
      if (lowerQuery.includes('materials')) {
        const materials = targetStep.materials_needed.join(', ')
        return `For step ${targetStep.step_number}, the materials you'll need are: ${materials}.`
      }
      
      if (lowerQuery.includes('time') || lowerQuery.includes('long')) {
        return `Step ${targetStep.step_number} should take approximately ${targetStep.estimated_time || '30 minutes'} to complete.`
      }
    }

    // Current step-specific responses
    if (currentStep) {
      if (lowerQuery.includes('current') || (lowerQuery.includes('this') && lowerQuery.includes('step'))) {
        return `You're currently on step ${currentStep.step_number}: "${currentStep.title}". ${currentStep.description}`
      }
      
      if (lowerQuery.includes('what') && (lowerQuery.includes('do') || lowerQuery.includes('next')) && !targetStep) {
        return `For this step, you need to ${currentStep.description}. The estimated time is ${currentStep.estimated_time || 'about 30 minutes'}.`
      }
      
      if (lowerQuery.includes('tools') && !targetStep) {
        const tools = currentStep.tools_needed.join(', ')
        return `For this step, you'll need these tools: ${tools}.`
      }
      
      if (lowerQuery.includes('materials') && !targetStep) {
        const materials = currentStep.materials_needed.join(', ')
        return `The materials you'll need are: ${materials}.`
      }
      
      if (lowerQuery.includes('time') || lowerQuery.includes('long')) {
        return `This step should take approximately ${currentStep.estimated_time || '30 minutes'} to complete.`
      }
      
      if (lowerQuery.includes('repeat') || lowerQuery.includes('again')) {
        return `Let me repeat the instructions for this step: ${currentStep.description}`
      }
    }

    // Overview and navigation queries
    if (lowerQuery.includes('overview') || lowerQuery.includes('summary')) {
      const stepsList = allSteps.map(step => `Step ${step.step_number}: ${step.title}`).join(', ')
      return `Here's an overview of all ${allSteps.length} steps: ${stepsList}. You can ask me about any specific step by saying "tell me about step" followed by the number.`
    }

    if (lowerQuery.includes('next step') && currentStep) {
      const nextStep = allSteps.find(step => step.step_number === currentStep.step_number + 1)
      if (nextStep) {
        return `The next step is step ${nextStep.step_number}: "${nextStep.title}". ${nextStep.description}`
      } else {
        return `You're on the final step! Once you complete this step, your project will be finished.`
      }
    }

    if (lowerQuery.includes('previous step') && currentStep) {
      const prevStep = allSteps.find(step => step.step_number === currentStep.step_number - 1)
      if (prevStep) {
        return `The previous step was step ${prevStep.step_number}: "${prevStep.title}". ${prevStep.description}`
      } else {
        return `You're on the first step of the project.`
      }
    }

    if (lowerQuery.includes('how many steps') || lowerQuery.includes('total steps')) {
      return `This project has ${allSteps.length} steps in total. You can ask me about any specific step by number.`
    }

    if (lowerQuery.includes('list') && lowerQuery.includes('steps')) {
      const stepsList = allSteps.map(step => `Step ${step.step_number}: ${step.title} (${step.estimated_time || '30 minutes'})`).join('. ')
      return `Here are all the steps: ${stepsList}`
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
      return "I'm here to help! You can ask me about any step by number, the current step, what tools you need, how long something takes, or get an overview of the entire project. Just tap the microphone and ask away!"
    }
    
    if (lowerQuery.includes('safety') || lowerQuery.includes('safe')) {
      return "Always prioritize safety! Wear protective equipment like safety glasses and gloves when needed. Make sure your workspace is well-ventilated, especially when using paints or stains. Take breaks if you feel tired."
    }
    
    // Default responses
    return "I can help you with information about any step in your guide, tools needed, materials, timing, or general project questions. Try asking about a specific step number, like 'What do I do in step 3?' or 'What tools do I need for step 2?'"
  }

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
      setIsSpeaking(false)
    }
    
    // Also stop native speech synthesis as fallback
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
  }

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 shadow-lg z-50 transition-all duration-300 hover:scale-110"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-xl z-50 border-emerald-200 bg-white">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isSpeaking ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-600'}`} />
            <span className="font-medium text-gray-900">Voice Assistant</span>
            {isProcessing && (
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center space-x-2">
            {isSpeaking && (
              <Button
                size="sm"
                variant="ghost"
                onClick={stopSpeaking}
                className="bg-white border-emerald-600 hover:border-emerald-600 p-1 h-8 w-8 hover:bg-red-50"
              >
                <VolumeX className="bg-white border-emerald-600 hover:border-emerald-600 w-4 h-4 text-red-600" />
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="p-1 h-8 w-8 hover:bg-gray-100"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="text-center mb-4">
          <Button
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing || isSpeaking}
            className={`w-16 h-16 rounded-full transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse scale-110' 
                : isProcessing || isSpeaking
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-700 hover:scale-105'
            }`}
          >
            {isListening ? (
              <MicOff className="w-8 h-8 text-white" />
            ) : (
              <Mic className="w-8 h-8 text-white" />
            )}
          </Button>
          
          <p className="text-sm text-emerald-600 mt-2 font-medium">
            {isListening 
              ? 'Listening...' 
              : isProcessing 
              ? 'Processing...'
              : isSpeaking
              ? 'Speaking...'
              : 'Tap to ask a question'
            }
          </p>
        </div>

        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">
              <strong>Error:</strong> {error}
            </p>
          </div>
        )}

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
          Ask me about any step, tools, materials, or project details!
        </p>
      </CardContent>
    </Card>
  )
}