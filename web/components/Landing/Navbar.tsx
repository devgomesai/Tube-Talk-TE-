"use client";

import { useState, useEffect } from "react"; // Import useState and useEffect
import { ArrowRight, LogOut, Youtube } from "lucide-react"; // Import LogOut icon
import { Button } from "../ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";
import Link from "next/link";
import { useRouter } from "next/navigation";
import pb from "@/lib/db/pocket_base.config"; // Import your PocketBase instance

export default function Navbar() {
  const router = useRouter();
  // State to track if the user is logged in
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Effect to check initial login state and subscribe to changes
  useEffect(() => {
    // Set initial state based on current authStore validity
    setIsLoggedIn(pb.authStore.isValid);

    // Subscribe to authStore changes
    // The callback function updates the isLoggedIn state whenever the auth status changes
    // The function returned by onChange is the unsubscribe function
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setIsLoggedIn(pb.authStore.isValid); // Update state based on validity
      console.log("Auth changed, isValid:", pb.authStore.isValid); // Optional: log changes
    }, true); // `true` calls the callback immediately with the current state

    // Cleanup function: Unsubscribe when the component unmounts
    return () => {
      unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Scroll to a specific section
  const handleScroll = (id: string) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    } else {
      // If not on the main page (where sections exist), navigate first?
      // Or handle differently. For now, it only works if the element exists.
      console.warn(`Element with id "${id}" not found for scrolling.`);
    }
  };

  // Handle user logout
  const handleLogout = () => {
    pb.authStore.clear(); // Clear the auth token and user data
    // The useEffect subscription will automatically update isLoggedIn state
    router.push("/"); // Redirect to home page after logout
    // Or redirect to login page: router.push('/auth/login');
  };

  return (
    <header className="sticky top-0 left-0 right-0 py-4 px-6 bg-background/80 backdrop-blur-md border-b border-border/40 z-50">
      <nav className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center space-x-2 cursor-pointer">
          <Youtube className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            TubeTalk
          </span>
        </Link>

        {/* Navigation and Actions */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Navigation Links - visible only if needed on multiple pages */}
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={() => handleScroll("features")} // Assumes 'features' id exists on the page
          >
            About
          </Button>
          <Button
            variant="ghost"
            className="hidden md:inline-flex"
            onClick={() => handleScroll("contact")} // Assumes 'contact' id exists on the page
          >
            Contact
          </Button>

          {/* Conditional Auth Button */}
          {isLoggedIn ? (
            // Show Logout button if logged in
            <Button variant="outline" onClick={handleLogout} className="flex bg-background text-primary-foreground hover:bg-primary/90 py-2 px-3 sm:px-4 rounded-md items-center gap-1 sm:gap-2 text-sm sm:text-base">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          ) : (
            // Show Sign Up link if logged out
            <Link
              href="/auth" // Link to your signup page
              className="flex bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-3 sm:px-4 rounded-md items-center gap-1 sm:gap-2 text-sm sm:text-base" // Adjusted padding/gap for responsiveness
            >
              Sign Up
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}

          {/* Theme Toggle */}
          <ModeToggle />
        </div>
      </nav>
    </header>
  );
}
