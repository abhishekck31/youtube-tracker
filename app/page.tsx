"use client"
<<<<<<< HEAD
import { useState, useEffect } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

const CATEGORY_LIST = [
  "Class 6 - 12",
  "Foundation",
  "Class 6 -8",
  "UPSC",
  "Gate , ESE, IIT JAM",
  "Unacademy GATE - ME, PI, XE",
  "Unacademy CA 360 Foundation",
  "Unacademy CAT",
  "PrepLadder NEET PG I FMGE I INI-CET",
  "Unacademy CLAT and Other Law Entrance Exams",
  "Govt.Exams",
  "Bankers Way by Unacademy",
  "SSC Exams",
  "Defence Exams",
  "Unacademy Judiciary",
  "Judiciary World by Unacademy",
  "Unacademy Live CSIR UGC NET",
  "Unacademy Live NTA UGC NET",
  "World Affairs by Unacademy",
  "Pathfinder by Unacademy",
]

const MOCK_EDUCATORS = [
  "Amit Sharma",
  "Priya Singh",
  "Rahul Verma",
  "Sneha Gupta",
]

const ALLOWED_EMAILS = [
  "ext-ck.abhishek@unacademy.com",
  "parija.basudha@unacademy.com",
];

function parseYouTubeDuration(duration: string) {
  // e.g. PT1H2M30S
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 60 + minutes + Math.round(seconds / 60);
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

async function fetchYouTubeData(link: string) {
  // Extract video ID
  const idMatch = link.match(/[?&]v=([\w-]{11})/) || link.match(/youtu\.be\/([\w-]{11})/);
  const videoId = idMatch ? idMatch[1] : null;
  if (!videoId) throw new Error("Invalid YouTube link");
  const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,statistics&id=${videoId}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch video data");
  const data = await res.json();
  if (!data.items || !data.items[0]) throw new Error("Video not found");
  const duration = parseYouTubeDuration(data.items[0].contentDetails.duration);
  const views = parseInt(data.items[0].statistics.viewCount || "0");
  return { duration, views };
}

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "dashboard" | "categoryDashboard">("email")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [educatorsByCategory, setEducatorsByCategory] = useState<{ [cat: string]: string[] }>(() => {
    const obj: { [cat: string]: string[] } = {};
    CATEGORY_LIST.forEach(cat => { obj[cat] = []; });
    return obj;
  })
  const [videos, setVideos] = useState<any[]>([]) // {educator, link, duration, views, date, category}
  const [newVideo, setNewVideo] = useState<{ educator: string; link: string }>({ educator: "", link: "" })
  const [loading, setLoading] = useState(false)
  const [videoError, setVideoError] = useState("")
  const [newEducator, setNewEducator] = useState("");

  // Fetch educators and videos from Supabase when a category is selected
  useEffect(() => {
    if (step === "categoryDashboard" && selectedCategory) {
      // Fetch educators
      supabase
        .from("educators")
        .select("*")
        .eq("category", selectedCategory)
        .then(({ data }) => {
          setEducatorsByCategory(prev => ({
            ...prev,
            [selectedCategory]: data ? data.map(e => e.name) : [],
          }));
        });
      // Fetch videos
      supabase
        .from("videos")
        .select("*")
        .eq("category", selectedCategory)
        .then(({ data }) => {
          setVideos(data || []);
        });
    }
  }, [step, selectedCategory]);

  const handleLogin = () => {
    if (!ALLOWED_EMAILS.includes(email.trim().toLowerCase())) {
      setError("You are not authorized to access this dashboard.");
      return;
    }
    setError("");
    setStep("dashboard");
  }

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setStep("categoryDashboard")
  }

  const handleAddVideo = async () => {
    if (!newVideo.educator || !newVideo.link) return;
    setLoading(true);
    setVideoError("");
    try {
      const { duration, views } = await fetchYouTubeData(newVideo.link);
      const { error } = await supabase.from("videos").insert([
        {
          educator: newVideo.educator,
          link: newVideo.link,
          duration,
          views,
          date: new Date().toISOString(),
          category: selectedCategory,
        }
      ]);
      if (!error) {
        setVideos([
          ...videos,
          { educator: newVideo.educator, link: newVideo.link, duration, views, date: new Date().toISOString(), category: selectedCategory },
        ]);
        setNewVideo({ educator: "", link: "" });
      }
    } catch (err) {
      setVideoError(err.message || "Failed to fetch video data");
    } finally {
      setLoading(false);
    }
  };

  const getEducatorTotalMinutes = (educator: string) => {
    return videos.filter((v) => v.educator === educator && v.category === selectedCategory).reduce((sum, v) => sum + v.duration, 0)
  }

  const getEducatorTotalViews = (educator: string) => {
    return videos.filter((v) => v.educator === educator && v.category === selectedCategory).reduce((sum, v) => sum + v.views, 0)
  }

  const getOverallMinutes = () => videos.filter(v => v.category === selectedCategory).reduce((sum, v) => sum + v.duration, 0)
  const getOverallViews = () => videos.filter(v => v.category === selectedCategory).reduce((sum, v) => sum + v.views, 0)

  // Weekly/monthly stats (mocked: all videos are 'this week')
  const getWeeklyMinutes = () => getOverallMinutes()
  const getPrevWeekMinutes = () => Math.floor(getOverallMinutes() * 0.7) // mock
  const getWeeklyViews = () => getOverallViews()
  const getPrevWeekViews = () => Math.floor(getOverallViews() * 0.7) // mock

  const handleDownload = () => {
    const rows = [
      ["Educator", "Video Link", "Duration (min)", "Views", "Date", "Category"],
      ...videos.map((v) => [v.educator, v.link, v.duration, v.views, v.date, selectedCategory]),
    ]
    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${selectedCategory}-videos.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Educator selection state
  const [selectedEducator, setSelectedEducator] = useState<string | null>(null)

  // Educator-specific weekly/monthly stats (mocked)
  const getEducatorWeeklyMinutes = (ed: string) => getEducatorTotalMinutes(ed)
  const getEducatorPrevWeekMinutes = (ed: string) => Math.floor(getEducatorTotalMinutes(ed) * 0.7)
  const getEducatorWeeklyViews = (ed: string) => getEducatorTotalViews(ed)
  const getEducatorPrevWeekViews = (ed: string) => Math.floor(getEducatorTotalViews(ed) * 0.7)

  const handleDeleteVideo = async (index) => {
    const video = videos.filter(v => v.category === selectedCategory)[index];
    if (video) {
      await supabase.from("videos").delete().eq("link", video.link).eq("category", selectedCategory);
      setVideos(videos => videos.filter((_, i) => i !== index));
    }
  };

  const handleAddEducator = async () => {
    const trimmed = newEducator.trim();
    if (trimmed && !educatorsByCategory[selectedCategory].includes(trimmed)) {
      // Add to Supabase
      const { error } = await supabase.from("educators").insert([
        { name: trimmed, category: selectedCategory }
      ]);
      if (!error) {
        setEducatorsByCategory(prev => ({
          ...prev,
          [selectedCategory]: [...prev[selectedCategory], trimmed],
        }));
        setNewEducator("");
      }
    }
  };

  const handleDeleteEducator = async (name) => {
    await supabase.from("educators").delete().eq("name", name).eq("category", selectedCategory);
    setEducatorsByCategory(prev => ({
      ...prev,
      [selectedCategory]: prev[selectedCategory].filter(e => e !== name),
    }));
    setVideos(videos => videos.filter(v => v.educator !== name || v.category !== selectedCategory));
    if (selectedEducator === name) setSelectedEducator(null);
  };

  // Navigation logic
  const steps = ["email", "dashboard", "categoryDashboard"];
  const currentStepIndex = steps.indexOf(step);
  const goToStep = (idx: number) => {
    if (idx >= 0 && idx < steps.length) {
      setStep(steps[idx] as typeof step);
      if (steps[idx] !== "categoryDashboard") setSelectedEducator(null);
    }
  };

  // Only show educators for the selected category
  const educators = educatorsByCategory[selectedCategory];

  return (
    <div className="min-h-screen w-full flex bg-gradient-to-br from-blue-100 via-green-50 to-blue-200">
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center pt-8 pb-8">
        <div className="w-full max-w-6xl mx-auto px-2 md:px-6 flex flex-col items-center justify-center">
          {step === "email" && (
            <div className="bg-white/95 shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-blue-100 mt-12">
              <h1 className="text-3xl font-extrabold mb-4 text-blue-800 tracking-tight">Unacademy Hours Tracker</h1>
              <input
                type="email"
                placeholder="Enter your @unacademy.com email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mb-4 px-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              />
              {error && <div className="text-red-600 mb-2 text-sm">{error}</div>}
              <button
                onClick={handleLogin}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-all duration-150 disabled:opacity-50 text-lg"
                disabled={!email}
              >
                Login
              </button>
            </div>
          )}
          {step === "dashboard" && (
            <div className="w-full max-w-2xl mx-auto mt-12">
              <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">Select a Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {CATEGORY_LIST.map(cat => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className={`w-full px-6 py-4 rounded-xl font-semibold shadow border border-blue-200 bg-white hover:bg-blue-100 text-blue-800 transition-all duration-150 text-lg ${selectedCategory === cat ? "ring-2 ring-blue-500" : ""}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === "categoryDashboard" && (
            <div className="w-full">
              <button
                className="mb-6 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg font-semibold shadow transition-all duration-150"
                onClick={() => setStep("dashboard")}
              >
                ← Back to Categories
              </button>
              {/* Educator/video input row */}
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100 flex flex-col md:flex-row md:items-end gap-4 w-full flex-wrap">
                <div className="flex-1 min-w-[180px]">
                  <label className="block text-blue-700 font-semibold mb-1">Select Educator</label>
                  <select
                    value={newVideo.educator}
                    onChange={e => setNewVideo(v => ({ ...v, educator: e.target.value }))}
                    className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Educator</option>
                    {(educators || []).map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1 min-w-[220px]">
                  <label className="block text-blue-700 font-semibold mb-1">Paste YouTube Video Link</label>
                  <input
                    type="text"
                    placeholder="Paste YouTube video link"
                    value={newVideo.link}
                    onChange={e => setNewVideo(v => ({ ...v, link: e.target.value }))}
                    className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <button
                  onClick={handleAddVideo}
                  className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-all duration-150 disabled:opacity-50 mt-6 md:mt-0"
                  disabled={!newVideo.educator || !newVideo.link || loading}
                  style={{ minWidth: 100 }}
                >
                  {loading ? "Adding..." : "Add Video"}
                </button>
              </div>
              {videoError && <div className="text-red-600 mb-2 text-sm">{videoError}</div>}
              {/* Educator management */}
              <div className="mb-8">
                <h3 className="font-semibold mb-2 text-blue-700">Educators</h3>
                <div className="flex flex-wrap gap-2 mt-2 items-center">
                  {(educators || []).map((ed) => (
                    <span key={ed} className="flex items-center px-3 py-1 bg-blue-100 rounded-full text-blue-800 text-sm font-medium shadow mr-2 mb-2">
                      {ed}
                      <button
                        onClick={() => handleDeleteEducator(ed)}
                        className="ml-2 px-2 py-0.5 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold"
                        title="Delete educator"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={newEducator}
                    onChange={e => setNewEducator(e.target.value)}
                    placeholder="Add educator"
                    className="ml-2 px-2 py-1 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    onKeyDown={e => { if (e.key === 'Enter') handleAddEducator(); }}
                    style={{ minWidth: 120 }}
                  />
                  <button
                    onClick={handleAddEducator}
                    className="ml-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-semibold"
                    disabled={!newEducator.trim() || educators.includes(newEducator.trim())}
                  >
                    Add
                  </button>
                </div>
              </div>
              {/* Dashboard grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px]">
                  <div className="text-lg font-semibold mb-1">Total Hours</div>
                  <div className="text-3xl font-bold">{formatDuration(getOverallMinutes())}</div>
                  <div className="text-xs mt-2">Prev week: {formatDuration(getPrevWeekMinutes())}</div>
                  <div className="text-xs">({getWeeklyMinutes() >= getPrevWeekMinutes() ? "+" : "-"}{Math.abs(getWeeklyMinutes() - getPrevWeekMinutes())} min)</div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px]">
                  <div className="text-lg font-semibold mb-1">Total Views</div>
                  <div className="text-3xl font-bold">{getOverallViews().toLocaleString()}</div>
                  <div className="text-xs mt-2">Prev week: {getPrevWeekViews().toLocaleString()}</div>
                  <div className="text-xs">({getWeeklyViews() >= getPrevWeekViews() ? "+" : "-"}{Math.abs(getWeeklyViews() - getPrevWeekViews())} views)</div>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl shadow-lg p-6 flex flex-col items-center min-w-[220px]">
                  <div className="text-lg font-semibold mb-1">Educators</div>
                  <div className="text-3xl font-bold">{(educators || []).length}</div>
                  <div className="text-xs mt-2">Category: {selectedCategory}</div>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 flex flex-col justify-between min-w-0">
                  <h3 className="font-semibold mb-4 text-blue-700">Hours per Educator</h3>
                  <div className="flex gap-4 items-end h-48 w-full overflow-x-auto">
                    {(educators || []).map((ed) => {
                      const total = getEducatorTotalMinutes(ed)
                      return (
                        <div key={ed} className="flex flex-col items-center justify-end h-full w-16">
                          <div
                            className="w-10 bg-gradient-to-t from-blue-400 to-blue-600 rounded-t-lg shadow-md transition-all duration-300"
                            style={{ height: `${total * 2}px`, minHeight: 8 }}
                            title={`${formatDuration(total)}`}
                          ></div>
                          <span className="text-xs mt-2 text-blue-800 text-center w-full truncate font-semibold">{ed}</span>
                          <span className="text-xs text-gray-600">{formatDuration(total)}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 overflow-x-auto min-w-0">
                  <h3 className="font-semibold mb-4 text-blue-700">Videos Table</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                      <thead>
                        <tr className="bg-blue-100">
                          <th className="px-3 py-2 border">Educator</th>
                          <th className="px-3 py-2 border">Video Link</th>
                          <th className="px-3 py-2 border">Duration</th>
                          <th className="px-3 py-2 border">Views</th>
                          <th className="px-3 py-2 border">Date</th>
                          <th className="px-3 py-2 border">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {videos.filter(v => v.category === selectedCategory).length === 0 && (
                          <tr><td colSpan={6} className="text-center py-4">No videos yet.</td></tr>
                        )}
                        {videos.filter(v => v.category === selectedCategory).map((v, i) => (
                          <tr key={i} className="hover:bg-blue-50">
                            <td className="px-3 py-2 border font-medium text-blue-900">{v.educator}</td>
                            <td className="px-3 py-2 border"><a href={v.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Video</a></td>
                            <td className="px-3 py-2 border">{formatDuration(v.duration)}</td>
                            <td className="px-3 py-2 border">{v.views.toLocaleString()}</td>
                            <td className="px-3 py-2 border">{v.date.slice(0, 10)}</td>
                            <td className="px-3 py-2 border">
                              <button
                                onClick={() => handleDeleteVideo(i)}
                                className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-semibold shadow"
                                title="Delete video"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition-all duration-150"
                >
                  Download Data (CSV)
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
=======

import { useState, useEffect } from "react"
import { Plus, TrendingUp, Clock, Download, Users, Video, Zap } from "lucide-react"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

// Import new components
import DashboardLayout from "@/components/dashboard-layout"
import { StatsGrid } from "@/components/stats-cards"
import EducatorSelection from "@/components/educator-selection"
import EducatorAnalytics from "@/components/educator-analytics"

// Import Supabase functions
import { getEducators, initializeEducators, type Educator } from "@/lib/supabase"

// Import OTP Login component
import OTPLogin from "@/components/otp-login"

// Import Dev OTP Display
import DevOTPDisplay from "@/components/dev-otp-display"

// Category data - focused on CLAT and Law Exams
const categories = [
  {
    id: "clat-law",
    name: "CLAT & Law Exams",
    description: "Common Law Admission Test & Legal Studies",
    icon: "⚖️",
    color: "from-purple-500 to-indigo-600",
    educators: 8,
    videos: 0,
  },
]

// Unacademy Logo Component
const UnacademyLogo = ({ className = "h-12 w-auto" }: { className?: string }) => (
  <div className="flex items-center gap-2">
    <Image src="/unacademy-logo.png" alt="Unacademy" width={160} height={50} className={className} priority />
  </div>
)

export default function UnacademyAuth() {
  const [currentStep, setCurrentStep] = useState("login") // login, category, dashboard, educators, educator-analytics
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [selectedEducator, setSelectedEducator] = useState<Educator | null>(null)
  const [educators, setEducators] = useState<Educator[]>([])
  const [isInitializing, setIsInitializing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  // Check for existing session on app load
  useEffect(() => {
    const checkSession = () => {
      const session = localStorage.getItem("unacademy_session")
      if (session) {
        // Valid session exists, skip login
        setCurrentStep("category")
      }
    }

    checkSession()
  }, [])

  // Initialize data on app load
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsInitializing(true)
        await initializeEducators()
        const educatorData = await getEducators()
        setEducators(educatorData)
      } catch (error) {
        console.error("Error initializing data:", error)
        toast({
          title: "Error",
          description: "Failed to load educator data. Please refresh the page.",
          variant: "destructive",
        })
      } finally {
        setIsInitializing(false)
      }
    }

    initializeData()
  }, [toast])

  const handleLoginSuccess = () => {
    setCurrentStep("category")
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId)
    setIsLoading(true)

    // Simulate loading and redirect to dashboard
    setTimeout(() => {
      setIsLoading(false)
      setCurrentStep("dashboard")
    }, 1000)
  }

  const handleEducatorSelect = (educator: Educator) => {
    setSelectedEducator(educator)
    setCurrentStep("educator-analytics")
  }

  const handleBackToEducators = () => {
    setSelectedEducator(null)
    setCurrentStep("educators")
  }

  const handleBackToDashboard = () => {
    setSelectedEducator(null)
    setCurrentStep("dashboard")
    setCurrentPage("dashboard")
  }

  const refreshEducators = async () => {
    try {
      const educatorData = await getEducators()
      setEducators(educatorData)
    } catch (error) {
      console.error("Error refreshing educators:", error)
      toast({
        title: "Error",
        description: "Failed to refresh educator data.",
        variant: "destructive",
      })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("unacademy_session")
    setCurrentStep("login")
    setSelectedCategory("")
    setSelectedEducator(null)
    setCurrentPage("dashboard")
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const handlePageChange = (page: string) => {
    setCurrentPage(page)
    if (page === "educators") {
      setCurrentStep("educators")
      setSelectedEducator(null)
    } else if (page === "dashboard") {
      setCurrentStep("dashboard")
      setSelectedEducator(null)
    }
  }

  const handleSearch = (query: string) => {
    setSearchTerm(query)
  }

  // Calculate dashboard stats from actual data
  const totalVideos = educators.reduce((sum, educator) => sum + educator.total_videos, 0)
  const totalHours = educators.reduce((sum, educator) => sum + educator.completed_hours, 0)
  const avgEngagement =
    educators.length > 0 && totalVideos > 0
      ? Math.round(educators.reduce((sum, educator) => sum + educator.avg_engagement, 0) / educators.length)
      : 0
  const activeEducators = educators.filter((educator) => educator.status === "active").length

  const dashboardStats = [
    {
      title: "Total Educators",
      value: educators.length,
      change: { value: 0, type: "neutral" as const, period: "last month" },
      icon: <Users className="h-5 w-5" />,
      color: "blue" as const,
    },
    {
      title: "Total Videos",
      value: totalVideos,
      change: { value: 0, type: "neutral" as const, period: "last week" },
      icon: <Video className="h-5 w-5" />,
      color: "green" as const,
    },
    {
      title: "Total Hours",
      value: `${Math.round(totalHours)}h`,
      change: { value: 0, type: "neutral" as const, period: "last week" },
      icon: <Clock className="h-5 w-5" />,
      color: "purple" as const,
    },
    {
      title: "Avg Engagement",
      value: `${avgEngagement}%`,
      change: { value: 0, type: "neutral" as const, period: "last month" },
      icon: <TrendingUp className="h-5 w-5" />,
      color: "orange" as const,
    },
  ]

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <Card className="p-8 bg-white/90 backdrop-blur-sm shadow-2xl border-0">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-6">
              <div className="w-full h-full border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            </div>
            <UnacademyLogo className="h-14 w-auto mx-auto mb-4" />
            <p className="text-slate-700 font-medium text-lg">Initializing YouTube Tracker...</p>
            <p className="text-slate-500 text-sm mt-2">Setting up CLAT & Law Exam educators</p>
          </div>
        </Card>
      </div>
    )
  }

  if (currentStep === "educator-analytics" && selectedEducator) {
    return (
      <>
        <DashboardLayout
          currentPage="educator-analytics"
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          headerTitle={`${selectedEducator.name} Analytics`}
          headerSubtitle="Individual Performance Dashboard"
        >
          <EducatorAnalytics educator={selectedEducator} onBack={handleBackToEducators} />
        </DashboardLayout>
        <DevOTPDisplay show={true} />
      </>
    )
  }

  if (currentStep === "educators") {
    return (
      <>
        <DashboardLayout
          currentPage="educators"
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          headerTitle="Educators"
          headerSubtitle="Select an educator to view detailed analytics"
        >
          <EducatorSelection onEducatorSelect={handleEducatorSelect} />
        </DashboardLayout>
        <DevOTPDisplay show={true} />
      </>
    )
  }

  if (currentStep === "dashboard") {
    const filteredEducators = educators.filter(
      (educator) =>
        educator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        educator.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        educator.specialization.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    return (
      <>
        <DashboardLayout
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onLogout={handleLogout}
          headerTitle="YouTube Analytics Hub"
          headerSubtitle="CLAT & Law Exams Performance Tracking"
          searchPlaceholder="Search educators by name or specialization..."
          onSearch={handleSearch}
        >
          <div className="space-y-6">
            {/* Stats Overview */}
            <StatsGrid stats={dashboardStats} loading={false} />

            {/* Quick Actions */}
            <Card className="unacademy-card shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common tasks and shortcuts for managing educator performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button className="unacademy-button h-auto p-4 flex-col gap-2 text-sm">
                    <Plus className="h-6 w-6" />
                    <span>Add New Video</span>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange("educators")}
                    className="h-auto p-4 flex-col gap-2 text-sm bg-gradient-to-br from-green-50 to-green-100 border-green-200"
                  >
                    <Users className="h-6 w-6 text-green-600" />
                    <span>View Educators</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex-col gap-2 text-sm bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
                  >
                    <TrendingUp className="h-6 w-6 text-purple-600" />
                    <span>View Analytics</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto p-4 flex-col gap-2 text-sm bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200"
                  >
                    <Download className="h-6 w-6 text-orange-600" />
                    <span>Export Data</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="unacademy-card shadow-lg border-0">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl">
                      <Users className="h-5 w-5 text-green-500" />
                      Educators Overview
                    </CardTitle>
                    <CardDescription>Quick overview of all educators</CardDescription>
                  </div>
                  <Button onClick={() => handlePageChange("educators")} className="unacademy-button">
                    View All Educators
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {educators.slice(0, 4).map((educator) => (
                    <Card
                      key={educator.id}
                      className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={educator.avatar || "/placeholder.svg"} alt={educator.name} />
                            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold">
                              {educator.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">{educator.name}</h4>
                            <p className="text-xs text-slate-500 truncate">{educator.specialization}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div>
                            <p className="font-bold text-blue-600">{educator.total_videos}</p>
                            <p className="text-blue-500">Videos</p>
                          </div>
                          <div>
                            <p className="font-bold text-green-600">{Math.round(educator.completed_hours)}h</p>
                            <p className="text-green-500">Hours</p>
                          </div>
                          <div>
                            <p className="font-bold text-orange-600">{educator.avg_engagement}%</p>
                            <p className="text-orange-500">Engagement</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </DashboardLayout>
        <DevOTPDisplay show={true} />
      </>
    )
  }

  if (currentStep === "category") {
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
          <div className="w-full max-w-4xl">
            {/* Header with Logout */}
            <div className="flex justify-between items-center mb-8">
              <div></div>
              <Button onClick={handleLogout} variant="outline" className="bg-white/70 backdrop-blur-sm shadow-lg">
                Logout
              </Button>
            </div>

            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-6">
                <UnacademyLogo className="h-16 w-auto" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Select your category</h2>
              <p className="text-slate-600 text-lg">Choose the exam category to track educator performance</p>
              <Badge variant="secondary" className="mt-4 bg-green-100 text-green-700 px-4 py-2">
                8 CLAT & Law educators ready for tracking
              </Badge>
            </div>

            {/* Category Grid */}
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1 mb-8 max-w-lg mx-auto">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 unacademy-card border-0 shadow-xl ${
                    selectedCategory === category.id ? "ring-4 ring-blue-500 shadow-2xl" : ""
                  }`}
                  onClick={() => handleCategorySelect(category.id)}
                >
                  <CardContent className="p-10">
                    <div className="text-center">
                      <div
                        className={`w-28 h-28 mx-auto mb-8 rounded-3xl unacademy-gradient flex items-center justify-center text-5xl shadow-2xl group-hover:scale-110 transition-transform duration-300`}
                      >
                        {category.icon}
                      </div>
                      <h3 className="text-3xl font-bold text-slate-900 mb-4">{category.name}</h3>
                      <p className="text-slate-600 text-lg mb-8">{category.description}</p>

                      <div className="grid grid-cols-2 gap-6 text-center">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
                          <p className="text-3xl font-bold text-blue-600">{category.educators}</p>
                          <p className="text-sm text-blue-500 font-medium">Educators</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200">
                          <p className="text-3xl font-bold text-green-600">{totalVideos}</p>
                          <p className="text-sm text-green-500 font-medium">Videos</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                <Card className="p-10 bg-white/95 backdrop-blur-sm shadow-2xl border-0">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-6" />
                    <p className="text-slate-700 font-medium text-xl">Loading CLAT & Law educators...</p>
                    <p className="text-slate-500 mt-2">Preparing your analytics dashboard</p>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
        <DevOTPDisplay show={true} />
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Logo and Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <UnacademyLogo className="h-16 w-auto" />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 mb-3">YouTube Analytics Hub</h2>
            <p className="text-slate-600 text-lg">Sign in to access CLAT & Law educator tracking</p>
          </div>

          {/* OTP Login Component */}
          <OTPLogin onLoginSuccess={handleLoginSuccess} />

          {/* Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">🔒 Secure OTP-based authentication for Unacademy team members</p>
          </div>
        </div>
      </div>

      {/* Development OTP Helper */}
      <DevOTPDisplay show={true} />
    </>
  )
}
>>>>>>> a0bb10b (Initial Commit)
