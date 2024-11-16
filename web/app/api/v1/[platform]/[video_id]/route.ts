import pb from '@/lib/db/pocket_base.config';
import { NextResponse } from 'next/server';

const PYTHON_BACKEND_SUMMARY_URL = 'http://localhost:5000/summary';
const PYTHON_BACKEND_TRANSCRIPT_URL = 'http://localhost:5000/transcript';

export async function GET(
  request: Request,
  { params }: { params: { platform: string; video_id: string } }
) {
  const { platform, video_id } = params;

  if (!platform || !video_id) {
    return NextResponse.json(
      {
        summary: null,
        error: 'Platform and video ID are required.',
      },
      { status: 400 }
    );
  }

  try {
    // Check if summary exists in PocketBase
    const existingSummary = await pb.collection('summaries').getFirstListItem(
      `platform_name="${platform}" && video_id="${video_id}"`,
      { expand: '' }
    );

    if (existingSummary) {
      return NextResponse.json(
        {
          summary: existingSummary,
          error: null,
        },
        { status: 200 }
      );
    }
  } catch (error: any) {
    // Handle PocketBase fetch errors
    if (error.status !== 404) {
      console.error('Error fetching data from PocketBase:', error.message);
      return NextResponse.json(
        {
          summary: null,
          error: 'Error fetching data from PocketBase.',
        },
        { status: 500 }
      );
    }
  }

  // If no summary in PocketBase, request transcript from Python backend
  try {
    const video_url = `https://www.youtube.com/watch?v=${video_id}`;
    const response = await fetch(PYTHON_BACKEND_TRANSCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: video_url }),
    });

    if (!response.ok) {
      throw new Error(`Python backend returned an error: ${response.statusText}`);
    }
    // Generated Transcrit
    // Now generate the summary
    const response2 = await fetch(PYTHON_BACKEND_SUMMARY_URL);
    const summaryData = await response2.json();

    if (!summaryData.summary) {
      throw new Error('Python backend returned an empty summary.');
    }

    return NextResponse.json(
      {
        summary: summaryData.summary,
        error: null,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error generating transcript from backend:', error.message);
    return NextResponse.json(
      {
        summary: null,
        error: error.message || 'Error generating transcript from backend.',
      },
      { status: 500 }
    );
  }
}

