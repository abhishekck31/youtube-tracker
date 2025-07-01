// Mock data for development - no external dependencies
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

// Mock educators data
export const mockEducators: Educator[] = [
  {
    id: "EDU001",
    name: "Kriti Singh",
    subject: "CLAT & Law Exams",
    avatar: "/placeholder.svg?height=48&width=48",
    committed_hours: 120,
    completed_hours: 85,
    total_videos: 42,
    avg_engagement: 87,
    last_updated: "2 hours ago",
    trend: "+12%",
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
    completed_hours: 78,
    total_videos: 38,
    avg_engagement: 92,
    last_updated: "1 hour ago",
    trend: "+8%",
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
    completed_hours: 95,
    total_videos: 45,
    avg_engagement: 89,
    last_updated: "3 hours ago",
    trend: "+15%",
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
    completed_hours: 72,
    total_videos: 35,
    avg_engagement: 84,
    last_updated: "5 hours ago",
    trend: "+6%",
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
    completed_hours: 110,
    total_videos: 52,
    avg_engagement: 91,
    last_updated: "1 hour ago",
    trend: "+18%",
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
    completed_hours: 88,
    total_videos: 41,
    avg_engagement: 86,
    last_updated: "4 hours ago",
    trend: "+10%",
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
    completed_hours: 76,
    total_videos: 36,
    avg_engagement: 88,
    last_updated: "2 hours ago",
    trend: "+7%",
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
    completed_hours: 92,
    total_videos: 44,
    avg_engagement: 90,
    last_updated: "30 minutes ago",
    trend: "+14%",
    status: "active",
    join_date: "2024-01-22",
    specialization: "Constitutional Law & Legal Studies",
  },
]

// Mock videos data
export const mockVideos: Video[] = [
  {
    id: "VID001",
    educator_id: "EDU001",
    title: "Constitutional Law Fundamentals - Part 1",
    duration: "45:30",
    views: "12,450",
    upload_date: "2024-01-20",
    thumbnail: "/placeholder.svg?height=180&width=320",
    channel_name: "Kriti Singh CLAT",
    description: "Comprehensive overview of constitutional law basics",
    likes: 890,
    comments: 156,
    engagement: 87,
    url: "https://youtube.com/watch?v=example1",
    added_date: "2024-01-20",
  },
  {
    id: "VID002",
    educator_id: "EDU001",
    title: "Legal Reasoning Strategies",
    duration: "38:15",
    views: "8,920",
    upload_date: "2024-01-18",
    thumbnail: "/placeholder.svg?height=180&width=320",
    channel_name: "Kriti Singh CLAT",
    description: "Advanced techniques for legal reasoning questions",
    likes: 654,
    comments: 98,
    engagement: 85,
    url: "https://youtube.com/watch?v=example2",
    added_date: "2024-01-18",
  },
]

// Data access functions
export const getEducators = async (): Promise<Educator[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockEducators
}

export const getVideosByEducator = async (educatorId: string): Promise<Video[]> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockVideos.filter((video) => video.educator_id === educatorId)
}

export const createEducator = async (
  educator: Omit<Educator, "created_at" | "updated_at">,
): Promise<Educator | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))
  return { ...educator, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
}

export const updateEducator = async (id: string, updates: Partial<Educator>): Promise<Educator | null> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 200))
  const educator = mockEducators.find((e) => e.id === id)
  if (!educator) return null
  return { ...educator, ...updates, updated_at: new Date().toISOString() }
}

export const initializeEducators = async (): Promise<void> => {
  // Mock initialization - already have data
  return Promise.resolve()
}
