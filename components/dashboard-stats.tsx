"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, Video, TrendingUp, Users } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface VideoEntry {
  id: string
  educator: string
  educatorId: string
  videoTitle: string
  duration: string
  date: string
  youtubeLink: string
  status: "active" | "archived"
}

interface DashboardStatsProps {
  videos: VideoEntry[]
  isLoading?: boolean
}

const educators = [
  { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Prof. Michael Chen", initials: "MC", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Dr. Emily Rodriguez", initials: "ER", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "4", name: "Prof. David Kim", initials: "DK", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "Dr. Lisa Thompson", initials: "LT", avatar: "/placeholder.svg?height=40&width=40" },
]

export function DashboardStats({ videos, isLoading }: DashboardStatsProps) {
  // API Integration Function (Placeholder)
  const getDashboardStats = () => {
    // TODO: Implement backend API call to get aggregated stats
    console.log("Fetching dashboard statistics...")

    // Calculate stats from current data
    const totalVideos = videos.length
    const totalMinutes = videos.reduce((acc, video) => {
      const [minutes, seconds] = video.duration.split(":").map(Number)
      return acc + minutes + seconds / 60
    }, 0)

    const totalHours = Math.floor(totalMinutes / 60)
    const remainingMinutes = Math.floor(totalMinutes % 60)

    const longestVideo = videos.reduce(
      (longest, current) => {
        const [currentMin] = current.duration.split(":").map(Number)
        const [longestMin] = longest.duration ? longest.duration.split(":").map(Number) : [0]
        return currentMin > longestMin ? current : longest
      },
      { duration: "0:00" },
    )

    return {
      totalVideos,
      totalHours: `${totalHours}:${remainingMinutes.toString().padStart(2, "0")}`,
      longestVideo: longestVideo.duration || "0:00",
      activeEducators: new Set(videos.map((v) => v.educatorId)).size,
    }
  }

  const getWeeklyHoursByEducator = () => {
    // TODO: Implement backend API call for weekly stats
    const weeklyStats = educators
      .map((educator) => {
        const educatorVideos = videos.filter((v) => v.educatorId === educator.id)
        const weeklyMinutes = educatorVideos.reduce((acc, video) => {
          const [minutes, seconds] = video.duration.split(":").map(Number)
          return acc + minutes + seconds / 60
        }, 0)

        const hours = Math.floor(weeklyMinutes / 60)
        const minutes = Math.floor(weeklyMinutes % 60)

        return {
          ...educator,
          weeklyHours: `${hours}:${minutes.toString().padStart(2, "0")}`,
          videoCount: educatorVideos.length,
        }
      })
      .filter((educator) => educator.videoCount > 0)

    return weeklyStats
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="rounded-2xl">
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const stats = getDashboardStats()
  const weeklyStats = getWeeklyHoursByEducator()

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Videos</CardTitle>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <Video className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalVideos}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">This month</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Hours</CardTitle>
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalHours}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Content created</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/50 dark:to-violet-950/50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Educators</CardTitle>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.activeEducators}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Contributing content</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50 hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Longest Video</CardTitle>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
              <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.longestVideo}</div>
            <p className="text-xs text-slate-600 dark:text-slate-400">Duration</p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Hours by Educator */}
      {weeklyStats.length > 0 && (
        <Card className="rounded-2xl border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-900 dark:to-gray-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Weekly Hours by Educator
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeklyStats.map((educator) => (
                <div
                  key={educator.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={educator.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium">
                        {educator.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 text-sm">{educator.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {educator.videoCount} video{educator.videoCount !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-slate-100">{educator.weeklyHours}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">hours</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
