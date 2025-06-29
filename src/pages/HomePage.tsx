import { HeroSection } from '@/components/Home/HeroSection'
import { CommunityFeed } from '@/components/Home/CommunityFeed'
import { StatsSection } from '@/components/Home/StatsSection'
import { SponsorsSection } from '@/components/Home/SponsorsSection'

export function HomePage() {
  return (
    <div className="min-h-screen w-full">
      <SponsorsSection />
      <HeroSection />
      <CommunityFeed />
      <StatsSection />
    </div>
  )
}