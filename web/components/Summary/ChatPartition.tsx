import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSummaryContext } from './SummaryProvider';

const FASTAPI_BASE_URL = 'http://localhost:8000';

export default function ChatPartition() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [videoProcessStatus, setVideoProcessStatus] = useState('initial'); // 'initial', 'processing', 'processed', 'error'
  const { platform, videoId } = useSummaryContext();

  const youtubeVideoUrl = `https://www.youtube.com/watch?v=${videoId}`; // Construct YouTube URL
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const processVideoAndInitializeChat = async () => {
      setVideoProcessStatus('processing');
      try {
        // 1. Process Video Route Call
        const processVideoResponse = await fetch('http://localhost:8000/process_video/', { // Call FastAPI process_video route
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Form data
          body: `video_url=${encodeURIComponent(youtubeVideoUrl)}`, // Send video URL as form data
        });

        if (!processVideoResponse.ok) {
          const errorData = await processVideoResponse.json();
          console.error('Failed to process video:', errorData.detail || 'Unknown error');
          setVideoProcessStatus('error');
          return; // Stop initialization if video processing fails
        }

        setVideoProcessStatus('processed');
        const processVideoData = await processVideoResponse.json();
        const processedVideoId = processVideoData.video_id; // Get video_id from processed response


        // 2. Initialize Chat Room (if needed - you might not need this step anymore depending on your backend logic)
        // If you still need to initialize chat room separately, you would do it here,
        // possibly passing the processedVideoId to your chat room API.
        // For now, I'm commenting this out as it might not be necessary based on your backend.
        /*
        const initializeChatRoom = async () => {
          const response = await fetch('/api/v1/chatRooms', { // Adjust this if still needed
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ platform, id: processedVideoId }), // Use processedVideoId
          });
          const data = await response.json();
          if (response.ok) {
            setChatRoomId(data.chatRoom.id); // If you still use chatRoomId
            setMessages(data.chats.map(chat => ({ // If you still fetch initial chats this way
              role: chat.sender === '1jm3823t2z663uf' ? 'ai' : 'user',
              content: chat.message,
            })));
          } else {
            console.error('Failed to initialize chat room:', data.error);
          }
        };
        await initializeChatRoom();
        */

      } catch (error) {
        console.error('Error during video processing or chat initialization:', error);
        setVideoProcessStatus('error');
      }
    };

    processVideoAndInitializeChat();
  }, [youtubeVideoUrl, platform, videoId]); // Depend on youtubeVideoUrl and platform, videoId

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');

    try {
      // Call FastAPI chat_with_video route
      const chatResponse = await fetch('http://localhost:8000/chat_with_video/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, // Form data
        body: `video_id=${encodeURIComponent(videoId)}&query=${encodeURIComponent(userMessage)}`, // Send video_id and query as form data
      });
      console.log(chatResponse)
      if (!chatResponse.ok) {
        const errorData = await chatResponse.json();
        throw new Error(errorData.detail || 'Failed to get AI response');
      }

      const data = await chatResponse.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.answer }]); // Display AI answer

    } catch (error: any) { // Use : any for error for simplicity in this example
      console.error('Error sending message to chat API:', error.message);
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again later." }]); // User-friendly error message
    }
  };

  return (
    <div className="flex flex-col h-full bg-background rounded-lg">
      {/* Chat Header */}
      <div className="border-b py-3 px-6">
        <h2 className="text-lg font-semibold">Chat Assistant</h2>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {videoProcessStatus === 'processing' && (
            <div className="text-center text-sm text-muted-foreground">
              Processing video... please wait.
            </div>
          )}
          {videoProcessStatus === 'error' && (
            <div className="text-center text-sm text-red-500">
              Failed to process video. Please try again or use a different video.
            </div>
          )}
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
                <p className="text-sm">{message.content}</p>
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

      {/* Input Area */}
      <div className="border-t p-4 bg-background rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3 h-12"
            disabled={videoProcessStatus !== 'processed'} // Disable input until video is processed
          />
          <Button type="submit" className='h-12 w-12' disabled={videoProcessStatus !== 'processed'}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}