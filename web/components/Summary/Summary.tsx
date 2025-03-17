"use client"

import {
  SidebarInset,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar"
import SummarySidebar from "./Sidebar";
import VideoSummaryPartition from "./VideoSummaryPartition";
import ChatPartition from "./ChatPartition";
import summarySidebarData from "@/lib/data/summarySidebarData";
import { useSummaryContext } from "./SummaryProvider";
import platformMap from "@/lib/data/platform_map";
import { useEffect } from "react";

export default function Summary() {
  return (
    <SidebarProvider className="flex h-screen overflow-hidden text-lg">
      <SummaryContent />
    </SidebarProvider>
  );
}

function SummaryContent() {
  const { isMobile } = useSidebar()
  return (
    <>
      <SummarySidebar />

      <SidebarInset className="flex flex-col min-h-0">
        <VideoSummaryPartition />
        {isMobile && <ChatPartition />}
      </SidebarInset>

      {!isMobile && (
        <SidebarInset className="flex flex-col min-h-0">
          <ChatPartition />
        </SidebarInset>
      )}
    </>
  )
}
