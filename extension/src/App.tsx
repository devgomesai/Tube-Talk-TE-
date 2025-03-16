import { useState, useEffect } from "react";
import Markdown from "react-markdown";

interface SummaryResponse {
  summary: string;
}

interface ChromeTab {
  url?: string;
}

declare global {
  interface Window {
    chrome?: any;
  }
}

function App() {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window.chrome !== "undefined" && window.chrome.tabs) {
      window.chrome.tabs.query(
        { active: true, currentWindow: true },
        (tabs: ChromeTab[]) => {
          const url = tabs[0]?.url;
          if (url) {
            const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
            if (match) {
              setVideoId(match[1]);
            } else {
              setVideoId(null);
            }
          }
        }
      );
    }
  }, []);

  const fetchSummary = async () => {
    if (!videoId) {
      setSummary("No valid YouTube video found");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/summarize_video/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch summary");
      }

      const data: SummaryResponse = await response.json();
      setSummary(data.summary);
    } catch (error) {
      console.error("Error:", error);
      setSummary("Failed to retrieve summary");
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [videoId]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-96 h-[30rem] p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">YouTube Video Summary</h2>
        {videoId ? (
          <p className="text-gray-700 mb-2">Video ID: <span className="font-mono text-blue-600">{videoId}</span></p>
        ) : (
          <p className="text-red-500">No valid YouTube video found</p>
        )}
        {summary && (
          <Markdown>
            {summary}
          </Markdown>
        )}
        <a
          href={`http://localhost:3000/user?platform=youtube&id=${videoId}`}
          target="_blank"
          className="mt-6 block text-center bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
        >
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
