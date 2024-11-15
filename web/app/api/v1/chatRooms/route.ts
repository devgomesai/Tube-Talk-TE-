import { NextRequest, NextResponse } from 'next/server';
import pb from '@/lib/db/pocket_base.config';

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const { platform, id: video_id } = await req.json();
    if (!platform || !video_id) {
      return NextResponse.json(
        { error: 'Missing required fields: platform or id' },
        { status: 400 }
      );
    }

    const user = '9xslibrqch01ukr';

    // Check if the chat room already exists
    let existingChatRoom;
    try {
      existingChatRoom = await pb.collection('chat_rooms').getFirstListItem(
        `platform="${platform}" && video_id="${video_id}"`,
        { expand: '' }
      );
    } catch (error: any) {
      if (error.status !== 404) {
        // If the error is not a 404, rethrow it
        throw error;
      }
      // If 404, no existing chat room was found (this is expected)
      existingChatRoom = null;
    }

    let chatRoom;
    if (existingChatRoom) {
      // Fetch all chats associated with the existing chat room
      const chats = await pb.collection('chats').getFullList({
        filter: `chat_room="${existingChatRoom.id}"`,
        sort: 'created', // Optional: Sort by creation time
      });

      chatRoom = existingChatRoom;

      const response = NextResponse.json(
        {
          chatRoom,
          chats,
        },
        { status: 200 }
      );

      // Set the `active_chat` cookie
      response.headers.set(
        'Set-Cookie',
        `active_chat=${chatRoom.id}; Path=/; HttpOnly; SameSite=Strict;`
      );

      return response;
    }

    // Create a new chat room since no existing one was found
    const newChatRoomData = {
      user,
      platform,
      video_id,
      isPinned: false,
    };

    chatRoom = await pb.collection('chat_rooms').create(newChatRoomData);

    const response = NextResponse.json(
      {
        chatRoom,
        chats: [], // New chat room, so no chats yet
      },
      { status: 201 }
    );

    // Set the `active_chat` cookie
    response.headers.set(
      'Set-Cookie',
      `active_chat=${chatRoom.id}; Path=/; HttpOnly; SameSite=Strict;`
    );

    return response;
  } catch (error: any) {
    console.error('Error fetching or creating chat room:', error);

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

