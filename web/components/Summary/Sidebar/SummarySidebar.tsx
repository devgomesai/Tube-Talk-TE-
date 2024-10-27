import { ChatItemType, SummaryNavigation } from "@/lib/types";
import { Sidebar, SidebarContent, SidebarFooter } from "@/components/ui/sidebar";
import { useState } from "react";
import { SearchInput } from "./SearchInput";
import { ChatSection } from "./ChatSection";
import { UserMenu } from "./UserMenu";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function SummarySidebar({ data }: { data: SummaryNavigation }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = data.history.filter((chat) =>
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Sidebar
      title="Summary"
      variant="inset"
      collapsible="icon"
      className="border-r"
    >
      <SidebarContent className="space-y-4 p-2">
        <Button
          variant="default"
          className="w-full"
          onClick={() => window.location.reload()}
        >
          <Plus />
          New Chat
        </Button>
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
        />

        {data.pins?.length && data.pins?.length > 0 && (
          <ChatSection
            label="Pinned"
            chats={data.pins as ChatItemType[]}
            isPinned={true}
          />
        )}

        <ChatSection
          label="History"
          chats={filteredHistory}
        />
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <UserMenu
          name={data.user.name}
          email={data.user.email}
          avatar={data.user.avatar}
        />
      </SidebarFooter>
    </Sidebar>
  );
}
