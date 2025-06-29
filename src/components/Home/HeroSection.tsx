import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ArrowRight, Recycle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'

export function HeroSection() {
  const [prompt, setPrompt] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if user is logged in
    if (!user) {
      navigate('/auth')
      return
    }
    
    // Store the initial prompt in session storage for the quiz
    if (prompt.trim()) {
      sessionStorage.setItem('upcycle-prompt', prompt.trim())
    }
    navigate('/quiz')
  }

  const handleStartQuiz = () => {
    // Check if user is logged in
    if (!user) {
      navigate('/auth')
      return
    }
    
    navigate('/quiz')
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-green-50 py-20 w-full">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%2310b981%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50"></div>
      
      <div className="w-full px-4 text-center relative">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full mb-8 text-sm font-medium">
            <Recycle className="w-4 h-4" />
            <span>♻️ AI-Powered Upcycling Made Simple</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Reimagine the Old with{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
              AI Magic
            </span>
          </h1>
          
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload a photo, answer a few questions, and get a personalized 
            upcycling guide that turns your everyday items into something extraordinary—whether it's furniture, décor, or forgotten treasures waiting for a second life.
          </p>

          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
            <div className="relative flex items-center bg-white rounded-full shadow-lg border border-gray-200 overflow-hidden">
              <Input
                type="text"
                placeholder="What are you thinking of upcycling?"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="flex-1 border-none ring-0 focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none text-lg px-6 py-4 bg-transparent shadow-none"
              />
              <Button
                type="submit"
                size="lg"
                className="m-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-6"
              >
                <Sparkles className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-3">
              {user ? 'Or click to start the interactive quiz wizard' : 'Please sign in to start creating your upcycling plan'}
            </p>
          </form>

          <Button
            onClick={handleStartQuiz}
            variant="outline"
            size="lg"
            className="text-emerald-600 border-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group"
          >
            {user ? 'Start Your Upcycling Journey' : 'Sign In to Start'}
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  )
}