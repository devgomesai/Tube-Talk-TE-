'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle2, XCircle } from 'lucide-react'

// Quiz data
const quizData = [
  {
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    answer: "Paris"
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Venus", "Jupiter", "Saturn"],
    answer: "Mars"
  },
  {
    question: "Who painted the Mona Lisa?",
    options: ["Vincent van Gogh", "Leonardo da Vinci", "Pablo Picasso", "Michelangelo"],
    answer: "Leonardo da Vinci"
  }
]

enum Params {
  platform = "platform",
  id = "id"
}

export default function Component() {
  const searchParams = useSearchParams();
  const platform = searchParams.get(Params.platform);
  const videoId = searchParams.get(Params.id);
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState('')
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (quizCompleted) {
      const redirectTimer = setTimeout(() => {
        if (platform && videoId) {
          router.push(`/user?platform=${platform}&id=${videoId}`)
        } else {
          router.push('/user')
        }
      }, 3000) // Redirect after 3 seconds

      return () => clearTimeout(redirectTimer)
    }
  }, [quizCompleted, router])

  const handleSubmit = () => {
    if (selectedAnswer === quizData[currentQuestion].answer) {
      setScore(score + 1)
    }
    setIsAnswered(true)
  }

  const handleNext = () => {
    if (currentQuestion < quizData.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer('')
      setIsAnswered(false)
    } else {
      setQuizCompleted(true)
    }
  }

  const isLastQuestion = currentQuestion === quizData.length - 1

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-primary">Quiz</CardTitle>
      </CardHeader>
      <CardContent>
        {!quizCompleted ? (
          <>
            <h2 className="text-xl font-bold mb-4 text-primary">{quizData[currentQuestion].question}</h2>
            <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
              {quizData[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <RadioGroupItem value={option} id={`option-${index}`} disabled={isAnswered} />
                  <Label htmlFor={`option-${index}`} className="text-secondary-foreground">{option}</Label>
                </div>
              ))}
            </RadioGroup>
            {isAnswered && (
              <Alert variant={selectedAnswer === quizData[currentQuestion].answer ? "default" : "destructive"} className="mt-4">
                {selectedAnswer === quizData[currentQuestion].answer ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {selectedAnswer === quizData[currentQuestion].answer ? 'Correct!' : 'Incorrect!'}
                </AlertTitle>
                <AlertDescription>
                  {selectedAnswer === quizData[currentQuestion].answer
                    ? 'Great job!'
                    : `The correct answer is: ${quizData[currentQuestion].answer}`}
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-primary">Quiz Completed!</h2>
            <p className="text-xl mb-4 text-secondary-foreground">Your score: {score} out of {quizData.length}</p>
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
