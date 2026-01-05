"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const fundingCategories = [
    {
      id: 1,
      title: "Education",
      description: "Learning & Development",
      image: "https://images.unsplash.com/photo-1523240798131-33771a4d0c6b?w=800&h=600&fit=crop&crop=center",
      color: "from-blue-500 to-blue-600",
      icon: "🎓"
    },
    {
      id: 2,
      title: "Healthcare",
      description: "Wellness & Medical",
      image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop&crop=center",
      color: "from-green-500 to-green-600",
      icon: "🏥"
    },
    {
      id: 3,
      title: "Technology",
      description: "Innovation & Startups",
      image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center",
      color: "from-purple-500 to-purple-600",
      icon: "💻"
    }
  ]

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % fundingCategories.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + fundingCategories.length) % fundingCategories.length)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-background to-muted/20 py-20 sm:py-32">


      <div className="container relative z-10">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-8 flex justify-center">
            <div className="relative rounded-full px-3 py-1 text-sm leading-6 text-muted-foreground ring-1 ring-border hover:ring-primary/20 transition-all">
              Powered by Web3 technology <span className="font-semibold text-primary">Learn more</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            Fund the Future with <span className="gradient-text">Transparency</span>
          </h1>

          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            Create and support campaigns with complete transparency. Every contribution is tracked on-chain, ensuring
            trust and accountability in crowdfunding.
          </p>

                    <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link href="/auth/signup">
              <Button size="lg" className="group">
                Start Your Campaign
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/campaigns">
              <Button variant="outline" size="lg">
                Explore Campaigns
              </Button>
            </Link>
          </div>

          <div className="mt-16">
            {/* Desktop: Horizontal grid - all cards side by side */}
            <div className="hidden lg:grid lg:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
              {fundingCategories.map((category, index) => (
                <div key={category.id} className="group bg-black rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-500 border border-gray-800 overflow-hidden">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-4 left-4">
                      <div className="text-3xl">{category.icon}</div>
                    </div>
                  </div>
                  <div className="p-6 text-white">
                    <h3 className="text-xl font-bold mb-3 text-white">{category.title}</h3>
                    <p className="text-gray-300 text-sm mb-4 leading-relaxed">{category.description}</p>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${category.color} h-2 rounded-full w-1/3 transition-all duration-500`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tablet: Horizontal grid - 2 columns */}
            <div className="hidden md:grid md:grid-cols-2 lg:hidden gap-6 max-w-4xl mx-auto px-4">
              {fundingCategories.map((category, index) => (
                <div key={category.id} className="group bg-black rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-500 border border-gray-800 overflow-hidden">
                  <div className="relative h-40 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute top-3 left-3">
                      <div className="text-2xl">{category.icon}</div>
                    </div>
                  </div>
                  <div className="p-5 text-white">
                    <h3 className="text-lg font-bold mb-2 text-white">{category.title}</h3>
                    <p className="text-gray-300 text-xs mb-3">{category.description}</p>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div className={`bg-gradient-to-r ${category.color} h-2 rounded-full w-1/3 transition-all duration-500`}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile: Horizontal scroll */}
            <div className="md:hidden px-4">
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {fundingCategories.map((category, index) => (
                  <div key={category.id} className="group bg-black rounded-2xl shadow-2xl transform hover:-translate-y-1 transition-all duration-500 border border-gray-800 overflow-hidden flex-shrink-0 w-80">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-black/40"></div>
                      <div className="absolute top-4 left-4">
                        <div className="text-2xl">{category.icon}</div>
                      </div>
                    </div>
                    <div className="p-5 text-white">
                      <h3 className="text-lg font-bold mb-2 text-white">{category.title}</h3>
                      <p className="text-gray-300 text-sm mb-3">{category.description}</p>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div className={`bg-gradient-to-r ${category.color} h-2 rounded-full w-1/3 transition-all duration-500`}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
