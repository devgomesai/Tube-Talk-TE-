"use client"
import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
// Removed SidebarTrigger as it wasn't used
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import { useState, useEffect } from "react";
import QuizDialog from "./Quiz"; // Assuming ./Quiz is the correct path
import { useSummaryContext } from "./SummaryProvider";
import { ChevronLeft, HelpCircle, Loader2, AlertTriangle, LogOut } from "lucide-react"; // Added icons
// Removed CSS import if not strictly needed after Tailwind adjustments
// import "./VideoSummaryPartition.css"
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Import Alert components
import pb from "@/lib/db/pocket_base.config";
import { useRouter } from "next/navigation";

const USE_API = true; // Keep your flag

// Moved static summary outside component if it's truly static
const staticSummaryData = `
## Video Summary (Static Example)
This is a static summary of the video used when the API is disabled. It covers key points and provides an overview of the content.

- **Point 1:** Introduction to the topic.
- **Point 2:** Explanation of key concepts. Here is some **bold text** and *italic text*.
- **Point 3:** Conclusion and takeaways.

You can include code blocks:
\`\`\`javascript
console.log('Hello, world!');
\`\`\`

And other Markdown features.
`;

// --- Corrected EmbedVideo Component ---
function EmbedVideo({ videoId }: { videoId: string | null }) {
  if (!videoId) return null; // Don't render if no videoId

  return (
    // Responsive video container using aspect ratio
    <div className="w-full max-w-3xl mx-auto aspect-video overflow-hidden rounded-lg shadow-lg">
      <iframe
        className="w-full h-full" // Ensure iframe fills the container
        src={`https://www.youtube.com/embed/${videoId}`} // Correct YouTube embed URL
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      >
      </iframe>
    </div>
  )
}

export default function VideoSummaryPartition() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [summary, setSummary] = useState(""); // Initialize empty
  const [processingStep, setProcessingStep] = useState<string>("initializing");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // <-- State for errors
  const { videoId } = useSummaryContext();
  const router = useRouter()

  useEffect(() => {
    if (!videoId) {
      setError("No video ID provided.");
      setIsLoading(false);
      return;
    }

    // Reset state for new videoId
    setIsLoading(true);
    setError(null);
    setSummary("");
    setProcessingStep("initializing");

    async function processVideo() {
      try {
        setProcessingStep("processing");
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`; // Use standard URL for processing if needed by backend

        const processResponse = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/process_video/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_url: videoUrl }), // Or just video_id: videoId if backend prefers
        });

        if (!processResponse.ok) {
          let errorDetail = "Failed to process video";
          try {
            const errorData = await processResponse.json();
            errorDetail = errorData.detail || errorDetail;
          } catch { /* Ignore JSON parsing error */ }
          throw new Error(errorDetail);
        }

        // If process is successful, fetch the summary
        await fetchSummary();

      } catch (err) {
        console.error("Processing error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during processing.");
        setIsLoading(false);
      }
    }

    async function fetchSummary() {
      try {
        setProcessingStep("summarizing");
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/summarize_video/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId }),
        });

        if (!response.ok) {
          let errorDetail = "Failed to fetch summary";
          try {
            const errorData = await response.json();
            errorDetail = errorData.detail || errorDetail;
          } catch { /* Ignore JSON parsing error */ }
          throw new Error(errorDetail);
        }

        const data = await response.json();
        setSummary(data.summary);

      } catch (err) {
        console.error("Summarizing error:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred during summarization.");
      } finally {
        setIsLoading(false); // Stop loading regardless of summary success/failure (if process was ok)
      }
    }

    // --- Execution Logic ---
    if (USE_API) {
      processVideo();
    } else {
      // Simulate API delay for static data
      setTimeout(() => {
        setSummary(staticSummaryData);
        setIsLoading(false);
      }, 1500); // 1.5 second delay
    }

  }, [videoId]); // Rerun effect when videoId changes

  const handleLogout = () => {
    pb.authStore.clear(); // Clear the auth token and user data
    // The useEffect subscription will automatically update isLoggedIn state
    router.push("/"); // Redirect to home page after logout
    // Or redirect to login page: router.push('/auth/login');
  };

  return (
    <div className="flex flex-col h-full w-full min-w-3/4"> {/* Ensure component takes full height if needed */}
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center border-b px-4 md:px-6 sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" asChild>
              <Link href="/" aria-label="Back to Home">
                <ChevronLeft className="h-5 w-5" />
              </Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <h1 className="text-lg md:text-xl font-semibold">Video Summary</h1>
          </div>

          <Button variant="outline" onClick={handleLogout} className="flex bg-background text-primary-foreground hover:bg-primary/90 py-2 px-3 sm:px-4 rounded-md items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <ScrollArea className="flex-1"> {/* ScrollArea takes remaining space */}
        <div className="container mx-auto max-w-4xl px-4 py-6 md:py-8">
          {isLoading ? (
            // Loading State
            <div className="flex flex-col items-center justify-center pt-16 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-6" />
              <p className="text-lg font-medium text-muted-foreground">
                {processingStep === "processing"
                  ? "Processing video content..."
                  : processingStep === "summarizing"
                    ? "Generating summary..."
                    : "Initializing..."}
              </p>
              <p className="text-sm text-muted-foreground mt-2">This might take a moment...</p>
            </div>
          ) : error ? (
            // Error State
            <Alert variant="destructive" className="my-8">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : (
            // Content Loaded State
            <div className="flex flex-col gap-6 md:gap-8">
              <EmbedVideo videoId={videoId} />

              {/* Summary Section */}
              <div className="prose prose-stone dark:prose-invert max-w-none lg:prose-lg">
                {/* Apply prose classes for markdown styling */}
                <Markdown >{summary}</Markdown>
              </div>

              {/* Quiz Button - Placed after content */}
              <div className="mt-6 flex justify-center absolute right-4 bottom-4">
                <Button
                  onClick={() => setQuizOpen(true)}
                  size="lg"
                  className="shadow-md"
                >
                  <HelpCircle className="mr-2 h-5 w-5" />
                  Take a Quiz
                </Button>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quiz Dialog - Rendered outside scroll area but controlled by state */}
      <QuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
    </div>
  );
}
