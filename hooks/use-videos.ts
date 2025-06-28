"use client"

import { useState, useEffect, useCallback } from "react"
import type { VideoEntry } from "@/lib/validations"
import { apiClient, APIError } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface UseVideosOptions {
  educatorId?: string
  autoRefresh?: boolean
  refreshInterval?: number
}

export function useVideos(options: UseVideosOptions = {}) {
  const [videos, setVideos] = useState<VideoEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const fetchVideos = useCallback(
    async (showLoading = true) => {
      try {
        if (showLoading) setIsLoading(true)
        else setIsRefreshing(true)

        setError(null)

        const response = await apiClient.getVideos({
          educatorId: options.educatorId,
          limit: 100,
        })

        setVideos(response.videos)
      } catch (err) {
        const errorMessage = err instanceof APIError ? err.message : "Failed to load videos"

        setError(errorMessage)
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [options.educatorId, toast],
  )

  const addVideo = useCallback(
    async (videoData: Omit<VideoEntry, "id">) => {
      try {
        const newVideo = await apiClient.createVideo(videoData)
        setVideos((prev) => [newVideo, ...prev])

        toast({
          title: "Success",
          description: "Video added successfully!",
        })

        return newVideo
      } catch (err) {
        const errorMessage = err instanceof APIError ? err.message : "Failed to add video"

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        throw err
      }
    },
    [toast],
  )

  const updateVideo = useCallback(
    async (id: string, updates: Partial<VideoEntry>) => {
      try {
        const updatedVideo = await apiClient.updateVideo(id, updates)
        setVideos((prev) => prev.map((v) => (v.id === id ? updatedVideo : v)))

        toast({
          title: "Success",
          description: "Video updated successfully!",
        })

        return updatedVideo
      } catch (err) {
        const errorMessage = err instanceof APIError ? err.message : "Failed to update video"

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        throw err
      }
    },
    [toast],
  )

  const deleteVideo = useCallback(
    async (id: string) => {
      try {
        await apiClient.deleteVideo(id)
        setVideos((prev) => prev.filter((v) => v.id !== id))

        toast({
          title: "Success",
          description: "Video deleted successfully!",
        })
      } catch (err) {
        const errorMessage = err instanceof APIError ? err.message : "Failed to delete video"

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        })

        throw err
      }
    },
    [toast],
  )

  const refresh = useCallback(() => {
    fetchVideos(false)
  }, [fetchVideos])

  // Auto-refresh functionality
  useEffect(() => {
    if (options.autoRefresh && options.refreshInterval) {
      const interval = setInterval(refresh, options.refreshInterval)
      return () => clearInterval(interval)
    }
  }, [options.autoRefresh, options.refreshInterval, refresh])

  // Initial load
  useEffect(() => {
    fetchVideos()
  }, [fetchVideos])

  return {
    videos,
    isLoading,
    isRefreshing,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    refresh,
    refetch: fetchVideos,
  }
}
