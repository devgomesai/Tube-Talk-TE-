"use client";

import { useSearchParams } from "next/navigation";
import Summary from "@/components/Summary";
import SummaryProvider from "@/components/Summary/SummaryProvider";

enum Params {
  platform = "platform",
  id = "id"
}

export default function SummarySectionWrapper() {
  const searchParams = useSearchParams();
  const platform = searchParams.get(Params.platform);
  const videoId = searchParams.get(Params.id);

  if (platform && videoId) {
    return (
      <SummaryProvider platform={platform} videoId={videoId}>
        <Summary />
      </SummaryProvider>
    );
  } else {
    return <div>Error: 'id' cannot be passed without 'platform'.</div>;
  }
}
