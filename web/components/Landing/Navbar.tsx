import { ArrowRight, Youtube } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";

export default function Navbar() {
  return (

    <header className="top-0 left-0 right-0 py-4 px-6 bg-background/80 backdrop-blur-md border-b border-border/40 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Youtube className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">TubeTalk</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="hidden md:inline-flex">About</Button>
          <Button variant="ghost" className="hidden md:inline-flex">Contact</Button>
          <Button variant="default" className="gap-2 shadow-sm">
            Sign Up<ArrowRight className="h-4 w-4" />
          </Button>
          <ModeToggle />
        </div>
      </nav>
    </header>
  )
}
