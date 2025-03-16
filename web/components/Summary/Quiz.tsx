'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { useSummaryContext } from "./SummaryProvider";

const USE_API = true;

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
  },
  {
    question: "Which new shooting mode is introduced in the DJI RS 4 Mini, offering instant motor response to hand movements?",
    options: [
      "Dolly Zoom only",
      "Smooth Follow only",
      "Responsive Mode",
      "Timelapse Mode"
    ],
    answer: "Responsive Mode"
  },
  {
    question: "The RS 4 Mini includes a new module for automated tracking. How can this module be triggered?",
    options: [
      "Only via the DJI app.",
      "Only via the joystick.",
      "Via gestures from the subject or a trigger button.",
      "It is always active and automatically tracks the subject."
    ],
    answer: "Via gestures from the subject or a trigger button."
  },
  {
    question: "Besides improved stabilization and new shooting modes, what other significant improvement does the RS 4 Mini offer compared to previous mini-series models?",
    options: [
      "A significantly larger payload capacity.",
      "A built-in microphone for improved audio recording.",
      "A substantial increase in battery life and charging speed.",
      "The ability to record in 8K resolution."
    ],
    answer: "A substantial increase in battery life and charging speed."
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
  const [finalScore, setFinalScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const { videoId } = useSummaryContext();

  const fetchQuiz = async () => {
    if (!videoId) return;
    try {
      const response = await fetch("http://localhost:8000/generate_quiz/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ video_id: videoId }),
      });

      if (!response.ok) throw new Error("Failed to fetch quiz");

      const data = await response.json();

      // Transform the API response format to match our internal format
      const transformedQuiz = data.quiz.quiz.map((q: any) => {
        // Strip the letter prefix (A., B., etc.) from options
        const options = q.options.map((opt: string) => opt.substring(3).trim());

        // Get the correct answer letter and map it to the actual answer text
        const answerLetter = q.answer;
        const answerIndex = answerLetter.charCodeAt(0) - 65; // Convert A to 0, B to 1, etc.
        const answer = options[answerIndex];

        return {
          question: q.question,
          options: options,
          answer: answer
        };
      });

      setQuiz(transformedQuiz);
      setCurrentQuestion(0);
      setScore(0);
      setFinalScore(0);
      setQuizCompleted(false);
      setSelectedAnswer('');
      setIsAnswered(false);
    } catch (error) {
      console.error("Error fetching quiz:", error);
      setQuiz(staticQuiz);
    }
  };

  const handleSubmit = () => {
    const isCorrect = selectedAnswer === quiz[currentQuestion]?.answer;
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
    setIsAnswered(true);

    setTimeout(() => {
      if (currentQuestion < quiz.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setIsAnswered(false);
      } else {
        // Store the final score before completing the quiz
        const newScore = isCorrect ? score + 1 : score;
        setFinalScore(newScore);
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestion(0);
    setScore(0);
    setFinalScore(0);
    setQuizCompleted(false);
    setSelectedAnswer('');
    setIsAnswered(false);

    if (USE_API) {
      fetchQuiz();
    } else {
      setQuiz(staticQuiz);
    }
  };

  useEffect(() => {
    if (open) {
      setCurrentQuestion(0);
      setScore(0);
      setFinalScore(0);
      setQuizCompleted(false);
      setSelectedAnswer('');
      setIsAnswered(false);

      if (USE_API) {
        fetchQuiz();
      } else {
        setQuiz(staticQuiz);
      }
    }
  }, [open, videoId]);

  const progress = quiz.length > 0 ? ((currentQuestion + 1) / quiz.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Quiz Challenge</DialogTitle>
        </DialogHeader>

        {quiz.length > 0 && !quizCompleted ? (
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentQuestion + 1} of {quiz.length}</span>
              <span>Score: {score}</span>
            </div>
            <Progress value={progress} className="h-2" />
            <h2 className="text-xl font-bold">{quiz[currentQuestion]?.question}</h2>
            <RadioGroup
              value={selectedAnswer}
              onValueChange={(value) => {
                setSelectedAnswer(value);
                if (!isAnswered) {
                  handleSubmit();
                }
              }}
            >
              {quiz[currentQuestion]?.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                  <Label htmlFor={`option-${index}`} className={
                    isAnswered
                      ? option === quiz[currentQuestion]?.answer
                        ? "text-green-500 dark:text-green-400"
                        : option === selectedAnswer
                          ? "text-red-500 dark:text-red-400"
                          : ""
                      : ""
                  }>
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {isAnswered && (
              <Alert variant={selectedAnswer === quiz[currentQuestion]?.answer ? "default" : "destructive"} className="mt-4">
                {selectedAnswer === quiz[currentQuestion]?.answer ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <AlertTitle>{selectedAnswer === quiz[currentQuestion]?.answer ? 'Correct!' : 'Incorrect!'}</AlertTitle>
                <AlertDescription>
                  {selectedAnswer === quiz[currentQuestion]?.answer ? 'Great job! Moving to next question...' : `The correct answer is: ${quiz[currentQuestion]?.answer}`}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <h2 className="text-2xl font-bold">Quiz Completed!</h2>
            <Progress value={100} className="h-2" />
            <p className="text-xl">Final Score: {finalScore} out of {quiz.length}</p>
            <Button onClick={handleRetakeQuiz} className="mt-4">Retake Quiz</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
