'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle } from 'lucide-react'

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
}

interface Quiz {
  questions: QuizQuestion[];
}

enum Params {
  platform = "platform",
  id = "id"
}

export default function QuizComponent() {
  const searchParams = useSearchParams();
  const platform = searchParams.get(Params.platform);
  const videoId = searchParams.get(Params.id);
  const router = useRouter()

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
          setQuiz(data.quiz);
        } else {
          setError(data.message || 'Failed to load quiz');
        }
      } catch (err) {
        setError('Failed to fetch quiz');
      } finally {
        setLoading(false);
      }
    };

    if (platform && videoId) {
      fetchQuiz();
    } else {
      setError('Missing platform or video ID');
      setLoading(false);
    }
  }, [platform, videoId]);

  useEffect(() => {
    if (quizCompleted) {
      const redirectTimer = setTimeout(() => {
        if (platform && videoId) {
          router.push(`/user?platform=${platform}&id=${videoId}`)
        } else {
          router.push('/user')
        }
      }, 3000)

      return () => clearTimeout(redirectTimer)
    }
  }, [quizCompleted, router, platform, videoId])

  const handleSubmit = () => {
    if (quiz && selectedAnswer === quiz.questions[currentQuestion].answer) {
      setScore(score + 1)
    }
    setIsAnswered(true)
  }

  const handleNext = () => {
    if (quiz && currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  if (loading) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Loading quiz...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full max-w-lg mx-auto">
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  if (!quiz) {
    return null;
  }

  const isLastQuestion = currentQuestion === quiz.questions.length - 1

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-primary">Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        {!quizCompleted ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-primary">
              {quiz.questions[currentQuestion].question}
            </h2>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {quiz.questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                  <Label htmlFor={`option-${index}`} className="text-secondary-foreground">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
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
                    ? 'Great job!'
                    : `The correct answer is: ${quiz.questions[currentQuestion].answer}`}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Quiz Completed!</h2>
            <p className="text-xl mb-4 text-secondary-foreground">
              Your score: {score} out of {quiz.questions.length}
            </p>
            <p className="text-muted-foreground">Redirecting to user page in 3 seconds...</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        {!quizCompleted && (
          isAnswered ? (
            <Button onClick={handleNext} variant="default">
              {isLastQuestion ? 'Finish' : 'Next Question'}
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!selectedAnswer} variant="default">
              Submit Answer
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  )
}
