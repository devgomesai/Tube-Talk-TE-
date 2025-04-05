import { Suspense } from "react";
import SummarySectionWrapper from "@/components/Summary/SummarySectionWrapper";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading summary...</div>}>
      <SummarySectionWrapper />
    </Suspense>
  );
}

