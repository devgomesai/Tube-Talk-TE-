"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick, Video } from "lucide-react";
import { Input } from "../aceternity/input";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { url } from "inspector";

export default function Hero() {
  const [youtubeUrl, setYoutubeUrl] = useState(""); // Store the URL here
  let platform: string, videoId: string;
  const router = useRouter();

  const handleSubmit = async (url: string) => {
    const encodedUrl = encodeURIComponent(url);
    console.log("Encoded URL:", encodedUrl);

    try {
      const response = await fetch(`/api/v1/link?url=${encodedUrl}`);
      const data = await response.json();

      if (data.platform && data.videoId) {
        router.push(`/user?platform=${data.platform}&id=${data.videoId}`);
      } else {
        console.log("Please provide a valid YouTube URL.");
      }
    } catch (error) {
      console.log("Error processing URL:", error);
    }
  };

  return (
    <div className="relative pt-16 md:pt-24 lg:pt-32 pb-20 px-4 sm:px-6 lg:px-8 z-30">
      <div className="max-w-7xl mx-auto space-y-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8 text-center"
        >
          {/* Hero Title with Shadow */}
          <div className="relative">
            {/* Gradient Shadow */}
            <div className="-inset-x-20 -inset-y-10 bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 blur-3xl opacity-50" />
            <h1 className="text-4xl mt-12 sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight">
              <span className="relative bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-transparent">
                <MousePointerClick className="h-16 w-16 absolute bottom-0 right-0 text-primary hidden sm:block translate-y-1/4 translate-x-1/3" fill="red" />
                Videos to Insights In a Click
              </span>
            </h1>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto tracking-normal font-normal"
          >
            Transform Videos into Insights, Quizzes, Chats, and More—All with a Single Click!
          </motion.p>
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-2xl mx-auto px-4"
          >
            <div className="flex flex-row gap-2 sm:gap-4">
              <Input
                id="youtube-url"
                type="url"
                placeholder="Paste YouTube URL here"
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)} // Update the state when input changes
                className="flex-grow text-base sm:text-lg py-6 px-6 sm:py-8 sm:px-8 shadow-md hover:shadow-lg transition-shadow rounded-lg"
              />
              <Button
                type="submit"
                id="submit-btn"
                className="cursor-pointer h-auto text-lg font-medium shadow-md hover:shadow-lg transition-shadow px-6 sm:px-8"
                onClick={() => handleSubmit(youtubeUrl)} // Handle the form submission
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 px-4"
          >
            <Button
              variant="outline"
              className="gap-2 p-2 hover:bg-primary/5 border-border/40"
              onClick={() => handleSubmit("https://www.youtube.com/watch?v=psLHV0r1MGI")}
            >
              <Video className="h-5 w-5" />
              <span>Tubetalk</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 p-2 hover:bg-primary/5 border-border/40"
              onClick={() => handleSubmit("https://www.youtube.com/watch?v=psLHV0r1MGI")}
            >
              <Video className="h-5 w-5" />
              <span>Rick Roll</span>
            </Button>
            <Button
              variant="outline"
              className="gap-2 p-2 hover:bg-primary/5 border-border/40"
              onClick={() => handleSubmit("https://www.youtube.com/watch?v=psLHV0r1MGI")}
            >
              <Video className="h-5 w-5" />
              <span>Me at Zoo</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
