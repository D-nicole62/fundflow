export function CommunityShowcase() {
  const communityMembers = [
    {
      name: "Amara Johnson",
      location: "Atlanta, Georgia",
      image: "/images/black-woman-leader.png",
      story: "Raised $25,000 for youth mentorship program",
      impact: "150+ youth mentored",
      category: "Education",
    },
    {
      name: "Marcus Williams",
      location: "Detroit, Michigan",
      image: "/images/black-man-entrepreneur.png",
      story: "Funded tech training for underserved communities",
      impact: "200+ people trained",
      category: "Technology",
    },
    {
      name: "Zara Thompson",
      location: "Houston, Texas",
      image: "/images/black-youth-education.png",
      story: "Built community learning center",
      impact: "500+ students served",
      category: "Community",
    },
  ]

  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-muted/30">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Community Impact Stories</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Real Black entrepreneurs and leaders making transformative change
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {communityMembers.map((member, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={member.image || "/placeholder.svg"}
                  alt={`${member.name} from ${member.location}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>

              <div className="absolute top-4 left-4">
                <span className="inline-block px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium rounded-full">
                  {member.category}
                </span>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h3 className="font-bold text-lg mb-1">{member.name}</h3>
                <p className="text-sm text-white/80 mb-2">{member.location}</p>
                <p className="text-sm font-medium mb-1">{member.story}</p>
                <p className="text-xs text-white/70">{member.impact}</p>
              </div>

              <div className="absolute top-4 right-4 w-4 h-4 bg-green-500 rounded-full animate-pulse shadow-lg"></div>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-lg max-w-2xl mx-auto">
            <p className="text-muted-foreground mb-6 font-medium">
              Join our global community of Black changemakers and entrepreneurs
            </p>
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="flex -space-x-3">
                {communityMembers.map((member, index) => (
                  <img
                    key={index}
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    className="w-12 h-12 rounded-full border-3 border-white object-cover shadow-lg hover:scale-110 transition-transform cursor-pointer"
                  />
                ))}
              </div>
              <div className="text-left">
                <div className="text-2xl font-bold text-primary">10,000+</div>
                <div className="text-sm text-muted-foreground">Active community builders</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">$2.4M+</div>
                <div className="text-xs text-muted-foreground">Total raised</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">150+</div>
                <div className="text-xs text-muted-foreground">Active campaigns</div>
              </div>
              <div>
                <div className="text-lg font-bold text-purple-600">89%</div>
                <div className="text-xs text-muted-foreground">Success rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
