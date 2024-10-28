"use client"

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import SummarySidebar from "./Sidebar";
import SearchInterface from "./SearchInterface";

export default function Summary() {
  return (
    <SidebarProvider className="flex h-screen overflow-hidden">
      <SummarySidebar />
      <SidebarInset className="flex flex-col min-h-0">
        <SearchInterface />
      </SidebarInset>
    </SidebarProvider>
  )
}
