import { PlatformMap } from "../types";

const platformMap: PlatformMap = {
  youtube: {
    regex: /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?|watch)(?:[^\w\d-]|\/|\?v=)|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i,
    constructUrl: (videoId: string): string => {
      return `https://www.youtube.com/watch?v=${videoId}`;
    },
    extractId: (url: string): string | null => {
      const match = url.match(platformMap.youtube.regex);
      return match ? match[1] : null;
    },
    isValidUrl: async (url: string): Promise<boolean> => {
      try {
        const videoId = platformMap.youtube.extractId(url);
        if (!videoId) return false;

        const response = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${videoId}`, {
          method: 'HEAD'
        });

        return response.status === 200;
      } catch (error) {
        return false;
      }
    },
  }
}

// Export statements if needed
export default platformMap;
