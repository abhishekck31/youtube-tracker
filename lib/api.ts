import type { VideoEntry, Educator } from "./validations"

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"
const YOUTUBE_API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY

// Error Classes
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string,
  ) {
    super(message)
    this.name = "APIError"
  }
}

export class YouTubeAPIError extends Error {
  constructor(
    message: string,
    public code?: string,
  ) {
    super(message)
    this.name = "YouTubeAPIError"
  }
}

// API Client
class APIClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new APIError(errorData.message || `HTTP ${response.status}`, response.status, errorData.code)
      }

      return await response.json()
    } catch (error) {
      if (error instanceof APIError) throw error
      throw new APIError("Network error occurred", 0)
    }
  }

  // YouTube API Integration
  async getVideoDetails(videoUrl: string): Promise<{
    title: string
    duration: string
    thumbnailUrl: string
    viewCount: number
  }> {
    const videoId = this.extractVideoId(videoUrl)
    if (!videoId) {
      throw new YouTubeAPIError("Invalid YouTube URL")
    }

    if (!YOUTUBE_API_KEY) {
      // Fallback for development
      return this.mockVideoDetails()
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`,
      )

      if (!response.ok) {
        throw new YouTubeAPIError("Failed to fetch video details")
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        throw new YouTubeAPIError("Video not found")
      }

      const video = data.items[0]

      return {
        title: video.snippet.title,
        duration: this.parseYouTubeDuration(video.contentDetails.duration),
        thumbnailUrl: video.snippet.thumbnails.medium.url,
        viewCount: Number.parseInt(video.statistics.viewCount || "0"),
      }
    } catch (error) {
      if (error instanceof YouTubeAPIError) throw error
      throw new YouTubeAPIError("Failed to fetch video details")
    }
  }

  private extractVideoId(url: string): string | null {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  private parseYouTubeDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return "0:00"

    const hours = Number.parseInt(match[1] || "0")
    const minutes = Number.parseInt(match[2] || "0")
    const seconds = Number.parseInt(match[3] || "0")

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
    }

    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  private async mockVideoDetails() {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const mockTitles = [
      "Advanced React Patterns and Best Practices",
      "Introduction to Machine Learning Fundamentals",
      "Building Scalable Web Applications with Next.js",
      "Data Structures and Algorithms Deep Dive",
      "Modern JavaScript ES6+ Features Explained",
      "Full-Stack Development with TypeScript",
      "Database Design and Optimization Techniques",
      "Cloud Architecture and Deployment Strategies",
    ]

    const mockDurations = ["15:30", "25:45", "42:15", "18:20", "35:50", "28:10", "52:30", "19:45"]

    return {
      title: mockTitles[Math.floor(Math.random() * mockTitles.length)],
      duration: mockDurations[Math.floor(Math.random() * mockDurations.length)],
      thumbnailUrl: "/placeholder.svg?height=180&width=320",
      viewCount: Math.floor(Math.random() * 10000) + 100,
    }
  }

  // Video CRUD Operations
  async createVideo(videoData: Omit<VideoEntry, "id">): Promise<VideoEntry> {
    return this.request<VideoEntry>("/videos", {
      method: "POST",
      body: JSON.stringify(videoData),
    })
  }

  async getVideos(params?: {
    educatorId?: string
    startDate?: string
    endDate?: string
    status?: string
    limit?: number
    offset?: number
  }): Promise<{ videos: VideoEntry[]; total: number }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) searchParams.append(key, value.toString())
      })
    }

    return this.request<{ videos: VideoEntry[]; total: number }>(`/videos?${searchParams.toString()}`)
  }

  async updateVideo(id: string, updates: Partial<VideoEntry>): Promise<VideoEntry> {
    return this.request<VideoEntry>(`/videos/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    })
  }

  async deleteVideo(id: string): Promise<void> {
    await this.request(`/videos/${id}`, { method: "DELETE" })
  }

  // Educator Operations
  async getEducators(): Promise<Educator[]> {
    return this.request<Educator[]>("/educators")
  }

  // Analytics
  async getAnalytics(params: {
    startDate: string
    endDate: string
    educatorId?: string
  }): Promise<{
    totalVideos: number
    totalDuration: string
    averageDuration: string
    topEducators: Array<{ educator: string; videoCount: number; totalDuration: string }>
    dailyStats: Array<{ date: string; videoCount: number; duration: string }>
  }> {
    const searchParams = new URLSearchParams(params)
    return this.request<any>(`/analytics?${searchParams.toString()}`)
  }
}

export const apiClient = new APIClient()
