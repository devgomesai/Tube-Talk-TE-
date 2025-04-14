"use client"; // Required for hooks and client-side logic

import { Suspense, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import pb from '@/lib/db/pocket_base.config'; // Adjust the import path if needed
import SummarySectionWrapper from '@/components/Summary/SummarySectionWrapper';

// Optional: Create a dedicated Loading component for better UX
const LoadingIndicator = ({ message }: { message: string }) => (
  <div className="flex justify-center items-center h-screen">
    {/* You can replace this with a spinner or a more elaborate skeleton loader */}
    <p className="text-lg animate-pulse">{message}</p>
  </div>
);

export default function ProtectedSummaryPage() { // Renamed for clarity
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // Start in loading state
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Assume logged out until checked

  useEffect(() => {
    // Function to check auth status and update state/redirect
    const checkAuthStatus = () => {
      if (!pb.authStore.isValid) {
        console.log("User not authenticated, redirecting to login.");
        setIsLoggedIn(false);
        setIsLoading(false); // Stop loading check
        router.replace('/auth/login'); // Use replace to avoid adding the protected page to history
      } else {
        console.log("User is authenticated.");
        setIsLoggedIn(true);
        setIsLoading(false); // Stop loading check
      }
    };

    // Perform the initial check
    checkAuthStatus();

    // Subscribe to auth store changes. If the user logs out
    // while on this page, redirect them.
    const unsubscribe = pb.authStore.onChange(checkAuthStatus);

    // Cleanup: Unsubscribe when the component unmounts
    return () => {
      console.log("Unsubscribing from auth changes.");
      unsubscribe();
    };

    // router is a stable function according to Next.js docs,
    // but including it satisfies the exhaustive-deps lint rule if enabled.
  }, [router]);

  // 1. While checking authentication, show a loading indicator
  if (isLoading) {
    return <LoadingIndicator message="Verifying access..." />;
  }

  // 2. If loading is finished and user is logged in, show the page content
  if (isLoggedIn) {
    return (
      <Suspense fallback={<LoadingIndicator message="Loading summary..." />}>
        <SummarySectionWrapper />
      </Suspense>
    );
  }

  // 3. If loading is finished and user is not logged in,
  //    render null or a placeholder as redirection should be in progress.
  //    This state might briefly appear before the router navigates.
  return null; // Or <LoadingIndicator message="Redirecting to login..." />
}
