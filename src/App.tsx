import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { Header } from '@/components/Layout/Header'
import { Footer } from '@/components/Layout/Footer'
import { HomePage } from '@/pages/HomePage'
import { QuizPage } from '@/pages/QuizPage'
import { ExplorePage } from '@/pages/ExplorePage'
import { AuthPage } from '@/pages/AuthPage'
import { ProjectPage } from '@/pages/ProjectPage'
import { Toaster } from '@/components/ui/sonner'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col w-full">
          <Header />
          <main className="flex-1 w-full">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/quiz" element={<QuizPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/project/:id" element={<ProjectPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App