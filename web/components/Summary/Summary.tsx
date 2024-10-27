"use client"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import SummarySidebar from "./Sidebar";
import VideoSummaryPartition from "./VideoSummaryPartition";
import ChatPartition from "./ChatPartition";
import summarySidebarData from "@/lib/data/summarySidebarData";

export default function Summary() {
  return (
    <SidebarProvider className="flex h-screen overflow-hidden">
      <SummarySidebar data={summarySidebarData} />

      <SidebarInset className="flex flex-col min-h-0">
        <VideoSummaryPartition />
      </SidebarInset>

      <SidebarInset className="flex flex-col min-h-0">
        <ChatPartition />
      </SidebarInset>
    </SidebarProvider>
  )
}
