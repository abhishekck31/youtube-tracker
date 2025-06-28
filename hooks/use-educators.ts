"use client"

import { useState, useEffect } from "react"
import type { Educator } from "@/lib/validations"
import { APIError } from "@/lib/api"

// Mock data for development
const mockEducators: Educator[] = [
  {
    id: "1",
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@university.edu",
    department: "Computer Science",
    initials: "SJ",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
  },
  {
    id: "2",
    name: "Prof. Michael Chen",
    email: "michael.chen@university.edu",
    department: "Data Science",
    initials: "MC",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
  },
  {
    id: "3",
    name: "Dr. Emily Rodriguez",
    email: "emily.rodriguez@university.edu",
    department: "Software Engineering",
    initials: "ER",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
  },
  {
    id: "4",
    name: "Prof. David Kim",
    email: "david.kim@university.edu",
    department: "Machine Learning",
    initials: "DK",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
  },
  {
    id: "5",
    name: "Dr. Lisa Thompson",
    email: "lisa.thompson@university.edu",
    department: "Web Development",
    initials: "LT",
    avatar: "/placeholder.svg?height=40&width=40",
    isActive: true,
  },
]

export function useEducators() {
  const [educators, setEducators] = useState<Educator[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchEducators = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // For development, use mock data
        // In production, replace with: const data = await apiClient.getEducators()
        await new Promise((resolve) => setTimeout(resolve, 800)) // Simulate API delay
        setEducators(mockEducators)
      } catch (err) {
        const errorMessage = err instanceof APIError ? err.message : "Failed to load educators"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEducators()
  }, [])

  return { educators, isLoading, error }
}
