"use client"

import * as React from "react"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  AudioWaveform,
  BadgeCheck,
  Bell,
  Blocks,
  Calendar,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  Command,
  Copy,
  CornerUpLeft,
  CornerUpRight,
  CreditCard,
  FileText,
  GalleryVerticalEnd,
  History,
  HistoryIcon,
  Home,
  Inbox,
  LineChart,
  Link,
  LogOut,
  MessageCircleQuestion,
  MoreHorizontal,
  Pin,
  PinOff,
  Plus,
  Search,
  Settings2,
  Sparkles,
  Star,
  StarOff,
  Timer,
  Trash,
  Trash2,
  type LucideIcon,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { Avatar } from "@radix-ui/react-avatar"
import { AvatarFallback, AvatarImage } from "../ui/avatar"
import { ChatItemType } from "@/lib/types"
// This is sample data.
const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: Home,
    },
    {
      title: "Search",
      url: "#",
      icon: Search,
      badge: "10",
    },
    {
      title: "History",
      url: "#",
      icon: History,
    },
  ],
  history: [
    {
      title: "Understanding Neural Networks",
      url: "https://example.com/neural-networks",
    },
    {
      title: "Chatbot Design Patterns",
      url: "https://example.com/chatbot-design",
    },
    {
      title: "AI Ethics and Privacy",
      url: "https://example.com/ai-ethics",
    },
    {
      title: "Predictive Analytics in Business",
      url: "https://example.com/predictive-analytics",
    },
    {
      title: "AI and Robotics",
      url: "https://example.com/ai-robotics",
    },
    {
      title: "Data Science Best Practices",
      url: "https://example.com/data-science",
    },
    {
      title: "Introduction to Reinforcement Learning",
      url: "https://example.com/reinforcement-learning",
    },
    {
      title: "AI in Healthcare",
      url: "https://example.com/ai-healthcare",
    },
    {
      title: "Understanding Transformer Models",
      url: "https://example.com/transformers",
    },
    {
      title: "Optimizing AI Model Performance",
      url: "https://example.com/ai-optimization",
    },
  ],
  pinned: [
    {
      title: "Introduction to AI",
      url: "https://example.com/ai-intro",
      emoji: "🤖",
    },
    {
      title: "Machine Learning Basics",
      url: "https://example.com/ml-basics",
      emoji: "🔥",
    },
    {
      title: "Deep Learning Overview",
      url: "https://example.com/deep-learning",
      emoji: "💥",
    },
    {
      title: "Natural Language Processing",
      url: "https://example.com/nlp",
      emoji: "📚",
    },
    {
      title: "Computer Vision Fundamentals",
      url: "https://example.com/computer-vision",
      emoji: "🌄",
    },
    {
      title: "Ethical AI Principles",
      url: "https://example.com/ethical-ai",
      emoji: "🌈",
    },
    {
      title: "AI Model Deployment",
      url: "https://example.com/ai-deployment",
      emoji: "🚀",
    },
    {
      title: "Generative AI Models",
      url: "https://example.com/generative-ai",
      emoji: "🌠",
    },
  ],
  actions: [
    [
      {
        label: "Customize Page",
        icon: Settings2,
      },
      {
        label: "Turn into wiki",
        icon: FileText,
      },
    ],
    [
      {
        label: "Copy Link",
        icon: Link,
      },
      {
        label: "Duplicate",
        icon: Copy,
      },
      {
        label: "Move to",
        icon: CornerUpRight,
      },
      {
        label: "Move to Trash",
        icon: Trash2,
      },
    ],
    [
      {
        label: "Undo",
        icon: CornerUpLeft,
      },
      {
        label: "View analytics",
        icon: LineChart,
      },
      {
        label: "Version History",
        icon: GalleryVerticalEnd,
      },
      {
        label: "Show delete pages",
        icon: Trash,
      },
      {
        label: "Notifications",
        icon: Bell,
      },
    ],
    [
      {
        label: "Import",
        icon: ArrowUp,
      },
      {
        label: "Export",
        icon: ArrowDown,
      },
    ],
  ],
}

