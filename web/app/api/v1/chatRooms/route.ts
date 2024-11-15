// pages/api/chatRooms.ts
import pb from '@/lib/db/pocket_base.config';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure the user is logged in
    const user = pb.authStore.model;
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Fetch chat rooms where the user matches
    const chatRooms = await pb.collection('chat_rooms').getFullList({
      filter: `user = "${user.id}"`, // Adjust this field if needed
    });

    res.status(200).json(chatRooms);
  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error', error });
  }
}
