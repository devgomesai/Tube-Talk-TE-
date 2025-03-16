"use client"

import { useState, useEffect } from "react"
import Markdown from "react-markdown"
import { Loader2, Youtube, ExternalLink, AlertCircle } from "lucide-react"

interface SummaryResponse {
  summary: string
  detail?: string
}

interface ProcessResponse {
  detail?: string
  [key: string]: any  // To accommodate other response fields
}

interface ChromeTab {
  url?: string
}

declare global {
  interface Window {
    chrome?: any
  }
}

function App() {
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [summary, setSummary] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string>("initializing")

  useEffect(() => {
    if (typeof window.chrome !== "undefined" && window.chrome.tabs) {
      window.chrome.tabs.query({ active: true, currentWindow: true }, (tabs: ChromeTab[]) => {
        const url = tabs[0]?.url
        if (url) {
          const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
          if (match) {
            setVideoId(match[1])
            setVideoUrl(url)
          } else {
            setVideoId(null)
            setVideoUrl(null)
            setIsLoading(false)
            setError("Not a YouTube video page")
          }
        }
      })
    }
  }, [])

  const processVideo = async () => {
    if (!videoUrl) {
      setIsLoading(false)
      return
    }

    setProcessingStep("processing")
    try {
      const response = await fetch("http://localhost:8000/process_video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_url: videoUrl }),
      })

      const data: ProcessResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to process video")
      }

      // Now that processing is complete, fetch the summary
      await fetchSummary()
    } catch (error) {
      console.error("Processing error:", error)
      setError(error instanceof Error ? error.message : "Failed to process video")
      setIsLoading(false)
    }
  }

  const fetchSummary = async () => {
    if (!videoId) {
      setIsLoading(false)
      return
    }

    setProcessingStep("summarizing")
    try {
      const response = await fetch("http://localhost:8000/summarize_video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId }),
      })

      const data: SummaryResponse = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || "Failed to fetch summary")
      }

      setSummary(data.summary)
      setError(null)
    } catch (error) {
      console.error("Summary error:", error)
      setError(error instanceof Error ? error.message : "Failed to retrieve summary")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (videoId && videoUrl) {
      processVideo()
    }
  }, [videoId, videoUrl])

  return (
    <div className="w-[400px] h-[500px] bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-2 shadow-sm">
        <Youtube className="h-5 w-5 text-red-600" />
        <h1 className="text-lg font-semibold text-slate-800">TubeTalk</h1>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-hidden p-4">
        {/* Summary Section */}
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-4 min-h-[280px]">
          <h2 className="text-sm font-medium text-slate-500 mb-3">Summary</h2>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">
                {processingStep === "processing" ? "Processing video..." : "Generating summary..."}
              </p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
              <AlertCircle className="h-8 w-8 mb-2" />
              <p className="text-sm">{error}</p>
            </div>
          ) : summary ? (
            <div className="prose prose-sm max-w-none text-slate-700 overflow-auto max-h-[280px] pr-2">
              <Markdown>{summary}</Markdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-slate-400">
              <p className="text-sm">No summary available</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-200 bg-white">
        <a
          href={`http://localhost:3000/user?platform=youtube&id=${videoId || ""}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-md transition-colors font-medium"
        >
          View Dashboard
          <ExternalLink className="h-4 w-4" />
        </a>
      </footer>
    </div>
  )
}

export default App
