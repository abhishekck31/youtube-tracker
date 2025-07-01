"use client"

import type React from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface StatCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
    period: string
  }
  icon: React.ReactNode
  color: "blue" | "green" | "purple" | "orange" | "red"
  loading?: boolean
}

const colorClasses = {
  blue: {
    bg: "from-blue-500 to-blue-600",
    icon: "text-blue-300",
    badge: "bg-blue-100 text-blue-700",
  },
  green: {
    bg: "from-green-500 to-green-600",
    icon: "text-green-300",
    badge: "bg-green-100 text-green-700",
  },
  purple: {
    bg: "from-purple-500 to-purple-600",
    icon: "text-purple-300",
    badge: "bg-purple-100 text-purple-700",
  },
  orange: {
    bg: "from-orange-500 to-orange-600",
    icon: "text-orange-300",
    badge: "bg-orange-100 text-orange-700",
  },
  red: {
    bg: "from-red-500 to-red-600",
    icon: "text-red-300",
    badge: "bg-red-100 text-red-700",
  },
}

export function StatCard({ title, value, change, icon, color, loading = false }: StatCardProps) {
  const colors = colorClasses[color]

  const getTrendIcon = () => {
    if (!change) return null

    switch (change.type) {
      case "increase":
        return <TrendingUp className="h-3 w-3" />
      case "decrease":
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getTrendColor = () => {
    if (!change) return ""

    switch (change.type) {
      case "increase":
        return "text-green-600"
      case "decrease":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (loading) {
    return (
      <Card className="unacademy-card">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="unacademy-card hover:shadow-unacademy transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <div className={`p-2 rounded-lg bg-gradient-to-r ${colors.bg}`}>
            <div className={`h-5 w-5 ${colors.icon}`}>{icon}</div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>

          {change && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`${colors.badge} flex items-center gap-1`}>
                {getTrendIcon()}
                {change.value > 0 ? "+" : ""}
                {change.value}%
              </Badge>
              <span className={`text-xs ${getTrendColor()}`}>vs {change.period}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface StatsGridProps {
  stats: Array<{
    title: string
    value: string | number
    change?: {
      value: number
      type: "increase" | "decrease" | "neutral"
      period: string
    }
    icon: React.ReactNode
    color: "blue" | "green" | "purple" | "orange" | "red"
  }>
  loading?: boolean
}

export function StatsGrid({ stats, loading = false }: StatsGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          icon={stat.icon}
          color={stat.color}
          loading={loading}
        />
      ))}
    </div>
  )
}
