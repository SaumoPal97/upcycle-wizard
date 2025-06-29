import { Leaf, Users, Recycle, TrendingUp } from 'lucide-react'

export function StatsSection() {
  const stats = [
    {
      icon: Recycle,
      value: '10K+',
      label: 'Projects Created',
    },
    {
      icon: Users,
      value: '5K+',
      label: 'Happy Makers',
    },
    {
      icon: Leaf,
      value: '50K+',
      label: 'Pieces Saved',
    },
    {
      icon: TrendingUp,
      value: '95%',
      label: 'Success Rate',
    },
  ]

  return (
    <section className="bg-emerald-600 py-16 w-full">
      <div className="w-full px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center text-white">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-8 h-8" />
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.value}</div>
              <div className="text-emerald-100 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}