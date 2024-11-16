import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/db/pocket_base.config';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { message } = await req.json();
    console.log('Received message:', message);
    const chatRoom = 'vagmmfqfaopx76v'; // Chat room ID
    const user = '9xslibrqch01ukr'; // User ID
    const chatbot = '1jm3823t2z663uf'; // Chatbot ID

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Store the user message in PocketBase
    const userMessageData = {
      chat_room: chatRoom,
      sender: user,
      message,
    };

    const userMessage = await pb.collection('chats').create(userMessageData);
    console.log('Stored user message:', userMessage);

    let question = encodeURIComponent(message)
    // Call the backend API at localhost:5000/chat with the user message
    const response = await fetch(`http://localhost:5000/chat?question=${question}`);

    if (!response.ok) {
      throw new Error(`Backend error: ${response.statusText}`);
    }

    const { message: chatbotMessage } = await response.json();

    // Store the chatbot's response in PocketBase
    const chatbotMessageData = {
      chat_room: chatRoom,
      sender: chatbot,
      message: chatbotMessage,
    };

    const aiResponse = await pb.collection('chats').create(chatbotMessageData);
    console.log('Stored chatbot response:', aiResponse);

    // Send the chatbot's response back to the caller
    return NextResponse.json({ message: chatbotMessage, sender: chatbot });

  } catch (error: any) {
    console.error('Error handling chat request:', error);

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

