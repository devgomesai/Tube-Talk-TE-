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
    <div className="flex flex-col h-full md:flex-row w-full">

      <div className="flex-1">
        <VideoSummaryPartition />
      </div>
      < ChatPartition />
    </div>
  )
}
