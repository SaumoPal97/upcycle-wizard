import { ExternalLink } from 'lucide-react'

export function SponsorsSection() {
  const sponsors = [
    {
      name: "Bolt",
      url: "https://bolt.new/",
      logo: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/bolt-badge/black_circle_360x360/black_circle_360x360.svg",
      title: "Built with Bolt.new"
    },
    {
      name: "Anthropic",
      url: "https://www.anthropic.com/",
      logo: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/anthropic/logo-black.svg",
      title: "AI powered by Anthropic"
    },
    {
      name: "Supabase",
      url: "https://supabase.com/",
      logo: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/supabase/logo-color.svg",
      title: "Database powered by Supabase"
    },
    {
      name: "Netlify",
      url: "https://www.netlify.com/",
      logo: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/netlify/logo-color.svg",
      title: "Deployed on Netlify"
    },
    {
      name: "ElevenLabs",
      url: "https://elevenlabs.io/",
      logo: "https://raw.githubusercontent.com/kickiniteasy/bolt-hackathon-badge/main/src/public/elevenlabs/logo-black.svg",
      title: "Voice AI powered by ElevenLabs"
    }
  ]

  return (
    <div className="w-full px-4 py-3">
      <div className="flex justify-end">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span className="mr-3">Powered by:</span>
          {sponsors.map((sponsor, index) => (
            <a
              key={sponsor.name}
              href={sponsor.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group hover:opacity-80 transition-opacity duration-200"
              title={sponsor.title}
            >
              <img
                src={sponsor.logo}
                alt={sponsor.name}
                className="w-8 h-8 hover:scale-110 transition-transform duration-200"
              />
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}