import {
  INVALID_PARAMS,
  INVALID_PLATFORM,
  INVALID_PLATFORM_VIDEO,
  INVALID_VIDEO_ID,
  UNSUPPORTED_URL
} from '@/lib/constants/errors';
import platformMap from '@/lib/data/platform_map';
import { type NextRequest } from 'next/server';

// Define types for API response
interface SuccessResponse {
  platform: string;
  videoId: string;
}

interface ErrorResponse {
  error: string;
}

// Helper functions
const createResponse = (data: SuccessResponse | ErrorResponse, status: number) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60', // Add caching headers
    },
  });
};

const validatePlatformAndId = (platform: string, videoId: string) => {
  const platformDetails = platformMap[platform.toLowerCase()];
  if (!platformDetails) {
    return createResponse({ error: INVALID_PLATFORM }, 400);
  }

  const dummyUrl = `https://${platform}.com/watch?v=${videoId}`;
  if (!platformDetails.regex.test(dummyUrl)) {
    return createResponse({ error: INVALID_VIDEO_ID }, 400);
  }

  return null;
};

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get('url')?.trim();
    const platform = searchParams.get('platform')?.trim()?.toLowerCase();
    const videoId = searchParams.get('id')?.trim();

    // Validate input combinations
    if (url && (platform || videoId)) {
      return createResponse({ error: INVALID_PARAMS }, 400);
    }

    if (!url && (!platform || !videoId)) {
      return createResponse({ error: INVALID_PARAMS }, 400);
    }

    // Case 1: URL provided
    if (url) {
      for (const [platformName, platformDetails] of Object.entries(platformMap)) {
        const extractedId = platformDetails.extractId(url);
        if (!extractedId) continue;

        try {
          const isValid = await platformDetails.isValidUrl(url);
          if (!isValid) continue;

          return createResponse({
            platform: platformName,
            videoId: extractedId,
          }, 200);
        } catch (error) {
          continue; // Try next platform if current one fails
        }
      }
      return createResponse({ error: UNSUPPORTED_URL }, 400);
    }

    // Case 2: Platform and Video ID provided
    if (platform && videoId) {
      const validationError = validatePlatformAndId(platform, videoId);
      if (validationError) return validationError;

      const platformDetails = platformMap[platform];
      try {
        const dummyUrl = platformDetails.constructUrl(videoId);
        const isValid = await platformDetails.isValidUrl(dummyUrl);

        if (!isValid) {
          return createResponse({ error: INVALID_PLATFORM_VIDEO }, 400);
        }

        return createResponse({
          platform,
          videoId,
        }, 200);
      } catch (error) {
        return createResponse({ error: INVALID_PLATFORM_VIDEO }, 400);
      }
    }

    return createResponse({ error: INVALID_PARAMS }, 400);
  } catch (error) {
    console.error('Video platform API error:', error);
    return createResponse({
      error: 'Internal server error'
    }, 500);
  }
}
