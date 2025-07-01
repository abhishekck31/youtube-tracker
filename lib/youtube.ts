// YouTube Data API v3 integration
const YOUTUBE_API_KEY = "AIzaSyBTN4ndjJyWBRKgTZ_Bi_vcWtee4OqG2Z4"
const YOUTUBE_API_BASE_URL = "https://www.googleapis.com/youtube/v3"

export interface YouTubeVideoData {
  id: string
  title: string
  description: string
  duration: string
  viewCount: string
  likeCount: string
  commentCount: string
  publishedAt: string
  thumbnails: {
    default: { url: string; width: number; height: number }
    medium: { url: string; width: number; height: number }
    high: { url: string; width: number; height: number }
  }
  channelTitle: string
  channelId: string
  tags?: string[]
}

// Extract video ID from YouTube URL
export const extractVideoId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  return null
}

// Convert ISO 8601 duration to readable format
export const parseDuration = (duration: string): string => {
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

// Convert duration to minutes for calculation
export const durationToMinutes = (duration: string): number => {
  const parts = duration.split(":")
  if (parts.length === 2) {
    // MM:SS format
    return Number.parseInt(parts[0]) + Number.parseInt(parts[1]) / 60
  } else if (parts.length === 3) {
    // HH:MM:SS format
    return Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1]) + Number.parseInt(parts[2]) / 60
  }
  return 0
}

// Calculate engagement rate
const calculateEngagement = (likeCount: string, commentCount: string, viewCount: string): number => {
  const likes = Number.parseInt(likeCount || "0")
  const comments = Number.parseInt(commentCount || "0")
  const views = Number.parseInt(viewCount || "0")

  if (views === 0) return 0

  // Engagement = (likes + comments) / views * 100
  const engagementRate = ((likes + comments) / views) * 100
  return Math.min(Math.round(engagementRate * 100) / 100, 100) // Cap at 100% and round to 2 decimals
}

// Fetch video details from YouTube API
export const fetchVideoDetails = async (videoUrl: string): Promise<YouTubeVideoData | null> => {
  try {
    const videoId = extractVideoId(videoUrl)
    if (!videoId) {
      throw new Error("Invalid YouTube URL")
    }

    const response = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`,
    )

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      throw new Error("Video not found")
    }

    const video = data.items[0]
    const snippet = video.snippet
    const statistics = video.statistics
    const contentDetails = video.contentDetails

    return {
      id: video.id,
      title: snippet.title,
      description: snippet.description,
      duration: parseDuration(contentDetails.duration),
      viewCount: statistics.viewCount || "0",
      likeCount: statistics.likeCount || "0",
      commentCount: statistics.commentCount || "0",
      publishedAt: snippet.publishedAt,
      thumbnails: snippet.thumbnails,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      tags: snippet.tags,
    }
  } catch (error) {
    console.error("Error fetching video details:", error)
    throw error
  }
}

// Fetch multiple videos from a channel
export const fetchChannelVideos = async (channelId: string, maxResults = 50): Promise<YouTubeVideoData[]> => {
  try {
    // First, get the channel's uploads playlist ID
    const channelResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${YOUTUBE_API_KEY}`,
    )

    if (!channelResponse.ok) {
      throw new Error(`YouTube API error: ${channelResponse.status}`)
    }

    const channelData = await channelResponse.json()
    const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads

    if (!uploadsPlaylistId) {
      throw new Error("Could not find uploads playlist")
    }

    // Get videos from the uploads playlist
    const playlistResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
    )

    if (!playlistResponse.ok) {
      throw new Error(`YouTube API error: ${playlistResponse.status}`)
    }

    const playlistData = await playlistResponse.json()
    const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(",")

    // Get detailed information for all videos
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
    )

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`)
    }

    const videosData = await videosResponse.json()

    return videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: parseDuration(video.contentDetails.duration),
      viewCount: video.statistics.viewCount || "0",
      likeCount: video.statistics.likeCount || "0",
      commentCount: video.statistics.commentCount || "0",
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      tags: video.snippet.tags,
    }))
  } catch (error) {
    console.error("Error fetching channel videos:", error)
    throw error
  }
}

// Search for videos by query
export const searchVideos = async (query: string, maxResults = 25): Promise<YouTubeVideoData[]> => {
  try {
    const searchResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/search?part=snippet&q=${encodeURIComponent(
        query,
      )}&type=video&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`,
    )

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status}`)
    }

    const searchData = await searchResponse.json()
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(",")

    // Get detailed information for all videos
    const videosResponse = await fetch(
      `${YOUTUBE_API_BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${YOUTUBE_API_KEY}`,
    )

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status}`)
    }

    const videosData = await videosResponse.json()

    return videosData.items.map((video: any) => ({
      id: video.id,
      title: video.snippet.title,
      description: video.snippet.description,
      duration: parseDuration(video.contentDetails.duration),
      viewCount: video.statistics.viewCount || "0",
      likeCount: video.statistics.likeCount || "0",
      commentCount: video.statistics.commentCount || "0",
      publishedAt: video.snippet.publishedAt,
      thumbnails: video.snippet.thumbnails,
      channelTitle: video.snippet.channelTitle,
      channelId: video.snippet.channelId,
      tags: video.snippet.tags,
    }))
  } catch (error) {
    console.error("Error searching videos:", error)
    throw error
  }
}

// Format numbers for display
export const formatNumber = (num: string | number): string => {
  const number = typeof num === "string" ? Number.parseInt(num) : num
  if (number >= 1000000) {
    return `${(number / 1000000).toFixed(1)}M`
  } else if (number >= 1000) {
    return `${(number / 1000).toFixed(1)}K`
  }
  return number.toString()
}

// Calculate total hours from video durations
export const calculateTotalHours = (videos: { duration: string }[]): number => {
  return videos.reduce((total, video) => total + durationToMinutes(video.duration), 0)
}

// Format hours for display
export const formatHours = (minutes: number): string => {
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return `${hours}h ${mins}m`
}
