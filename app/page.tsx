"use client"
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