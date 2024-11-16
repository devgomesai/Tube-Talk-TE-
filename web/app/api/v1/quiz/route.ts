import { NextRequest, NextResponse } from "next/server";
import pb from "@/lib/db/pocket_base.config";

// Define types for better type safety
interface Quiz {
  questions: {
    question: string;
    options: string[];
    correct_answer: string;
  }[];
}

interface QuizRecord {
  id: string;
  platform: string;
  video_id: string;
  quiz: Quiz;
  created: string;
  updated: string;
}

interface PythonQuizResponse {
  status: string;
  message?: string | Quiz;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Extract and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const platform = searchParams.get('platform')?.trim()?.toLowerCase();
    const videoId = searchParams.get('id')?.trim();

    if (!platform || !videoId) {
      return NextResponse.json(
        { 
          status: false, 
          error: "Missing required parameters: platform and id must be provided" 
        },
        { status: 400 }
      );
    }

    // 2. Try to fetch existing quiz from PocketBase
    try {
      const record = await pb
        .collection("quizzes")
        .getFirstListItem<QuizRecord>(`platform="${platform}" && video_id="${videoId}"`);

      if (record?.quiz) {
        return NextResponse.json({
          status: true,
          questions: record.quiz
        });
      }
    } catch (error: any) {
      // Only proceed if the error is "record not found"
      if (error.status !== 404) {
        throw error;
      }
    }

    // 3. If no existing quiz, generate new one from Python backend
    const pythonResponse = await fetch("http://localhost:5000/init-quiz", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!pythonResponse.ok) {
      throw new Error(`Python backend error: ${pythonResponse.statusText}`);
    }

    const pythonData: PythonQuizResponse = await pythonResponse.json();
    console.log(pythonData)

    if (!pythonData.message || pythonData.status !== "success") {
      throw new Error(pythonData.message || "Failed to generate quiz from Python backend");
    }

    // 4. Store new quiz in PocketBase
    try {
      const savedQuiz = await pb.collection("quizzes").create({
        platform,
        video_id: videoId,
        questions: pythonData.message,
      });

      return NextResponse.json({
        status: true,
        questions: savedQuiz.quiz
      });
    } catch (error: any) {
      console.error("Failed to store quiz in PocketBase:", error);
      throw new Error("Failed to store generated quiz");
    }

  } catch (error: any) {
    console.error("Quiz generation error:", error);
    
    return NextResponse.json(
      {
        status: false,
        error: error.message || "Internal server error"
      },
      { 
        status: error.status || 500 
      }
    );
  }
}