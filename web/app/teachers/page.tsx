"use client";

import React, { useState, useEffect } from "react";
import pb from "@/lib/db/pocket_base.config";
import { RecordModel } from "pocketbase";
import { useRouter } from 'next/navigation'; // Import useRouter for redirection

// Shadcn components
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Download,
  AlertCircle,
  Search,
  Youtube,
  FileQuestion,
  UserRound,
  ShieldOff, // Icon for access denied
  LogOut,
  ChevronLeft
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

// Define the structure of the fetched and expanded quiz result
interface ExpandedQuizResult extends RecordModel {
  score: number;
  videoId: string;
  user: string;
  created: string;
  expand?: {
    user?: {
      id: string;
      email: string;
      role: string; // Add role to user expansion
    };
  };
}

// Define the structure for the API response from /api/v1/link
interface LinkApiResponse {
  platform?: string;
  videoId?: string;
  error?: string;
}

export default function QuizResultsPage() {
  const [inputValue, setInputValue] = useState<string>("");
  const [searchedVideoId, setSearchedVideoId] = useState<string | null>(null);
  const [results, setResults] = useState<ExpandedQuizResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [isTeacher, setIsTeacher] = useState<boolean>(false);
  const [authCheckLoading, setAuthCheckLoading] = useState<boolean>(true);

  const router = useRouter(); // Initialize useRouter

  useEffect(() => {
    // Function to check user authentication and role
    const checkAuthAndRole = async () => {
      try {
        // Check if user is logged in
        if (pb.authStore.isValid) {
          // Fetch the full auth record to get the role
          const user = await pb.collection('users').getOne(pb.authStore.model!.id);
          if (user && user.role === 'teacher') {
            setIsTeacher(true);
          } else {
            setIsTeacher(false);
            // Optionally redirect if not a teacher
            // router.push('/'); // Redirect to home page
          }
        } else {
          setIsTeacher(false);
          // Optionally redirect if not logged in
          // router.push('/'); // Redirect to home page
        }
      } catch (e) {
        console.error("Error checking auth or role:", e);
        setIsTeacher(false);
        // Handle error, maybe redirect or show a message
      } finally {
        setAuthCheckLoading(false);
      }
    };

    checkAuthAndRole();

    // Listen for auth changes (optional, for dynamic updates)
    // pb.authStore.onChange(() => {
    //  checkAuthAndRole();
    // }, true); // true to run immediately

    // Clean up listener (optional)
    // return () => {
    //  pb.authStore.unsubscribe('auth');
    // };

  }, []); // Empty dependency array ensures this runs only once on mount

  const isUrl = (input: string): boolean => {
    return input.startsWith("http://") || input.startsWith("https://");
  };

  const handleLogout = () => {
    pb.authStore.clear(); // Clear the auth token and user data
    // The useEffect subscription will automatically update isLoggedIn state
    router.push("/"); // Redirect to home page after logout
    // Or redirect to login page: router.push('/auth/login');
  };

  const handleSearch = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput) {
      setError("Please enter a Video ID or YouTube URL.");
      setResults([]);
      setSearchPerformed(true);
      setSearchedVideoId(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setSearchPerformed(true);
    setSearchedVideoId(null);

    let videoIdToSearch: string | null = null;

    try {
      if (isUrl(trimmedInput)) {
        console.log("Input is a URL, calling API:", trimmedInput);
        try {
          const response = await fetch(`/api/v1/link?url=${encodeURIComponent(trimmedInput)}`);
          const data: LinkApiResponse = await response.json();

          if (!response.ok || data.error) {
            throw new Error(data.error || `Failed to process URL (status: ${response.status})`);
          }

          if (data.platform?.toLowerCase() === 'youtube' && data.videoId) {
            videoIdToSearch = data.videoId;
            console.log("Extracted YouTube Video ID:", videoIdToSearch);
          } else {
            throw new Error("The provided URL is not a valid or supported YouTube video link.");
          }
        } catch (apiError: any) {
          console.error("API call failed:", apiError);
          setError(`Error processing URL: ${apiError.message}`);
          setIsLoading(false);
          return;
        }
      } else {
        console.log("Input is assumed to be a Video ID:", trimmedInput);
        videoIdToSearch = trimmedInput;
      }

      if (!videoIdToSearch) {
        setError("Could not determine a valid Video ID to search for.");
        setIsLoading(false);
        return;
      }

      setSearchedVideoId(videoIdToSearch);

      const date24HoursAgo = new Date();
      date24HoursAgo.setDate(date24HoursAgo.getDate() - 1);
      const formattedDate = date24HoursAgo.toISOString().slice(0, 19).replace('T', ' ');

      console.log(`Searching PocketBase for videoId: "${videoIdToSearch}" created after: "${formattedDate}"`);

      const filter = `videoId = "${videoIdToSearch}" && created >= "${formattedDate}"`;

      const records = await pb.collection('quiz_results').getFullList<ExpandedQuizResult>({
        filter: filter,
        sort: '-created',
        expand: 'user',
      });

      console.log("Fetched records:", records);
      setResults(records);

    } catch (err: any) {
      console.error("Error fetching quiz results from PocketBase:", err);
      setError(err.message || "Failed to fetch quiz results. Please check the Video ID/URL and try again.");
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCsv = () => {
    const filenameBase = searchedVideoId || inputValue.trim().replace(/[^a-z0-9]/gi, '_') || 'quiz_results';
    if (results.length === 0) return;

    const headers = ["Email", "Score", "Timestamp"];
    const csvRows = [headers.join(",")];

    results.forEach(result => {
      const email = result.expand?.user?.email ?? "N/A";
      const score = result.score ?? "N/A";
      const timestamp = result.created ? new Date(result.created).toLocaleString() : "N/A";

      const escapeCsvCell = (cell: string | number) => `"${String(cell).replace(/"/g, '""')}"`;

      csvRows.push([
        escapeCsvCell(email),
        escapeCsvCell(score),
        escapeCsvCell(timestamp)
      ].join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    const today = new Date();
    const dateSuffix = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const filename = `${filenameBase}_results_${dateSuffix}.csv`;

    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate summary stats
  const totalStudents = results.length;
  const averageScore = totalStudents > 0
    ? (results.reduce((sum, result) => sum + result.score, 0) / totalStudents).toFixed(1)
    : "0";

  // Correct median calculation
  const medianScore = totalStudents > 0
    ? (() => {
      const sortedScores = results.map(r => r.score).sort((a, b) => a - b);
      const middle = Math.floor(sortedScores.length / 2);
      return sortedScores.length % 2 !== 0
        ? sortedScores[middle].toFixed(1)
        : ((sortedScores[middle - 1] + sortedScores[middle]) / 2).toFixed(1);
    })()
    : "0";

  // Correct mode calculation
  const modeScore = totalStudents > 0
    ? (() => {
      const frequency: Record<number, number> = {};
      let maxFrequency = 0;
      let modes: number[] = [];

      results.forEach(result => {
        frequency[result.score] = (frequency[result.score] || 0) + 1;
        if (frequency[result.score] > maxFrequency) {
          maxFrequency = frequency[result.score];
          modes = [result.score];
        } else if (frequency[result.score] === maxFrequency) {
          modes.push(result.score);
        }
      });

      // Return the first mode if multiple exist
      return modes.length > 0 ? modes[0].toFixed(1) : "N/A";
    })()
    : "0";

  if (authCheckLoading) {
    // Show a loading indicator while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex items-center text-muted-foreground">
          <Loader2 className="mr-2 h-6 w-6 animate-spin" />
          Checking access...
        </div>
      </div>
    );
  }

  if (!isTeacher) {
    // Show access denied message if not a teacher
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Alert variant="destructive" className="max-w-md w-full">
          <ShieldOff className="h-5 w-5 mr-3" /> {/* Changed icon */}
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have the required permissions to view this page. Only users with the 'teacher' role can access quiz results.
          </AlertDescription>
          {/* Optional: Add a button to redirect to home */}
          {/* <div className="mt-4">
            <Button onClick={() => router.push('/')}>Go to Home</Button>
          </div> */}
        </Alert>
      </div>
    );
  }

  // Render the page content if the user is a teacher
  return (
    <div className="min-h-screen container mx-auto flex-1 p-4 md:p-6 lg:p-8 flex flex-col">
      <Card className="w-full mb-6 shadow-sm">
        <CardHeader className="pb-4 flex flex-row justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Button className="bg-background border hover:bg-muted"
                onClick={() => router.push('/')}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Youtube className="h-5 w-5 text-primary" />
              <CardTitle>YouTube Quiz Results</CardTitle>
            </div>
            <CardDescription>
              Enter a YouTube Video URL or Video ID to find quiz results submitted within the last 24 hours.
            </CardDescription>
          </div>
          <Button variant="outline" onClick={handleLogout} className="flex bg-background hover:bg-primary/90 py-2 px-3 sm:px-4 rounded-md items-center gap-1 sm:gap-2 text-sm sm:text-base">
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow space-y-2">
              <Label htmlFor="videoIdentifier" className="text-sm font-medium">
                YouTube URL or Video ID
              </Label>
              <div className="relative">
                <Input
                  id="videoIdentifier"
                  type="text"
                  className="pl-10"
                  placeholder="e.g., https://www.youtube.com/watch?v=... or dQw4w9WgXcQ"
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (error) setError(null);
                  }}
                  disabled={isLoading}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading || !inputValue.trim()}
              className="h-10 mt-auto"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </>
              ) : (
                "Search Results"
              )}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4 mr-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {searchPerformed && !isLoading && (
        <div className="space-y-6 flex-1">
          {searchedVideoId && (
            <div className="flex items-center justify-around bg-card rounded-lg p-4 shadow-sm">

              <div className="flex gap-4">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Students</p>
                  <p className="text-2xl font-bold">{totalStudents}</p>
                </div>
              </div>

              {totalStudents > 0 && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Average Score</p>
                  <p className="text-2xl font-bold">{averageScore}</p>
                </div>
              )}

              {totalStudents > 0 && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Median Score</p>
                  <p className="text-2xl font-bold">{medianScore}</p>
                </div>
              )}

              {totalStudents > 0 && (
                <div className="text-center">
                  <p className="text-muted-foreground text-sm">Mode Score</p>
                  <p className="text-2xl font-bold">{modeScore}</p>
                </div>
              )}
            </div>
          )}


          {results.length > 0 ? (
            <Card className="shadow-sm flex-1">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <UserRound className="h-5 w-5 text-primary" />
                    Student Results
                  </CardTitle>
                  <Button
                    onClick={handleDownloadCsv}
                    variant="outline"
                    size="sm"
                    className="h-9"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-1/2 font-bold">Student Email</TableHead>
                        <TableHead className="text-right font-bold">Score</TableHead>
                        <TableHead className="font-bold">Submitted At</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map((result, index) => ( // Added index here
                        <TableRow
                          key={result.id}
                          className={`hover:bg-muted/50 ${index % 2 !== 0 ? 'bg-muted/20' : ''}`} // Conditional background class
                        >
                          <TableCell className="font-medium">
                            {result.expand?.user?.email ?? (
                              <span className="text-xs text-muted-foreground">User data unavailable</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge
                              className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                              {result.score}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{new Date(result.created).toLocaleString()}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            !error && (
              <div className="bg-card rounded-lg p-8 text-center shadow-sm flex-1 flex flex-col items-center justify-center">
                <div className="bg-primary/10 text-primary p-4 rounded-full mb-4">
                  <Search className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
                <p className="text-muted-foreground max-w-md">
                  No quiz results found for this Video ID/URL in the last 24 hours.
                  Try another video or check back later.
                </p>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
