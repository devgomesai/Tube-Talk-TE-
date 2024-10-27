import { UserDetails } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BadgeCheck, Bell, ChevronsUpDown, CreditCard, LogOut, Sparkles } from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";

export const UserMenu = ({ avatar, name, email }: UserDetails) => {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu modal={true}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              className="w-full p-2 hover:bg-accent rounded-md gap-3"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={avatar} alt={name} />
                <AvatarFallback>
                  {name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium leading-none">{name}</p>
                <p className="text-xs text-muted-foreground truncate">{email}</p>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-56 bg-popover border border-border shadow-md"
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-2 p-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={avatar} alt={name} />
                  <AvatarFallback>
                    {name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium leading-none">{name}</p>
                  <p className="text-xs text-muted-foreground truncate">{email}</p>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2">
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem className="gap-2">
                <BadgeCheck className="h-4 w-4" />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <CreditCard className="h-4 w-4" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2">
              <LogOut className="h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
};
