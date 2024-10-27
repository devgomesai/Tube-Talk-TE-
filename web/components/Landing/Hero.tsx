"use client";
import { motion } from "framer-motion";
import { ArrowRight, MousePointerClick, Video } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

export default function Hero() {
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
                type="url"
                placeholder="Paste YouTube URL here"
                className="flex-grow text-base sm:text-lg py-6 px-6 sm:py-8 sm:px-8 shadow-md hover:shadow-lg transition-shadow rounded-lg"
              />
              <Button
                type="submit"
                className="cursor-pointer h-auto text-lg font-medium shadow-md hover:shadow-lg transition-shadow px-6 sm:px-8"
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
            <Button variant="outline" className="gap-2 p-2 hover:bg-primary/5 border-border/40">
              <Video className="h-5 w-5" />
              <span>Read Transcript</span>
            </Button>
            <Button variant="outline" className="gap-2 p-2 hover:bg-primary/5 border-border/40">
              <Video className="h-5 w-5" />
              <span>Me at Zoo</span>
            </Button>
            <Button variant="outline" className="gap-2 p-2 hover:bg-primary/5 border-border/40">
              <Video className="h-5 w-5" />
              <span>TubeTalk</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
