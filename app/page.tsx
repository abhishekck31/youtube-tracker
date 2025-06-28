"use client"
import { useState } from "react"

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

function getRandomDuration() {
  // Returns a random duration between 10 and 60 minutes
  return Math.floor(Math.random() * 50) + 10
}

function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default function LandingPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [step, setStep] = useState<"email" | "dashboard" | "categoryDashboard">("email")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [educators, setEducators] = useState<string[]>(MOCK_EDUCATORS)
  const [videos, setVideos] = useState<any[]>([]) // {educator, link, duration}
  const [newVideo, setNewVideo] = useState<{ educator: string; link: string }>({ educator: "", link: "" })

  const handleLogin = () => {
    if (!email.endsWith("@unacademy.com")) {
      setError("Please enter a valid @unacademy.com email address.")
      return
    }
    setError("")
    setStep("dashboard")
  }

  const handleCategorySelect = (cat: string) => {
    setSelectedCategory(cat)
    setStep("categoryDashboard")
  }

  const handleAddVideo = () => {
    if (!newVideo.educator || !newVideo.link) return
    // Simulate fetching duration from YouTube
    const duration = getRandomDuration()
    setVideos([
      ...videos,
      { educator: newVideo.educator, link: newVideo.link, duration },
    ])
    setNewVideo({ educator: "", link: "" })
  }

  const getEducatorTotalMinutes = (educator: string) => {
    return videos.filter((v) => v.educator === educator).reduce((sum, v) => sum + v.duration, 0)
  }

  const handleDownload = () => {
    const rows = [
      ["Educator", "Video Link", "Duration (min)", "Category"],
      ...videos.map((v) => [v.educator, v.link, v.duration, selectedCategory]),
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-green-50 to-blue-200 p-4">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center">
          {step === "email" && (
            <div className="bg-white/95 shadow-2xl rounded-2xl px-10 py-12 w-full max-w-md flex flex-col items-center border border-blue-100">
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
            <div className="bg-white/95 shadow-2xl rounded-2xl px-10 py-12 w-full max-w-2xl flex flex-col items-center border border-blue-100">
              <h2 className="text-2xl font-bold mb-6 text-blue-700">Select a Category</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mb-4 max-h-96 overflow-y-auto">
                {CATEGORY_LIST.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategorySelect(cat)}
                    className="w-full px-4 py-3 rounded-xl font-semibold border border-blue-200 bg-white hover:bg-blue-50 text-blue-800 shadow-sm transition-all duration-150 text-left text-base"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === "categoryDashboard" && (
            <div className="w-full">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-blue-800 mb-1">{selectedCategory} Dashboard</h2>
                  <div className="text-gray-500 text-sm">Educators in this category:</div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {educators.map((ed) => (
                      <span key={ed} className="px-3 py-1 bg-blue-100 rounded-full text-blue-800 text-sm font-medium shadow">
                        {ed}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-6 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-semibold shadow transition-all duration-150 mt-4 md:mt-0"
                >
                  Download Data (CSV)
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-100">
                <h3 className="font-semibold mb-4 text-blue-700">Add Video Link</h3>
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <select
                    value={newVideo.educator}
                    onChange={e => setNewVideo(v => ({ ...v, educator: e.target.value }))}
                    className="px-3 py-2 border rounded-lg w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select Educator</option>
                    {educators.map((ed) => (
                      <option key={ed} value={ed}>{ed}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Paste YouTube video link"
                    value={newVideo.link}
                    onChange={e => setNewVideo(v => ({ ...v, link: e.target.value }))}
                    className="px-3 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleAddVideo}
                    className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow transition-all duration-150 disabled:opacity-50"
                    disabled={!newVideo.educator || !newVideo.link}
                  >
                    Add
                  </button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 overflow-x-auto">
                  <h3 className="font-semibold mb-4 text-blue-700">Videos Table</h3>
                  <table className="min-w-full border text-sm rounded-lg overflow-hidden">
                    <thead>
                      <tr className="bg-blue-100">
                        <th className="px-3 py-2 border">Educator</th>
                        <th className="px-3 py-2 border">Video Link</th>
                        <th className="px-3 py-2 border">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {videos.length === 0 && (
                        <tr><td colSpan={3} className="text-center py-4">No videos yet.</td></tr>
                      )}
                      {videos.map((v, i) => (
                        <tr key={i} className="hover:bg-blue-50">
                          <td className="px-3 py-2 border font-medium text-blue-900">{v.educator}</td>
                          <td className="px-3 py-2 border"><a href={v.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Video</a></td>
                          <td className="px-3 py-2 border">{formatDuration(v.duration)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 flex flex-col justify-between">
                  <h3 className="font-semibold mb-4 text-blue-700">Hours per Educator</h3>
                  <div className="flex gap-4 items-end h-48 w-full">
                    {educators.map((ed) => {
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
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}