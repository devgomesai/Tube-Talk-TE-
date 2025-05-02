"use client"

import {
  SidebarProvider,
} from "@/components/ui/sidebar"
import VideoSummaryPartition from "./VideoSummaryPartition";
import ChatPartition from "./ChatPartition";

export default function Summary() {
  return (
    <SidebarProvider className="flex h-screen overflow-hidden text-lg">
      <SummaryContent />
    </SidebarProvider>
  );
}

function SummaryContent() {
  return (
    <div className="flex flex-col h-full md:flex-row w-full">
      <div className="flex-1 min-w-3/4">
        <VideoSummaryPartition />
      </div>
      <div className="flex-1 w-full md:max-w-1/4">
        < ChatPartition />
      </div>
    </div>
  )
}
