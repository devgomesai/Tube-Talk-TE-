import { ChatItemType } from "@/lib/types";
import { SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { ChatItemActions } from "./ChatItemActions";

interface ChatItemProps {
  chat: ChatItemType;
  isPinned: boolean;
}

export const ChatItem = ({ chat, isPinned }: ChatItemProps) => {
  const handleDelete = async () => {
    // Implement delete logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handlePin = async () => {
    // Implement pin logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleShare = async () => {
    // Implement share logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  const handleRename = async () => {
    // Implement rename logic
    await new Promise(resolve => setTimeout(resolve, 1000));
  };

  return (
    <SidebarMenuItem className="group/chat list-none">
      <SidebarMenuButton className="w-full justify-between py-2 px-3 rounded-md hover:bg-accent">
        <span className="truncate text-sm">{chat.title}</span>
        <ChatItemActions
          isPinned={isPinned}
          onDelete={handleDelete}
          onPin={handlePin}
          onShare={handleShare}
          onRename={handleRename}
        />
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
};
