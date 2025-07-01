"use client"

import { useState, useEffect } from "react"
import {
  ArrowLeft,
  Calendar,
  Clock,
  VideoIcon,
  TrendingUp,
  Target,
  Award,
  PlayCircle,
  Eye,
  ThumbsUp,
  MessageCircle,
  Download,
  Plus,
  BarChart3,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { getVideosByEducator, type Educator, type Video } from "@/lib/supabase"

interface EducatorAnalyticsProps {
  educator: Educator
  onBack: () => void
}

export default function EducatorAnalytics({ educator, onBack }: EducatorAnalyticsProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const videoData = await getVideosByEducator(educator.id)
        setVideos(videoData)
      } catch (error) {
        console.error("Error loading videos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadVideos()
  }, [educator.id])

  const progressPercentage = Math.round((educator.completed_hours / educator.committed_hours) * 100)
  const totalViews = videos.reduce((sum, video) => sum + Number.parseInt(video.views.replace(/,/g, "")), 0)
  const totalLikes = videos.reduce((sum, video) => sum + (video.likes || 0), 0)
  const totalComments = videos.reduce((sum, video) => sum + (video.comments || 0), 0)

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPerformanceLevel = (engagement: number) => {
    if (engagement >= 90) return { level: "Excellent", color: "text-green-600", bgColor: "bg-green-100" }
    if (engagement >= 80) return { level: "Good", color: "text-blue-600", bgColor: "bg-blue-100" }
    if (engagement >= 70) return { level: "Average", color: "text-yellow-600", bgColor: "bg-yellow-100" }
    if (engagement > 0) return { level: "Needs Improvement", color: "text-red-600", bgColor: "bg-red-100" }
    return { level: "No Data", color: "text-gray-600", bgColor: "bg-gray-100" }
  }

  const performance = getPerformanceLevel(educator.avg_engagement)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} variant="outline" className="bg-white shadow-sm">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Educators
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" className="bg-white shadow-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button className="unacademy-button">
            <Plus className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        </div>
      </div>

      {/* Educator Profile */}
      <Card className="unacademy-card shadow-lg border-0">
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <Avatar className="h-24 w-24 ring-4 ring-green-100 shadow-xl">
              <AvatarImage src={educator.avatar || "/placeholder.svg"} alt={educator.name} />
              <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-2xl font-bold">
                {educator.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">{educator.name}</h1>
                  <p className="text-lg text-slate-600 mb-3">{educator.specialization}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Joined {educator.join_date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4" />
                      <span className="capitalize">{educator.status}</span>
                    </div>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {educator.id}
                    </Badge>
                  </div>
                </div>
                <Badge className={`${performance.bgColor} ${performance.color} px-3 py-1 font-medium`}>
                  {performance.level}
                </Badge>
              </div>

              {/* Progress Section */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-4 border border-blue-200">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Target className="h-5 w-5 text-blue-600" />
                    Commitment Progress
                  </h3>
                  <span className="text-2xl font-bold text-green-600">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-3 mb-3" />
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{Math.round(educator.completed_hours)} hours completed</span>
                  <span>{educator.committed_hours} hours committed</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="unacademy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <VideoIcon className="h-5 w-5 text-blue-600" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                Total
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{educator.total_videos}</p>
            <p className="text-sm text-slate-600">Videos Uploaded</p>
          </CardContent>
        </Card>

        <Card className="unacademy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <Badge variant="secondary" className="bg-green-50 text-green-700">
                Hours
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{Math.round(educator.completed_hours)}h</p>
            <p className="text-sm text-slate-600">Content Created</p>
          </CardContent>
        </Card>

        <Card className="unacademy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Eye className="h-5 w-5 text-purple-600" />
              </div>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700">
                Views
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{formatNumber(totalViews)}</p>
            <p className="text-sm text-slate-600">Total Views</p>
          </CardContent>
        </Card>

        <Card className="unacademy-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <Badge variant="secondary" className="bg-orange-50 text-orange-700">
                Avg
              </Badge>
            </div>
            <p className="text-2xl font-bold text-slate-900 mb-1">{educator.avg_engagement}%</p>
            <p className="text-sm text-slate-600">Engagement Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="unacademy-card">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
              <ThumbsUp className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">{formatNumber(totalLikes)}</p>
            <p className="text-sm text-slate-600">Total Likes</p>
          </CardContent>
        </Card>

        <Card className="unacademy-card">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-yellow-100 rounded-full w-fit mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">{formatNumber(totalComments)}</p>
            <p className="text-sm text-slate-600">Total Comments</p>
          </CardContent>
        </Card>

        <Card className="unacademy-card">
          <CardContent className="p-4 text-center">
            <div className="p-3 bg-indigo-100 rounded-full w-fit mx-auto mb-3">
              <BarChart3 className="h-6 w-6 text-indigo-600" />
            </div>
            <p className="text-xl font-bold text-slate-900 mb-1">
              {videos.length > 0 ? formatNumber(Math.round(totalViews / videos.length)) : "0"}
            </p>
            <p className="text-sm text-slate-600">Avg Views/Video</p>
          </CardContent>
        </Card>
      </div>

      {/* Videos Section */}
      <Card className="unacademy-card shadow-lg border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <VideoIcon className="h-5 w-5 text-green-500" />
                Video Content
              </CardTitle>
              <CardDescription>
                {videos.length} videos uploaded • Last updated: {educator.last_updated}
              </CardDescription>
            </div>
            <Button variant="outline" className="bg-white shadow-sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-600">Loading video content...</p>
            </div>
          ) : videos.length > 0 ? (
            <div className="space-y-4">
              {videos.map((video, index) => (
                <div key={video.id}>
                  <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg">
                    <div className="w-20 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      <PlayCircle className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-900 mb-2 truncate">{video.title}</h4>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {video.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {video.views} views
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {video.engagement}% engagement
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span>Uploaded: {video.upload_date}</span>
                        <span>Added: {video.added_date}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-sm">
                      {video.likes && (
                        <div className="flex items-center gap-1 text-red-600">
                          <ThumbsUp className="h-3 w-3" />
                          {formatNumber(video.likes)}
                        </div>
                      )}
                      {video.comments && (
                        <div className="flex items-center gap-1 text-yellow-600">
                          <MessageCircle className="h-3 w-3" />
                          {formatNumber(video.comments)}
                        </div>
                      )}
                    </div>
                  </div>
                  {index < videos.length - 1 && <Separator className="my-2" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <VideoIcon className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">No videos yet</h3>
              <p className="text-slate-500 mb-6">This educator hasn't uploaded any videos yet.</p>
              <Button className="unacademy-button">
                <Plus className="h-4 w-4 mr-2" />
                Add First Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
