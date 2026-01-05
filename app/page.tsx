import { HeroSection } from "@/components/sections/hero-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { StatsSection } from "@/components/sections/stats-section"
import { CommunityShowcase } from "@/components/sections/community-showcase"
import { CTASection } from "@/components/sections/cta-section"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <StatsSection />
        <CommunityShowcase />
        <FeaturesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}
