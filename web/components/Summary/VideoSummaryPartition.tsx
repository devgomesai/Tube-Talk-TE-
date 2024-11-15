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

  useEffect(() => {
    const fetchVideoSummary = async () => {
      try {
        const response = await fetch(`/api/v1/${platform}/${videoId}`);
        const data = await response.json();
        if (data.summary) {
          setVideoSummary(data.summary.video_summary);
        }
      } catch (error) {
        console.error("Error fetching video summary:", error);
      }
    };

    if (platform && videoId) {
      fetchVideoSummary();
    }
  }, [platform, videoId]);

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
          <Markdown>{videoSummary}</Markdown>
        </div>
      </ScrollArea>
    </>
  )
}
