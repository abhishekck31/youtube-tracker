import { type SupabaseClient, createClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────────────────────────────────
// ENV-VAR CHECK
// ─────────────────────────────────────────────────────────────────────────
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

/** ✓ true only when BOTH env-vars look valid */
export const supabaseIsReady =
  supabaseUrl.startsWith("https://") && supabaseUrl.includes(".supabase.co") && supabaseAnonKey.length > 40

// Create client only when ready
export const supabase: SupabaseClient | null = supabaseIsReady ? createClient(supabaseUrl, supabaseAnonKey) : null

// Database types
export interface Educator {
  id: string
  name: string
  subject: string
  avatar?: string
  committed_hours: number
  completed_hours: number
  total_videos: number
  avg_engagement: number
  last_updated: string
  trend: string
  status: string
  join_date: string
  specialization: string
  created_at?: string
  updated_at?: string
}

export interface Video {
  id: string
  educator_id: string
  title: string
  duration: string
  views: string
  upload_date: string
  thumbnail?: string
  channel_name: string
  description?: string
  likes?: number
  comments?: number
  engagement: number
  url: string
  added_date: string
  created_at?: string
  updated_at?: string
}

// Educator operations
// GET ALL EDUCATORS  ─────────────────────────────────────────────────────
export const getEducators = async (): Promise<Educator[]> => {
  if (!supabaseIsReady || !supabase) return [] // ← graceful fallback

  try {
    const { data, error } = await supabase.from("educators").select("*").order("name")

    if (error) throw error
    return data ?? []
  } catch (err) {
    console.error("[Supabase] getEducators error:", err)
    return [] // ← never throw to UI
  }
}

export const createEducator = async (
  educator: Omit<Educator, "created_at" | "updated_at">,
): Promise<Educator | null> => {
  if (!supabaseIsReady || !supabase) return null

  const { data, error } = await supabase.from("educators").insert([educator]).select().single()

  if (error) {
    console.error("Error creating educator:", error)
    return null
  }

  return data
}

export const updateEducator = async (id: string, updates: Partial<Educator>): Promise<Educator | null> => {
  if (!supabaseIsReady || !supabase) return null

  const { data, error } = await supabase
    .from("educators")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()

  if (error) {
    console.error("Error updating educator:", error)
    return null
  }

  return data
}

// Video operations
export const getVideosByEducator = async (educatorId: string): Promise<Video[]> => {
  if (!supabaseIsReady || !supabase) return []

  const { data, error } = await supabase
    .from("videos")
    .select("*")
    .eq("educator_id", educatorId)
    .order("added_date", { ascending: false })

  if (error) {
    console.error("Error fetching videos:", error)
    return []
  }

  return data || []
}

export const createVideo = async (video: Omit<Video, "created_at" | "updated_at">): Promise<Video | null> => {
  if (!supabaseIsReady || !supabase) return null

  const { data, error } = await supabase.from("videos").insert([video]).select().single()

  if (error) {
    console.error("Error creating video:", error)
    return null
  }

  return data
}

export const deleteVideo = async (id: string): Promise<boolean> => {
  if (!supabaseIsReady || !supabase) return false

  const { error } = await supabase.from("videos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting video:", error)
    return false
  }

  return true
}

// Initialize default educators if they don't exist (with zero analytics)
export const initializeEducators = async (): Promise<void> => {
  if (!supabaseIsReady || !supabase) return // <─ nothing to do

  const existingEducators = await getEducators()

  if (existingEducators.length === 0) {
    const defaultEducators: Omit<Educator, "created_at" | "updated_at">[] = [
      {
        id: "EDU001",
        name: "Kriti Singh",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 120,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-15",
        specialization: "Legal Reasoning & Constitutional Law",
      },
      {
        id: "EDU002",
        name: "Vaishnavi Pandey",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 100,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-10",
        specialization: "English Language & Comprehension",
      },
      {
        id: "EDU003",
        name: "Akash Richhariya",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 110,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-08",
        specialization: "Logical Reasoning & Critical Thinking",
      },
      {
        id: "EDU004",
        name: "Hani Kumar Sharma",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 90,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-12",
        specialization: "Current Affairs & General Knowledge",
      },
      {
        id: "EDU005",
        name: "Vijendra Singh Kulhari",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 130,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-05",
        specialization: "Quantitative Techniques & Data Interpretation",
      },
      {
        id: "EDU006",
        name: "Aman Chaturvedi",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 105,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-18",
        specialization: "Legal Aptitude & Law Fundamentals",
      },
      {
        id: "EDU007",
        name: "Manjari Singh",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 95,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-20",
        specialization: "English & Verbal Ability",
      },
      {
        id: "EDU008",
        name: "Anuja Chaturvedi",
        subject: "CLAT & Law Exams",
        avatar: "/placeholder.svg?height=48&width=48",
        committed_hours: 115,
        completed_hours: 0,
        total_videos: 0,
        avg_engagement: 0,
        last_updated: "Never",
        trend: "0%",
        status: "active",
        join_date: "2024-01-22",
        specialization: "Constitutional Law & Legal Studies",
      },
    ]

    // Create all educators
    for (const educator of defaultEducators) {
      await createEducator(educator)
    }
  }
}

// Calculate analytics from actual data
export const calculateEducatorAnalytics = async (educatorId: string): Promise<void> => {
  if (!supabaseIsReady || !supabase) return

  const videos = await getVideosByEducator(educatorId)

  if (videos.length === 0) {
    // Reset to zero if no videos
    await updateEducator(educatorId, {
      total_videos: 0,
      completed_hours: 0,
      avg_engagement: 0,
      last_updated: "Never",
      trend: "0%",
    })
    return
  }

  // Calculate total hours from video durations
  const totalMinutes = videos.reduce((sum, video) => {
    const duration = video.duration
    const parts = duration.split(":")
    if (parts.length === 2) {
      return sum + Number.parseInt(parts[0]) + Number.parseInt(parts[1]) / 60
    } else if (parts.length === 3) {
      return sum + Number.parseInt(parts[0]) * 60 + Number.parseInt(parts[1]) + Number.parseInt(parts[2]) / 60
    }
    return sum
  }, 0)

  const totalHours = Math.round((totalMinutes / 60) * 100) / 100

  // Calculate average engagement
  const avgEngagement = Math.round(videos.reduce((sum, video) => sum + video.engagement, 0) / videos.length)

  // Update educator with calculated analytics
  await updateEducator(educatorId, {
    total_videos: videos.length,
    completed_hours: totalHours,
    avg_engagement: avgEngagement,
    last_updated: "Just now",
    trend: "+0%", // Will be calculated based on historical data later
  })
}
