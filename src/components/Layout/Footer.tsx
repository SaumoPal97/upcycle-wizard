import { Recycle, Leaf } from 'lucide-react'
import { Link } from 'react-router-dom'

export function Footer() {
  return (
    <footer className="bg-emerald-800 text-white w-full">
      <div className="w-full px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center">
                <Recycle className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl">Upcycle Wizard</span>
            </div>
            <p className="text-emerald-100 mb-4 max-w-md">
              Transforming one item at a time, together.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-emerald-200">
                <Leaf className="w-4 h-4" />
                <span className="text-sm">Supporting UN SDGs 12 & 13 for sustainable consumption and climate action.</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-white">
              <li>
                <Link to="/" className="text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/explore" className="text-white transition-colors">
                  Explore Projects
                </Link>
              </li>
              <li>
                <Link to="/quiz" className="text-white transition-colors">
                  Start Quiz
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <ul className="space-y-2 text-white">
              <li>
                <a href="#" className="text-white transition-colors">
                  Share Your Project
                </a>
              </li>
              <li>
                <a href="#" className="text-white transition-colors">
                  Help & Support
                </a>
              </li>
              <li>
                <a href="#" className="text-white transition-colors">
                  Environmental Impact
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-emerald-700 mt-8 pt-8 text-center text-emerald-200">
          <p>&copy; 2024 Upcycle Wizard. Made with 💚 for our planet.</p>
        </div>
      </div>
    </footer>
  )
}