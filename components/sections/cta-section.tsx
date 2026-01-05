import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTASection() {
  return (
    <section className="py-16 sm:py-24">
      <div className="container">
        <div className="relative isolate overflow-hidden bg-primary rounded-3xl px-6 py-16 text-center shadow-2xl sm:px-16">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
            Ready to start your campaign?
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-foreground/90">
            Join thousands of creators who have successfully funded their projects with complete transparency and
            security.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button size="lg" variant="secondary" className="group">
                Get Started Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
              >
                Browse Campaigns
              </Button>
            </Link>
          </div>
          <div className="absolute -top-24 right-0 -z-10 transform-gpu blur-3xl" aria-hidden="true">
            <div className="aspect-[1404/767] w-[87.75rem] bg-gradient-to-r from-[#80caff] to-[#4f46e5] opacity-25"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
