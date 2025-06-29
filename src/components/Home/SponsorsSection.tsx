import { ExternalLink } from 'lucide-react'

export function SponsorsSection() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="w-full px-4 py-3">
        <div className="flex justify-end">
          <div className="flex items-center space-x-6">
            <span className="text-sm text-gray-600 font-medium">Powered by:</span>
            
            {/* Anthropic Badge */}
            <a
              href="https://www.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              title="AI powered by Anthropic"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/anthropic/logo-black.svg"
                alt="Anthropic"
                className="w-6 h-6 md:w-8 md:h-8"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Anthropic
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* Supabase Badge */}
            <a
              href="https://supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              title="Database powered by Supabase"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/supabase/wordmark-color.svg"
                alt="Supabase"
                className="h-4 md:h-5"
              />
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* ElevenLabs Badge */}
            <a
              href="https://elevenlabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              title="Voice AI powered by ElevenLabs"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/elevenlabs/logo-black.svg"
                alt="ElevenLabs"
                className="w-6 h-6 md:w-8 md:h-8"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                ElevenLabs
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* Netlify Badge */}
            <a
              href="https://www.netlify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              title="Deployed on Netlify"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/netlify/wordmark-color.svg"
                alt="Netlify"
                className="h-4 md:h-5"
              />
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>
            
            {/* Bolt.new Badge */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 hover:opacity-80 transition-opacity duration-200"
              title="Built with Bolt.new"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.svg"
                alt="Bolt.new"
                className="w-8 h-8 md:w-10 md:h-10"
              />
              <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Bolt.new
              </span>
              <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}