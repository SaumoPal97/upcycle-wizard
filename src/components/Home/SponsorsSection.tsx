import { ExternalLink } from 'lucide-react'

export function SponsorsSection() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="w-full px-4 py-4 md:py-6">
        <div className="flex justify-center">
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            <span className="text-sm md:text-base text-gray-600 font-medium w-full text-center md:w-auto mb-2 md:mb-0">
              Powered by:
            </span>
            
            {/* 1. Bolt.new Badge */}
            <a
              href="https://bolt.new/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="Built with Bolt.new"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.svg"
                alt="Bolt.new"
                className="w-8 h-8 md:w-12 md:h-12 lg:w-14 lg:h-14"
              />
              <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Bolt
              </span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* 2. Anthropic Badge */}
            <a
              href="https://www.anthropic.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="AI powered by Anthropic"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/anthropic/logo-black.svg"
                alt="Anthropic"
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
              <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Anthropic
              </span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* 3. Supabase Badge */}
            <a
              href="https://supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="Database powered by Supabase"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/supabase/logo-color.svg"
                alt="Supabase"
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
              <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Supabase
              </span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* 4. Netlify Badge */}
            <a
              href="https://www.netlify.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="Deployed on Netlify"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/netlify/logo-color.svg"
                alt="Netlify"
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
              <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                Netlify
              </span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>

            {/* 5. ElevenLabs Badge */}
            <a
              href="https://elevenlabs.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center space-x-2 md:space-x-3 hover:opacity-80 transition-opacity duration-200 p-2 rounded-lg hover:bg-gray-50"
              title="Voice AI powered by ElevenLabs"
            >
              <img
                src="https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/elevenlabs/logo-black.svg"
                alt="ElevenLabs"
                className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12"
              />
              <span className="text-sm md:text-base lg:text-lg font-medium text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                ElevenLabs
              </span>
              <ExternalLink className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}