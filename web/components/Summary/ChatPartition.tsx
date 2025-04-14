import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LogOut, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarFallback } from "@/components/ui/avatar";
import { useSummaryContext } from "./SummaryProvider";
import Markdown from 'react-markdown';
import pb from '@/lib/db/pocket_base.config';
import { useRouter } from 'next/navigation';


const USE_API = false;

// Define the interface for the API response
interface ChatResponse {
  answer: string;
}

// Define message type
interface Message {
  role: 'user' | 'ai';
  content: string;
}


// Generate a static response (for testing without API)
const getStaticResponse = (query: string): string => {
  const responses = [
    `This video discusses ${query} in detail.`,
    `The main topic related to ${query} appears around the middle of the video.`,
    `The video doesn't specifically mention ${query}, but covers related concepts.`,
    `I found several references to ${query} throughout thhttps://021c-106-194-240-111.ngrok-free.app/e video.`,
    `The creator explains ${query} with some helpful examples.`
  ];

  // Select a random response
  return responses[Math.floor(Math.random() * responses.length)];
};



export default function ChatPartition() {
  // Toggle this flag to switch between API and static responses

  const { videoId } = useSummaryContext(); // Get videoId from context
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: 'Hello! Ask a question about the current video.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if videoId is null
    if (!videoId) {
      setMessages(prev => [
        ...prev,
        { role: 'user', content: input.trim() },
        { role: 'ai', content: 'No video is currently selected. Please select a video first.' }
      ]);
      setInput('');
      return;
    }

    const userMessage = { role: 'user', content: input.trim() };

    // Add user message immediately
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    if (USE_API) {
      try {
        // Make API request with videoId from context
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/chat_with_video/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            video_id: videoId,
            query: input.trim()
          }),
        });

        if (!response.ok) {
          throw new Error('API request failed');
        }

        const data: ChatResponse = await response.json();

        // Add AI response
        setMessages(prev => [...prev, { role: 'ai', content: data.answer }]);
      } catch (error) {
        // Handle API error
        setMessages(prev => [
          ...prev,
          { role: 'ai', content: 'Sorry, there was an error processing your request. Please try again.' }
        ]);
        console.error('Error fetching from chat API:', error);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Use static responses instead of API
      setTimeout(() => {
        const staticResponse = getStaticResponse(input.trim());
        setMessages(prev => [...prev, { role: 'ai', content: staticResponse }]);
        setIsLoading(false);
      }, 500); // Add a small delay to simulate API call
    }
  };

  const handleLogout = () => {
    pb.authStore.clear(); // Clear the auth token and user data
    // The useEffect subscription will automatically update isLoggedIn state
    router.push("/"); // Redirect to home page after logout
    // Or redirect to login page: router.push('/auth/login');
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg border">
      <div className="border-b py-3 px-6 flex justify-between items-center">
        <h2 className="text-lg font-semibold">Video Chat Assistant</h2>
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={handleLogout} className="flex bg-background text-primary-foreground hover:bg-primary/90 py-2 px-3 sm:px-4 rounded-md items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
            >
              {message.role === 'ai' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={`
                  max-w-[80%] rounded-lg px-4 py-2
                  ${message.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-4'
                    : 'bg-muted mr-4'
                  }
                `}
              >
                <Markdown className="text-lg">{message.content}</Markdown>
              </div>
              {message.role === 'user' && (
                <Avatar className="w-8 h-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="border-t p-4 bg-background rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the video..."
            className="flex-1 px-3 h-12 text-lg"
            disabled={isLoading || (!videoId && USE_API)}
          />
          <Button type="submit" className="h-12 w-12" disabled={isLoading || (!videoId && USE_API)}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
