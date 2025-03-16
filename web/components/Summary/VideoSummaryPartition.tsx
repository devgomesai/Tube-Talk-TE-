"use client"
import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import { useState, useEffect } from "react";
import QuizDialog from "./Quiz";
import { useSummaryContext } from "./SummaryProvider";

const USE_API = false;

const staticSummary = ` 
## Video Summary

This is a static summary of the video. It covers key points and provides an overview of the content.

- Point 1: Introduction to the topic.
- Point 2: Explanation of key concepts.
- Point 3: Conclusion and takeaways.
`
  ;

export default function VideoSummaryPartition() {
  const [quizOpen, setQuizOpen] = useState(false);
  const [summary, setSummary] = useState("Loading summary...");
  const { videoId } = useSummaryContext();

  useEffect(() => {
    if (!videoId) return;

    async function fetchSummary() {
      try {
        const response = await fetch("http://localhost:8000/summarize_video/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId }),
        });

        if (!response.ok) throw new Error("Failed to fetch summary");

        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        setSummary("Error loading summary. Please try again.");
      }
    }

    // toggle the comment sequence to view the summary
    if (USE_API) {
      fetchSummary();
    } else {
      setSummary(staticSummary);
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
      >
        Take a Quiz
      </Button>
      <QuizDialog open={quizOpen} onOpenChange={setQuizOpen} />
      <ScrollArea>
        <div className="flex flex-col gap-4 p-4 prose lg:prose-lg text-foreground">
          <Markdown>{summary}</Markdown>
        </div>
      </ScrollArea>
    </>
  );
}
