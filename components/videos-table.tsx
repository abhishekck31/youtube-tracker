"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ExternalLink, Trash2, Calendar, Clock } from "lucide-react"
import { Video } from "lucide-react" // Import the Video component

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

interface VideosTableProps {
  videos: VideoEntry[]
  isLoading?: boolean
  onDeleteVideo?: (videoId: string) => void
}

const educators = [
  { id: "1", name: "Dr. Sarah Johnson", initials: "SJ", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "2", name: "Prof. Michael Chen", initials: "MC", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "3", name: "Dr. Emily Rodriguez", initials: "ER", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "4", name: "Prof. David Kim", initials: "DK", avatar: "/placeholder.svg?height=40&width=40" },
  { id: "5", name: "Dr. Lisa Thompson", initials: "LT", avatar: "/placeholder.svg?height=40&width=40" },
]

export function VideosTable({ videos, isLoading, onDeleteVideo }: VideosTableProps) {
  const [activeTab, setActiveTab] = useState("week")

  const getEducatorData = (educatorId: string) => {
    return educators.find((e) => e.id === educatorId)
  }

  const filterVideosByPeriod = (period: "week" | "month") => {
    const now = new Date()
    const startDate = new Date()

    if (period === "week") {
      startDate.setDate(now.getDate() - 7)
    } else {
      startDate.setMonth(now.getMonth() - 1)
    }

    return videos.filter((video) => new Date(video.date) >= startDate)
  }

  const filteredVideos = filterVideosByPeriod(activeTab as "week" | "month")

  const TableSkeleton = () => (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
          <Skeleton className="h-4 w-[100px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <Card className="rounded-2xl border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent Uploads</CardTitle>
          <CardDescription>Latest educational videos from your team</CardDescription>
        </CardHeader>
        <CardContent>
          <TableSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-slate-900">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-slate-900 dark:text-slate-100">Recent Uploads</CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              Latest educational videos from your team
            </CardDescription>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <TabsTrigger value="week" className="rounded-lg">
                This Week
              </TabsTrigger>
              <TabsTrigger value="month" className="rounded-lg">
                This Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Educator</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Video Title</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Duration</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Status</TableHead>
                  <TableHead className="font-semibold text-slate-700 dark:text-slate-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVideos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Video className="h-8 w-8 text-slate-400" /> {/* Use the imported Video component */}
                        <p className="text-slate-500 dark:text-slate-400">No videos found for this period</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredVideos.map((video) => {
                    const educatorData = getEducatorData(video.educatorId)
                    return (
                      <TableRow
                        key={video.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={educatorData?.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-medium">
                                {educatorData?.initials}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-slate-900 dark:text-slate-100">{video.educator}</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="truncate text-slate-700 dark:text-slate-300 cursor-help">
                                {video.videoTitle}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-sm">
                              <p>{video.videoTitle}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-mono bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {video.duration}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {new Date(video.date).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={video.status === "active" ? "default" : "secondary"}
                            className={
                              video.status === "active"
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                : ""
                            }
                          >
                            {video.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg"
                                  asChild
                                >
                                  <a href={video.youtubeLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Open in YouTube</p>
                              </TooltipContent>
                            </Tooltip>

                            {onDeleteVideo && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 dark:hover:text-red-400 rounded-lg"
                                    onClick={() => onDeleteVideo(video.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Delete video</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}
