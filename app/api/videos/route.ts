import { NextRequest, NextResponse } from "next/server"

// In-memory mock data
let videos = [
  {
    id: "1",
    title: "Advanced React Patterns and Best Practices",
    url: "https://www.youtube.com/watch?v=abcd1234",
    educator: "John Doe",
    duration: "15:30",
    date: "2024-06-28",
    category: "React",
  },
  {
    id: "2",
    title: "Introduction to Machine Learning Fundamentals",
    url: "https://www.youtube.com/watch?v=efgh5678",
    educator: "Jane Smith",
    duration: "25:45",
    date: "2024-06-27",
    category: "Machine Learning",
  },
]

export async function GET(req: NextRequest) {
  return NextResponse.json({ videos, total: videos.length })
}

export async function POST(req: NextRequest) {
  const data = await req.json()
  const newVideo = { ...data, id: Date.now().toString() }
  videos.unshift(newVideo)
  return NextResponse.json(newVideo, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const data = await req.json()
  const { id, ...updates } = data
  videos = videos.map((v) => (v.id === id ? { ...v, ...updates } : v))
  const updated = videos.find((v) => v.id === id)
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  videos = videos.filter((v) => v.id !== id)
  return NextResponse.json({ success: true })
} 