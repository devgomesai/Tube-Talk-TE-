import pb from "@/lib/db/pocket_base.config";
import { NextRequest, NextResponse } from "next/server";

type Params = Promise<{
  platform: string;
  id: string;
}>

export async function GET(request: NextRequest) {

  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform')?.trim()?.toLowerCase();
  const video_id = searchParams.get('id')?.trim();
  try {
    if (!platform || !video_id) {
      return NextResponse.json(
        { status: "error", message: "Missing platform or video ID" },
        { status: 400 }
      );
    }

    // Search for the quiz in PocketBase
    let record;
    try {
      record = await pb.collection("quizzes").getFirstListItem(`platform="${platform}" && video_id="${video_id}"`);
    } catch (error: any) {
      // If no quiz is found, we proceed to generate one
      if (!error.response || error.response.code !== 404) {
        console.error("Error querying PocketBase:", error);
        return NextResponse.json(
          { status: "error", message: "Error querying PocketBase" },
          { status: 500 }
        );
      }
    }
    if (record) {
      // If the quiz exists, return it
      return NextResponse.json({ status: "success", quiz: record.quiz });
    }

    // If no quiz is found, query the Python backend
    const pythonResponse = await fetch("http://localhost:5000/init-quiz", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });


    if (!pythonResponse.ok) {
      const errorMessage = await pythonResponse.json();
      return NextResponse.json(
        { status: "error", message: errorMessage.message || "Failed to generate quiz" },
        { status: 500 }
      );
    }

    const pythonData = await pythonResponse.json();

    if (pythonData.status !== "success" || !pythonData.quiz) {
      return NextResponse.json(
        { status: "error", message: "Failed to generate quiz" },
        { status: 500 }
      );
    }

    // Store the generated quiz in PocketBase
    try {
      const savedQuiz = await pb.collection("quizzes").create({
        platform,
        video_id,
        quiz: pythonData.quiz,
      });

      return NextResponse.json({ status: "success", quiz: savedQuiz.quiz });
    } catch (error) {
      console.error("Error storing quiz in PocketBase:", error);
      return NextResponse.json(
        { status: "error", message: "Failed to store generated quiz" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error handling quiz request:", error);
    return NextResponse.json(
      { status: "error", message: "Internal server error" },
      { status: 500 }
    );
  }
}
