import { ExternalLink } from 'lucide-react'

export function SponsorsSection() {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="w-full px-4 py-3">
        <div className="flex justify-end">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 font-medium">Powered by:</span>
            
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