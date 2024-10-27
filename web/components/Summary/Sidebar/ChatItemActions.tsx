import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Edit2, MoreHorizontal, Pin, PinOff, Share2, Trash2 } from "lucide-react";
import { useState, useCallback } from "react";

interface ChatItemActionsProps {
  isPinned: boolean;
  onDelete?: () => void;
  onPin?: () => void;
  onShare?: () => void;
  onRename?: () => void;
}

export const ChatItemActions = ({
  isPinned,
  onDelete,
  onPin,
  onShare,
  onRename
}: ChatItemActionsProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = useCallback(async (action: () => void) => {
    setIsLoading(true);
    action();
    setIsLoading(false);
  }, []);

  return (
    <DropdownMenu modal={true}>
      <DropdownMenuTrigger asChild disabled={isLoading}>
        <button className="ml-auto invisible group-hover/chat:visible focus:visible">
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 bg-popover border border-border shadow-md"
        sideOffset={5}
      >
        <DropdownMenuItem
          onClick={() => handleAction(onDelete)}
          className="gap-2"
        >
          <Trash2 className="h-4 w-4" />
          Delete Chat
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction(onPin)}
          className="gap-2"
        >
          {isPinned ? (<>
            <PinOff className="h-4 w-4" />
            Unpin Chat</>) : (
            <>
              <Pin className="h-4 w-4" />
              Pin Chat
            </>)}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction(onShare)}
          className="gap-2"
        >
          <Share2 className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleAction(onRename)}
          className="gap-2"
        >
          <Edit2 className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
