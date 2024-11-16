'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

interface QuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform?: string | null;
  videoId?: string | null;
}

export default function QuizDialog({ open, onOpenChange, platform, videoId }: QuizDialogProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/v1/quiz?platform=${platform}&id=${videoId}`);
        const data = await response.json();

        if (data.status === 'success' && data.quiz) {
          setQuiz(data);
        } else {
          setError(data.message || 'Failed to load quiz');
        }
      } catch (err) {
        setError('Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    };

    if (open && platform && videoId) {
      fetchQuiz();
    }

    // Reset states when dialog opens
    return () => {
      if (!open) {
        setCurrentQuestion(0);
        setSelectedAnswer('');
        setIsAnswered(false);
        setScore(0);
        setQuizCompleted(false);
        setLoading(true);
        setError(null);
      }
    };
  }, [open, platform, videoId]);
  useEffect(() => {
    if (isAnswered && quiz) {
      const isCorrect = selectedAnswer === quiz.questions[currentQuestion].answer;
      if (isCorrect) {
        setScore(prevScore => prevScore + 1);
      }
    }
  }, [isAnswered, selectedAnswer, quiz, currentQuestion]);

  const handleSubmit = () => {
    if (quiz) {
      const isCorrect = selectedAnswer === quiz.questions[currentQuestion].answer;
      const newScore = isCorrect ? score + 1 : score;
      setScore(newScore);
    }
    setIsAnswered(true);

    // Auto-advance after 1.5 seconds
    setTimeout(() => {
      if (quiz && currentQuestion < quiz.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer('');
        setIsAnswered(false);
      } else {
        setQuizCompleted(true);
      }
    }, 1500);
  };
  useEffect(() => {
    if (quizCompleted) {
      const timer = setTimeout(() => {
        onOpenChange(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [quizCompleted, onOpenChange]);

  const isLastQuestion = quiz ? currentQuestion === quiz.questions.length - 1 : false;
  const progress = quiz ? ((currentQuestion + 1) / quiz.questions.length) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => {
        if (!quizCompleted) {
          e.preventDefault();
        }
      }}>
        <DialogHeader>
          <DialogTitle>Quiz Challenge</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">Loading quiz...</p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : quiz && (
          <div>
            {!quizCompleted ? (
              <>
                <div className="space-y-4">
                  {/* Question counter and progress bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Question {currentQuestion + 1} of {quiz.questions.length}</span>
                      <span>Score: {score}</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-xl font-bold">
                      {quiz.questions[currentQuestion].question}
                    </h2>
                    <RadioGroup
                      value={selectedAnswer}
                      onValueChange={(value) => {
                        setSelectedAnswer(value);
                        // Auto-submit after selection
                        if (!isAnswered) {
                          handleSubmit();
                        }
                      }}
                    >
                      {quiz.questions[currentQuestion].options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                          <Label htmlFor={`option-${index}`} className={
                            isAnswered
                              ? option === quiz.questions[currentQuestion].answer
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
                  </div>

                  {isAnswered && (
                    <Alert
                      variant={selectedAnswer === quiz.questions[currentQuestion].answer ? "default" : "destructive"}
                      className="mt-4"
                    >
                      {selectedAnswer === quiz.questions[currentQuestion].answer ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      <AlertTitle>
                        {selectedAnswer === quiz.questions[currentQuestion].answer ? 'Correct!' : 'Incorrect!'}
                      </AlertTitle>
                      <AlertDescription>
                        {selectedAnswer === quiz.questions[currentQuestion].answer
                          ? 'Great job! Moving to next question...'
                          : `The correct answer is: ${quiz.questions[currentQuestion].answer}`}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-6 space-y-4">
                <h2 className="text-2xl font-bold">Quiz Completed!</h2>
                <Progress value={100} className="h-2" />
                <p className="text-xl">
                  Final Score: {score} out of {quiz.questions.length}
                </p>
                <p className="text-muted-foreground">Dialog will close in 3 seconds...</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
