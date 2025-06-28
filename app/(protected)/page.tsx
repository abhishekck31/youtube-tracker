"use client"

import { useState } from "react"
import { VideoForm } from "@/components/video-form"
import { DashboardStats } from "@/components/dashboard-stats"
import { VideosTable } from "@/components/videos-table"
import { ThemeToggle } from "@/components/theme-toggle"
import { ErrorBoundary } from "@/components/error-boundary"
import { Button } from "@/components/ui/button"
import { Plus, Youtube, RefreshCw } from "lucide-react"
import { useVideos } from "@/hooks/use-videos"
import type { VideoEntry } from "@/lib/validations"

export default function Dashboard() {
  const [showMobileForm, setShowMobileForm] = useState(false)
  const { videos, isLoading, isRefreshing, error, addVideo, deleteVideo, refresh } = useVideos({
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
  })

  const handleVideoAdded = async (newVideo: Omit<VideoEntry, "id">) => {
    try {
      await addVideo(newVideo)
      setShowMobileForm(false)
    } catch (error) {
      // Error is already handled in the hook
      console.error("Failed to add video:", error)
    }
  }

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideo(videoId)
    } catch (error) {
      // Error is already handled in the hook
      console.error("Failed to delete video:", error)
    }
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Header */}
        <header className="sticky top-0 z-40 w-full border-b border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                  <Youtube className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                    YouTube Hours Tracker
                  </h1>
                  <p className="text-sm text-slate-600 dark:text-slate-400 hidden sm:block">
                    Educational Content Dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={refresh}
                  disabled={isRefreshing}
                  className="h-9 w-9 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Video Form - Desktop */}
          <div className="hidden lg:block">
            <VideoForm onVideoAdded={handleVideoAdded} />
          </div>

          {/* Dashboard Stats */}
          <DashboardStats videos={videos} isLoading={isLoading} />

          {/* Videos Table */}
          <VideosTable videos={videos} isLoading={isLoading} onDeleteVideo={handleDeleteVideo} />
        </main>

        {/* Mobile Floating Action Button */}
        <div className="lg:hidden">
          <Button
            onClick={() => setShowMobileForm(!showMobileForm)}
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 z-50"
            size="icon"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>

          {/* Mobile Form Modal */}
          {showMobileForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden">
              <div className="fixed inset-x-4 top-20 bottom-20 overflow-y-auto">
                <VideoForm onVideoAdded={handleVideoAdded} />
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  )
} 