import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid'

interface StatsCardProps {
  title: string
  value: string | number
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  trend?: {
    value: number
    direction: 'up' | 'down'
  }
  color?: 'green' | 'blue' | 'yellow' | 'red' | 'purple'
}

const colorClasses = {
  green: {
    bg: 'bg-green-500',
    light: 'bg-green-100',
    text: 'text-green-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600'
    }
  },
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-100',
    text: 'text-blue-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600'
    }
  },
  yellow: {
    bg: 'bg-yellow-500',
    light: 'bg-yellow-100',
    text: 'text-yellow-600',
    trend: {
      up: 'text-yellow-600',
      down: 'text-yellow-600'
    }
  },
  red: {
    bg: 'bg-red-500',
    light: 'bg-red-100',
    text: 'text-red-600',
    trend: {
      up: 'text-red-600',
      down: 'text-green-600'
    }
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-100',
    text: 'text-purple-600',
    trend: {
      up: 'text-green-600',
      down: 'text-red-600'
    }
  },
}

export default function StatsCard({ title, value, icon: Icon, trend, color = 'green' }: StatsCardProps) {
  const colors = colorClasses[color]

  return (
    <div className="bg-white rounded-lg shadow-md p-6 card-hover">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            {trend && (
              <span className={`flex items-center text-sm font-medium ${colors.trend[trend.direction]}`}>
                {trend.direction === 'up' ? (
                  <ArrowUpIcon className="h-4 w-4 mr-0.5" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-0.5" />
                )}
                {trend.value}%
              </span>
            )}
          </div>
        </div>
        <div className={`${colors.light} rounded-full p-3`}>
          <Icon className={`h-8 w-8 ${colors.text}`} />
        </div>
      </div>
    </div>
  )
}

