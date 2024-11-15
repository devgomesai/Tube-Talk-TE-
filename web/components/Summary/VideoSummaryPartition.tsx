"use client"
import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSummaryContext } from "./SummaryProvider";
import Markdown from "react-markdown";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function VideoSummaryPartition() {
  const { platform, videoId } = useSummaryContext();
  console.log("from VideoSummaryPartition", platform, videoId);
  const [videoSummary, setVideoSummary] = useState(null);

  useEffect(() => {
    // Function to fetch video summary from the API
    const fetchVideoSummary = async () => {
      try {
        const response = await fetch(`/api/v1/${platform}/${videoId}`);
        const data = await response.json();
        console.log(data);
        if (data.summary) {
          setVideoSummary(data.summary.video_summary);
        }
      } catch (error) {
        console.error("Error fetching video summary:", error);
      }
    };

    // Fetch the summary when platform or videoId changes
    if (platform && videoId) {
      fetchVideoSummary();
    }
    console.log(videoSummary)
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
      <Link href={`/quiz?platform=${platform}&id=${videoId}`} className="absolute bottom-4 right-4 bg-primary rounded-lg p-4">Take a Quiz</Link>
      <ScrollArea>
        <div className="flex flex-col gap-4 p-4 prose lg:prose-lg text-foreground">
          <Markdown>{videoSummary}</Markdown>
        </div>
      </ScrollArea>
    </>
  )
}
