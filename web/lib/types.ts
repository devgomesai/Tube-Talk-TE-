type PlatformMap = {
  [platform: string]: {
    regex: RegExp; // Regex to match the URL and check if it belongs to supported platforms
    isValidUrl: (url: string) => Promise<boolean>; // Function to check if the url exists
    extractId: (url: string) => string | null; // Function to extract the video ID from the URL
    constructUrl: (videoId: string) => string; // Function to construct the URL for the video from video Id
  }
};


type ChatItemType = {
  title: string,
  url: string,
  emoji?: string
}

type UserDetails = {
  name: string,
  email: string,
  avatar: string,
}

type SummaryNavigation = {
  user: UserDetails,
  pins?: ChatItemType[],
  history: ChatItemType[],
  configs?: any[],
}

export type {
  PlatformMap,
  SummaryNavigation,
  ChatItemType,
  UserDetails,
}
