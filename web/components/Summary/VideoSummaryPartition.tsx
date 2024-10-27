import { ModeToggle } from "../theme/mode-toggle";
import { Separator } from "../ui/separator";
import { SidebarTrigger } from "../ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function VideoSummaryPartition() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex justify-between w-full items-center px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <h1 className="text-2xl font-bold">Summary</h1>
          </div>
          <ModeToggle />
        </div>
      </header>
      <ScrollArea>
        <div className="flex flex-col gap-4 p-4">
          <div className="aspect-video rounded-xl bg-muted" />
          <div className="aspect-video rounded-xl bg-muted" />
          <div className="aspect-video rounded-xl bg-muted" />
          <div className="aspect-video rounded-xl bg-muted" />
          <div className="aspect-video rounded-xl bg-muted" />
        </div>
      </ScrollArea>
    </>
  )
}
