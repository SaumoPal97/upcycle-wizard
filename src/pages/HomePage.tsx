import { HeroSection } from '@/components/Home/HeroSection'
import { CommunityFeed } from '@/components/Home/CommunityFeed'
import { StatsSection } from '@/components/Home/StatsSection'

export function HomePage() {
  return (
    <div className="min-h-screen w-full">
      <HeroSection />
      <CommunityFeed />
      <StatsSection />
    </div>
  )
}