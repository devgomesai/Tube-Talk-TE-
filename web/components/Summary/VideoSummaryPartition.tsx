"use client"
import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSummaryContext } from "./SummaryProvider";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import QuizDialog from "./Quiz";

export default function VideoSummaryPartition() {
  const { platform, videoId } = useSummaryContext();
  const [videoSummary, setVideoSummary] = useState(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchVideoSummary = async () => {
      if (!videoId) return;
      
      setIsLoading(true);
      try {
        // Use the correct FastAPI endpoint with form data
        const formData = new FormData();
        formData.append('video_id', videoId);
        
        const response = await fetch('http://localhost:8000/summarize_video/', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        console.log("Summary response:", data);
        
        if (data.summary) {
          setVideoSummary(data.summary);
        } else if (data.detail) {
          console.error("API error:", data.detail);
          setVideoSummary(`Error: ${data.detail}`);
        }
      } catch (error) {
        console.error("Error fetching video summary:", error);
        setVideoSummary("Failed to fetch summary. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    if (videoId) {
      fetchVideoSummary();
    }
  }, [videoId]);

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex justify-between w-full items-center px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Summary</h1>
          </div>
          <ModeToggle />
        </div>
      </header>
      <Button
        onClick={() => setQuizOpen(true)}
        className="absolute bottom-4 right-4"
        size="lg"
        disabled={isLoading || !videoSummary}
      >
        Take a Quiz
      </Button>
      <QuizDialog
        open={quizOpen}
        onOpenChange={setQuizOpen}
        platform={platform}
        videoId={videoId}
      />
      <ScrollArea>
        <div className="flex flex-col gap-4 p-4 prose lg:prose-lg text-foreground">
          {isLoading ? (
            <div className="text-center py-8">Loading summary...</div>
          ) : (
            <Markdown>{videoSummary || "No summary available."}</Markdown>
          )}
        </div>
      </ScrollArea>
    </>
  )
}