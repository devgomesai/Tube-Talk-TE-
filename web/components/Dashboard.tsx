import React from 'react'
import { AppSidebar } from './app-sidebar'
import { SidebarProvider } from './ui/sidebar'

function Dashboard() {
  return (
    <SidebarProvider>
      Dashboard
    </SidebarProvider>
  )
}

export default Dashboard
