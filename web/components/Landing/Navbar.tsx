"use client";

import { ArrowRight, Youtube } from "lucide-react";
import { Button } from "../ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import Link from "next/link";

export default function Navbar() {
  // Scroll to a specific section
  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="top-0 left-0 right-0 py-4 px-6 bg-background/80 backdrop-blur-md border-b border-border/40 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Youtube className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">TubeTalk</span>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={() => handleScroll("features")}
          >
            About
          </Button>
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={() => handleScroll("contact")}
          >
            Contact
          </Button>
          <Link href="/auth/login" className="flex bg-primary py-2 px-4 rounded-md items-center gap-2">
            Sign Up<ArrowRight className="h-4 w-4" />
          </Link>
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}

