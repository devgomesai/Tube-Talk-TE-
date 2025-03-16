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

const USE_API = false;

const staticQuiz: QuizQuestion[] = [
  {
    question: "What is the capital of France?",
    options: ["Paris", "London", "Berlin", "Madrid"],
    answer: "Paris"
  },
  {
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    answer: "4"
  },
  {
    question: "What is the largest planet in our solar system?",
    options: ["Earth", "Mars", "Jupiter", "Venus"],
    answer: "Jupiter"
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
      setQuiz(data.quiz.quiz);
      setCurrentQuestion(0);
      setScore(0);
      setFinalScore(0);
      setQuizCompleted(false);
      setSelectedAnswer('');
      setIsAnswered(false);
    } catch (error) {
      setQuiz([]);
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
        console.log(newScore)
        setQuizCompleted(true);
      }
    }, 1500);
  };

  const handleRetakeQuiz = () => {
    console.log("DEBUG: retake quiz");
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
      console.log("DEBUG: calling quiz");
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
  }, [open]);

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
