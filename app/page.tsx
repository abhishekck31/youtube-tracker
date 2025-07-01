"use client"

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