export default function SummarySidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props} collapsible="icon" variant="inset">
      <SidebarHeader className="bg-background rounded-lg p-2 mb-2">
        <Nav items={data.navMain} />
      </SidebarHeader>
      <SidebarContent className="no-scrollbar">
        <PinnedChats pinned={data.pinned} />
        <ChatHistory chatHistory={data.history} />
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <UserMenu name="John Doe" email="john@example.com" avatar="/next.png" />
      </SidebarFooter>
    </Sidebar>
  )
}


function NavActions({
  actions,
}: {
  actions: {
    label: string
    icon: LucideIcon
  }[][]
}) {
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setIsOpen(true)
  }, [])

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className="hidden font-medium text-muted-foreground md:inline-block">
        Edit Oct 08
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7">
        <Star />
      </Button>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 data-[state=open]:bg-accent"
          >
            <MoreHorizontal />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 overflow-hidden rounded-lg p-0"
          align="end"
        >
          <Sidebar collapsible="none" className="bg-transparent">
            <SidebarContent>
              {actions.map((group, index) => (
                <SidebarGroup key={index} className="border-b last:border-none">
                  <SidebarGroupContent className="gap-0">
                    <SidebarMenu>
                      {group.map((item, index) => (
                        <SidebarMenuItem key={index}>
                          <SidebarMenuButton>
                            <item.icon /> <span>{item.label}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
            </SidebarContent>
          </Sidebar>
        </PopoverContent>
      </Popover>
    </div>
  )
}

function ChatHistory({ chatHistory }: { chatHistory: ChatItemType[] }) {
  const { isMobile } = useSidebar()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden bg-background rounded-lg">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {chatHistory.map((chat) => (
          <SidebarMenuItem key={chat.title}>
            <SidebarMenuButton asChild>
              <a href={chat.url} title={chat.title}>
                <span>{chat.title}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem>
                  <Pin className="text-muted-foreground" />
                  <span>Pin</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link className="text-muted-foreground" />
                  <span>Copy Link</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <ArrowUpRight className="text-muted-foreground" />
                  <span>Open in New Tab</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}


function Nav({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
}) {
  const { open: isOpen } = useSidebar()

  return (
    <SidebarMenu className="w-auto">
      <div className={`grid ${isOpen ? 'grid-cols-3' : 'grid-cols-1'} gap-2`}>
        {items.map((item) => (
          <Tooltip key={item.title}>
            <TooltipTrigger asChild>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={item.isActive} className="h-16 group/nav hover:bg-background">
                  <a href={item.url} className="flex items-center justify-center bg-muted">
                    <item.icon className="w-8 h-8 group-hover/nav:text-primary" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </TooltipTrigger>
            <TooltipContent>{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </SidebarMenu>
  )
}

function PinnedChats({
  pinned,
}: {
  pinned: ChatItemType[]
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="bg-background rounded-lg">
      <SidebarGroupLabel>Pinned</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {pinned.map((chat) => (
            <SidebarMenuItem key={chat.title}>
              <SidebarMenuButton asChild>
                <a href={chat.url}>
                  <span>{chat.emoji}</span>
                  <span>{chat.title}</span>
                </a>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-56 rounded-lg"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <PinOff className="text-muted-foreground" />
                    <span>Unpin</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link className="text-muted-foreground" />
                    <span>Copy Link</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </DropdownMenuContent>
              </DropdownMenu>

            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

function UserMenu({ name, email, avatar }: { name: string, email: string, avatar: string }) {

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={avatar}
                  alt={name}
                />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {name}
                </span>
                <span className="truncate text-xs">
                  {email}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side="bottom"
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage
                    src={avatar}
                    alt={name}
                  />
                  <AvatarFallback className="rounded-lg">
                    CN
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {name}
                  </span>
                  <span className="truncate text-xs">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Sparkles />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheck />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
