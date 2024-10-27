import { ChatItemType } from "@/lib/types";
import { SidebarGroup, SidebarGroupLabel } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { ChatItem } from "./ChatItem";

interface ChatSectionProps {
  label: string;
  chats: ChatItemType[];
  isPinned?: boolean;
}

export const ChatSection = ({ label, chats, isPinned = false }: ChatSectionProps) => {
  return (
    <SidebarGroup className="space-y-1">
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex w-full items-center justify-between py-1 px-2">
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground">
            {label}
          </SidebarGroupLabel>
          <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform duration-200" />
        </CollapsibleTrigger>
        <CollapsibleContent>
          {chats.map((chat) => (
            <ChatItem
              key={chat.title}
              chat={chat}
              isPinned={isPinned}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </SidebarGroup>
  );
};
