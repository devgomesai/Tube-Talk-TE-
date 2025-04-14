'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSummaryContext } from "./SummaryProvider";
import pb from '@/lib/db/pocket_base.config'; // <-- 1. Import PocketBase instance

const USE_API = false; // Keep your flag for fetching quiz data

const staticQuiz = [
  {
    question: "What is the key feature highlighted regarding the DJI RS 4 Mini's stabilization?",
    options: [
      "It uses a second-generation stabilization algorithm.",
      "It features improved auto-axis locks for quicker setup.",
      "It has a significantly reduced payload capacity compared to previous models.",
      "It utilizes a completely new type of motor technology."
    ],
    answer: "It features improved auto-axis locks for quicker setup."
  },
  {
    question: "What is the maximum payload capacity of the DJI RS 4 Mini?",
    options: [
      "1 kg",
      "1.5 kg",
      "2 kg",
      "2.5 kg"
    ],
    answer: "2 kg"
  }
];

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function QuizDialog({ open, onOpenChange }: QuizDialogProps) {
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  // const [finalScore, setFinalScore] = useState(0); // <-- 2. Removed finalScore state
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { videoId } = useSummaryContext();

  // --- Fetch Quiz Logic (keep as is) ---
  const fetchQuiz = async () => {
    // ... (your existing fetchQuiz logic remains unchanged)
    if (!videoId) return;
    setIsLoading(true);
    try {
      // Simulating API call or using static data based on USE_API
      if (USE_API) {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_LINK}/generate_quiz/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ video_id: videoId }),
        });
        if (!response.ok) throw new Error("Failed to fetch quiz");
        const data = await response.json();
        const transformedQuiz = data.quiz.quiz.map((q: any) => {
          const options = q.options.map((opt: string) => opt.substring(3).trim());
          const answerIndex = q.answer.charCodeAt(0) - 65;
          const answer = options[answerIndex];
          return { question: q.question, options: options, answer: answer };
        });
        setQuiz(transformedQuiz);
      } else {
        setQuiz(staticQuiz); // Use static data if API is off
      }
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuiz(staticQuiz); // Fallback to static quiz on error
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. Function to Save Quiz Result ---
  const saveQuizResult = async (finalScoreValue: number) => {
    if (!pb.authStore.isValid) {
      console.log("User not logged in. Quiz result not saved.");
      return; // Don't save if user isn't logged in
    }
    if (!videoId) {
      console.error("Video ID is missing. Cannot save quiz result.");
      return; // Don't save if videoId is missing
    }

    const userId = pb.authStore.model?.id;

    if (!userId) {
      console.error("Could not retrieve User ID. Cannot save quiz result.");
      return; // Don't save if userId is missing
    }

    const data = {
      user: userId,
      score: finalScoreValue,
      videoId: videoId,
    };

    console.log("Attempting to save quiz result:", data);

    try {
      const record = await pb.collection('quiz_results').create(data);
      console.log("Quiz result saved successfully:", record);
    } catch (error) {
      console.error("Failed to save quiz result to PocketBase:", error);
      // Optional: Show a user-facing error message here (e.g., using a toast notification)
    }
  };


  // --- 4. Modified handleSubmit ---
  const handleSubmit = (value: string) => {
    if (isAnswered) return;

    const isCorrect = value === quiz[currentQuestion]?.answer;

    // Calculate the score *after* this answer
    const newScore = score + (isCorrect ? 1 : 0);
    setScore(newScore); // Update score state for display

    setSelectedAnswer(value);
    setIsAnswered(true); // Lock options

    // Check if it's the last question *before* the timeout
    const isLastQuestion = currentQuestion === quiz.length - 1;

    // If it's the last question, initiate saving the result immediately
    if (isLastQuestion) {
      console.log(`Quiz finished. Final Score: ${newScore}. Saving result...`);
      saveQuizResult(newScore); // Call save function with the final score
    }

    // Delay moving to next question or showing completion screen
    setTimeout(() => {
      if (!isLastQuestion) {
        // Move to next question
        setCurrentQuestion((prev) => prev + 1);
        setSelectedAnswer('');
        setIsAnswered(false);
      } else {
        // Mark quiz as completed (UI change)
        setQuizCompleted(true);
      }
    }, 1500); // Keep the delay for user feedback
  };

  // --- 6. Modified handleRetakeQuiz ---
  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    // setFinalScore(0); // Removed
    setQuizCompleted(false);
    setSelectedAnswer('');
    setIsAnswered(false);

    // Refetch or reset quiz questions
    setIsLoading(true); // Show loading indicator while resetting/fetching
    if (USE_API) {
      fetchQuiz();
    } else {
      setQuiz(staticQuiz);
      setIsLoading(false);
    }
  };

  // --- useEffect hook (reset state when dialog opens) ---
  useEffect(() => {
    if (open) {
      // Reset all relevant states when the dialog opens
      setCurrentQuestion(0);
      setScore(0);
      // setFinalScore(0); // Removed
      setQuizCompleted(false);
      setSelectedAnswer('');
      setIsAnswered(false);
      setIsLoading(true); // Set loading true initially

      // Fetch or set quiz data
      if (USE_API && videoId) { // Ensure videoId exists before fetching
        fetchQuiz();
      } else if (!USE_API) {
        setQuiz(staticQuiz);
        setIsLoading(false);
      } else {
        // Handle case where API is used but videoId is missing initially
        console.warn("Video ID not available yet for fetching quiz.");
        // Optionally set quiz to empty or static, and set loading false
        setQuiz([]); // Or staticQuiz
        setIsLoading(false);
      }
    }
  }, [open, videoId]); // Rerun effect if dialog opens or videoId changes

  const progress = quiz.length > 0 ? ((currentQuestion + 1) / quiz.length) * 100 : 0;

  // --- JSX Structure ---
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quiz Challenge</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          // Loading State
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-medium">Loading quiz questions...</p>
          </div>
        ) : quiz.length > 0 && !quizCompleted ? (
          // Quiz In Progress
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Question {currentQuestion + 1} of {quiz.length}</span>
              <span>Score: {score}</span> {/* Show current score */}
            </div>
            <Progress value={progress} className="h-2" />
            <h2 className="text-xl font-bold">{quiz[currentQuestion]?.question}</h2>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={(value) => {
                // Update selection visually even if answered, but only submit once
                setSelectedAnswer(value);
                if (!isAnswered) handleSubmit(value); // Submit only if not already answered
              }}
            >
              {quiz[currentQuestion]?.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem
                    value={option}
                    id={`option-${index}`}
                    disabled={isAnswered} // Disable radio buttons after answering
                  />
                  <Label
                    htmlFor={`option-${index}`}
                    className={
                      isAnswered // Apply styles only after answering
                        ? option === quiz[currentQuestion]?.answer // Correct answer
                          ? "text-green-500 font-semibold cursor-default"
                          : option === selectedAnswer // Incorrect selected answer
                            ? "text-red-500 line-through cursor-default"
                            : "text-muted-foreground cursor-default" // Other incorrect options
                        : "cursor-pointer" // Default style before answering
                    }
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {/* Optionally hide submit button if selection directly triggers handleSubmit */}
            {/* {!isAnswered && (
              <Button onClick={() => handleSubmit(selectedAnswer)} disabled={!selectedAnswer}>
                Submit Answer
              </Button>
            )} */}
          </div>
        ) : quiz.length > 0 ? (
          // Quiz Completed Screen -- 5. Updated to show score
          <div className="text-center py-6">
            <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold">Quiz Completed!</h2>
            <p className="text-xl mt-2">
              Your Score: {score} out of {quiz.length}
            </p>
            <Button onClick={handleRetakeQuiz} className="mt-6">
              Retake Quiz
            </Button>
          </div>
        ) : (
          // Error/No Quiz Loaded State
          <div className="text-center py-6">
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Failed to load quiz</AlertTitle>
              <AlertDescription>
                Unable to load quiz questions. Please check your connection or try again later.
              </AlertDescription>
            </Alert>
            <Button onClick={handleRetakeQuiz} className="mt-4">
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
