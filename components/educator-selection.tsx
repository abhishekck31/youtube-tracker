"use client"

import { useState, useEffect } from "react"
import { Search, Eye, TrendingUp, Clock, Video, Target, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getEducators, type Educator, createEducator } from "@/lib/supabase"
import { EducatorCardSkeleton } from "@/components/loading-skeleton"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"

interface EducatorSelectionProps {
  onEducatorSelect: (educator: Educator) => void
}

export default function EducatorSelection({ onEducatorSelect }: EducatorSelectionProps) {
  const [educators, setEducators] = useState<Educator[]>([])
  const [filteredEducators, setFilteredEducators] = useState<Educator[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "active" | "high-performance">("all")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [form, setForm] = useState({
    id: "",
    name: "",
    subject: ""
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadEducators = async () => {
      try {
        const data = await getEducators()
        setEducators(data)
        setFilteredEducators(data)
      } catch (error) {
        console.error("Error loading educators:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEducators()
  }, [])

  useEffect(() => {
    let filtered = educators

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (educator) =>
          educator.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          educator.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
          educator.id.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    switch (selectedFilter) {
      case "active":
        filtered = filtered.filter((educator) => educator.status === "active")
        break
      case "high-performance":
        filtered = filtered.filter((educator) => educator.avg_engagement >= 80)
        break
      default:
        break
    }

    setFilteredEducators(filtered)
  }, [searchTerm, selectedFilter, educators])

  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return "bg-green-500"
    if (percentage >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getEngagementBadge = (engagement: number) => {
    if (engagement >= 90) return { color: "bg-green-100 text-green-700", label: "Excellent" }
    if (engagement >= 80) return { color: "bg-blue-100 text-blue-700", label: "Good" }
    if (engagement >= 70) return { color: "bg-yellow-100 text-yellow-700", label: "Average" }
    if (engagement > 0) return { color: "bg-red-100 text-red-700", label: "Needs Improvement" }
    return { color: "bg-gray-100 text-gray-700", label: "No Data" }
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAddEducator = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const educator = {
      id: form.id,
      name: form.name,
      subject: form.subject,
      specialization: "",
      committed_hours: 0,
      completed_hours: 0,
      total_videos: 0,
      avg_engagement: 0,
      last_updated: "Never",
      trend: "0%",
      status: "active",
      join_date: new Date().toISOString().split("T")[0],
      avatar: ""
    }
    const result = await createEducator(educator)
    setIsSubmitting(false)
    if (result) {
      setIsDialogOpen(false)
      setForm({ id: "", name: "", subject: "" })
      // Refresh educators
      const data = await getEducators()
      setEducators(data)
      setFilteredEducators(data)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Select Educator</h2>
          <p className="text-gray-600">Choose an educator to view detailed analytics and performance metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 px-3 py-1 w-fit">
            {filteredEducators.length} of {educators.length} educators
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" className="ml-2">
                Add Educator
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Educator</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddEducator} className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <input name="id" placeholder="ID" value={form.id} onChange={handleFormChange} required className="border p-2 rounded" />
                  <input name="name" placeholder="Name" value={form.name} onChange={handleFormChange} required className="border p-2 rounded" />
                  <input name="subject" placeholder="Subject" value={form.subject} onChange={handleFormChange} required className="border p-2 rounded" />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Educator"}</Button>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="unacademy-card">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, ID, or specialization..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("all")}
                className={selectedFilter === "all" ? "unacademy-button" : ""}
              >
                All
              </Button>
              <Button
                variant={selectedFilter === "active" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("active")}
                className={selectedFilter === "active" ? "unacademy-button" : ""}
              >
                Active
              </Button>
              <Button
                variant={selectedFilter === "high-performance" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedFilter("high-performance")}
                className={selectedFilter === "high-performance" ? "unacademy-button" : ""}
              >
                High Performance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Educators Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <EducatorCardSkeleton key={i} />)
        ) : filteredEducators.length > 0 ? (
          filteredEducators.map((educator) => (
            <EducatorSelectionCard
              key={educator.id}
              educator={educator}
              onSelect={() => onEducatorSelect(educator)}
              getProgressColor={getProgressColor}
              getEngagementBadge={getEngagementBadge}
            />
          ))
        ) : (
          <div className="col-span-full">
            <Card className="unacademy-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No educators found</h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? `No educators match "${searchTerm}". Try adjusting your search.`
                    : "No educators match the selected filter."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

// Individual Educator Card Component
function EducatorSelectionCard({
  educator,
  onSelect,
  getProgressColor,
  getEngagementBadge,
}: {
  educator: Educator
  onSelect: () => void
  getProgressColor: (percentage: number) => string
  getEngagementBadge: (engagement: number) => { color: string; label: string }
}) {
  const progressPercentage = Math.round((educator.completed_hours / educator.committed_hours) * 100)
  const engagementBadge = getEngagementBadge(educator.avg_engagement)

  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 unacademy-card hover:scale-105 border-0">
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <Avatar className="h-14 w-14 ring-2 ring-green-100 shadow-md">
            <AvatarImage src={educator.avatar || "/placeholder.svg"} alt={educator.name} />
            <AvatarFallback className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold">
              {educator.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-slate-900 mb-1 truncate">{educator.name}</h3>
            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 mb-2">
              {educator.id}
            </Badge>
            <p className="text-sm text-slate-600 truncate">{educator.specialization}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-blue-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-3 w-3 text-blue-600" />
            </div>
            <p className="text-lg font-bold text-blue-600">{Math.round(educator.completed_hours)}h</p>
            <p className="text-xs text-blue-500">Hours</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Video className="h-3 w-3 text-green-600" />
            </div>
            <p className="text-lg font-bold text-green-600">{educator.total_videos}</p>
            <p className="text-xs text-green-500">Videos</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-3 w-3 text-orange-600" />
            </div>
            <p className="text-lg font-bold text-orange-600">{educator.avg_engagement}%</p>
            <p className="text-xs text-orange-500">Engagement</p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-slate-700 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Progress
            </span>
            <span className="text-sm font-bold text-green-600">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progressPercentage)}`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>{Math.round(educator.completed_hours)}h completed</span>
            <span>{educator.committed_hours}h target</span>
          </div>
        </div>

        {/* Performance Badge */}
        <div className="flex items-center justify-between mb-4">
          <Badge className={`${engagementBadge.color} text-xs font-medium`}>{engagementBadge.label}</Badge>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Joined {educator.join_date}</span>
          </div>
        </div>

        {/* Status and Last Updated */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${educator.status === "active" ? "bg-green-500" : "bg-gray-400"}`} />
            <span className="text-xs text-slate-600 capitalize">{educator.status}</span>
          </div>
          <span className="text-xs text-slate-500">{educator.last_updated}</span>
        </div>

        {/* Action Button */}
        <Button
          onClick={onSelect}
          className="w-full group-hover:bg-gradient-to-r group-hover:from-purple-50 group-hover:to-indigo-50 group-hover:border-purple-200 group-hover:text-purple-700 transition-all duration-300 bg-transparent border border-gray-200 text-gray-700 hover:text-purple-700"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Analytics
          <TrendingUp className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </CardContent>
    </Card>
  )
}
