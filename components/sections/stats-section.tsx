export function StatsSection() {
  const stats = [
    {
      name: "Total Raised",
      value: "$2.4M+",
      description: "By Black entrepreneurs",
      image: "/images/black-community-1.png",
    },
    {
      name: "Active Campaigns",
      value: "150+",
      description: "Currently fundraising",
      image: "/images/black-community-2.png",
    },
    {
      name: "Success Rate",
      value: "89%",
      description: "Campaigns reach their goal",
      image: "/images/black-helping-hands.png",
    },
    {
      name: "Contributors",
      value: "10K+",
      description: "Supporting great causes",
      image: "/images/black-woman-leader.png",
    },
  ]


  // <section className="py-16 sm:py-24 bg-white">
  //   <div className="container">
  //     <div className="mx-auto max-w-2xl text-center mb-16">
  //       <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trusted by Black communities worldwide</h2>
  //       <p className="mt-4 text-lg text-muted-foreground">
  //         Empowering Black entrepreneurs and community leaders to create lasting change
  //       </p>
  //     </div>

  //     <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
  //       {stats.map((stat, index) => (
  //         <div key={stat.name} className="text-center group">
  //           <div className="relative mb-4 mx-auto w-16 h-16 rounded-full overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
  //             <img
  //               src={stat.image || "/placeholder.svg"}
  //               alt={stat.description}
  //               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
  //             />
  //             <div className="absolute inset-0 bg-primary/20 group-hover:bg-primary/30 transition-colors"></div>
  //           </div>
  //           <div className="text-3xl font-bold text-primary sm:text-4xl group-hover:scale-105 transition-transform">
  //             {stat.value}
  //           </div>
  //           <div className="mt-2 font-semibold text-foreground">{stat.name}</div>
  //           <div className="mt-1 text-sm text-muted-foreground">{stat.description}</div>
  //         </div>
  //       ))}
  //     </div>

  //     {/* Additional community highlight */}
  //     <div className="mt-16 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl p-8 text-center">
  //       <div className="flex justify-center mb-6">
  //         <div className="flex -space-x-4">
  //           <img
  //             src="/images/black-woman-leader.png"
  //             alt="Community leader"
  //             className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
  //           />
  //           <img
  //             src="/images/black-man-entrepreneur.png"
  //             alt="Entrepreneur"
  //             className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
  //           />
  //           <img
  //             src="/images/black-youth-education.png"
  //             alt="Youth leader"
  //             className="w-12 h-12 rounded-full border-3 border-white shadow-lg"
  //           />
  //         </div>
  //       </div>
  //       <h3 className="text-xl font-bold mb-2">Building Generational Wealth</h3>
  //       <p className="text-muted-foreground max-w-2xl mx-auto">
  //         Our platform is designed to support Black entrepreneurs, creators, and community leaders in building
  //         sustainable businesses and creating positive impact in their communities.
  //       </p>
  //     </div>
  //   </div>
  // </section>

}
