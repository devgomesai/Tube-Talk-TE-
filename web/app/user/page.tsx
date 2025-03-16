"use client";

import Dashboard from '@/components/Dashboard';
import Summary from '@/components/Summary';
import SummaryProvider from '@/components/Summary/SummaryProvider';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

enum Params {
  platform = "platform",
  id = "id"
}

export default function Page() {
  const searchParams = useSearchParams();
  const platform = searchParams.get(Params.platform);
  const videoId = searchParams.get(Params.id);
  console.log(platform, videoId);

  // Logic to render components based on the query parameters
  if (!platform && !videoId) {
    return <Dashboard />; // Render Component1 if no queries are passed
  } else if (platform && videoId) {
    return (
      <SummaryProvider platform={platform} videoId={videoId}>
        <Summary />
      </SummaryProvider>
    )
  } else {
    // Ensure 'id' is never passed without 'platform'
    return <div>Error: 'id' cannot be passed without 'platform'.</div>;
  }

  return null; // Fallback, in case the conditions above don't match
}

