"use client"

import {
  Send,
} from "lucide-react"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import InsetSidebar from "./InsetSidebar";
import SummaryPartition from "./SummaryPartition";
import ChatPartition from "./ChatPartition";

export default function Summary() {
  return (
    <SidebarProvider>
      <InsetSidebar />
      <SidebarInset>
        <SummaryPartition />
      </SidebarInset>

      <SidebarInset>
        <ChatPartition />
      </SidebarInset>
    </SidebarProvider >
  )
}

