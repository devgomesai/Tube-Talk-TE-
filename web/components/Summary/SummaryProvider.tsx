// context/SummaryContext.tsx
import { createContext, useContext, ReactNode } from 'react';

interface SummaryContextProps {
  platform: string | null;
  videoId: string | null;
}

const SummaryContext = createContext<SummaryContextProps | undefined>(undefined);

export function useSummaryContext() {
  const context = useContext(SummaryContext);
  if (!context) {
    throw new Error('useSummaryContext must be used within a SummaryProvider');
  }
  return context;
};

interface SummaryProviderProps {
  children: ReactNode;
  platform: string | null;
  videoId: string | null;
}

const SummaryProvider = ({ children, platform, videoId }: SummaryProviderProps) => (
  <SummaryContext.Provider value={{ platform, videoId }}>
    {children}
  </SummaryContext.Provider>
);

export default SummaryProvider;
