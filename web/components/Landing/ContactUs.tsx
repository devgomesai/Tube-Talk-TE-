"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Github, Instagram, Linkedin, Twitter } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Define form schema
const formSchema = z.object({
  email: z.string().email("Invalid email address"),
})

// Infer form values type
type FormValues = z.infer<typeof formSchema>

export default function ContactUs() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  })

  // Handle form submission
  async function onSubmit(data: FormValues) {
    setIsSubmitting(true)
    try {
      // Simulate an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSubmitted(true)
      form.reset()
    } catch (error) {
      console.error("Error submitting form:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main id="contact" className="w-full max-w-lg mx-auto px-4 mt-32 mb-32">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Get in Touch
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-[500px] mx-auto">
            Have a question or want to work together? Drop your email below and
            we'll get back to you as soon as possible.
          </p>
        </div>

        {submitted ? (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900">
            <AlertDescription className="text-center py-4">
              Thank you for your message! We'll get back to you soon.
            </AlertDescription>
          </Alert>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        )}

        <div className="flex justify-center space-x-6 pt-4">
          <Link
            href="#"
            aria-label="Twitter"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
          >
            <Twitter className="h-6 w-6" />
          </Link>
          <Link
            href="#"
            aria-label="Instagram"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
          >
            <Instagram className="h-6 w-6" />
          </Link>
          <Link
            href="#"
            aria-label="LinkedIn"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
          >
            <Linkedin className="h-6 w-6" />
          </Link>
          <Link
            href="#"
            aria-label="GitHub"
            className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 transition-colors"
          >
            <Github className="h-6 w-6" />
          </Link>
        </div>
      </div>
    </main>
  )
}

