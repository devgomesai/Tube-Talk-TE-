import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function ChatPartition() {
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Hello! How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input.trim() }]);
    setInput('');

    // Simulate AI response (you'll replace this with actual AI integration)
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'ai',
        content: "This is a simulated AI response. You'll integrate actual AI responses here."
      }]);
    }, 1000);
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
          />
          <Button type="submit" className='h-12 w-12'>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
