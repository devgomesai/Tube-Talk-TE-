from fastapi import FastAPI, HTTPException, Depends, Request, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any
from dotenv import load_dotenv
import os
from urllib.parse import urlparse, parse_qs
from youtube_transcript_api import YouTubeTranscriptApi
import yt_dlp
from langchain_community.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import assemblyai as aai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import create_tool_calling_agent
from langchain.tools import Tool
from langchain.prompts import ChatPromptTemplate
import google.auth.exceptions
import pandas as pd
import json  
import re

load_dotenv()

app = FastAPI()

# CORS (Cross-Origin Resource Sharing) middleware to allow requests from web browsers
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins (for development, restrict in production)
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Global state (in-memory, consider a database or cache for production)
video_data_store: Dict[str, Dict[str, Any]] = {}

# API Keys - read from environment variables
gemini_api_key = os.getenv("GEMINI_API_KEY")
assemblyai_api_key = os.getenv("ASSEMBLYAI_API_KEY")

if assemblyai_api_key:
    aai.api_key = assemblyai_api_key

# Initialize Embeddings & LLM (only once when the app starts)
def get_embeddings():
    if not gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API key is required but not configured.")
    try:
        return GoogleGenerativeAIEmbeddings(model="models/text-embedding-004", google_api_key=gemini_api_key)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing embeddings: {str(e)}")

def get_llm():
    if not gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API key is required but not configured.")
    try:
        return ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=gemini_api_key,
            temperature=0.2,
            max_output_tokens=1024
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error initializing Gemini: {str(e)}")

embeddings = get_embeddings()
llm = get_llm()

# Helper function to extract YouTube video ID (reused)
def get_video_id(url):
    parsed_url = urlparse(url)
    if parsed_url.hostname in ["www.youtube.com", "youtube.com"]:
        return parse_qs(parsed_url.query).get("v", [None])[0]
    elif parsed_url.hostname == "youtu.be":
        return parsed_url.path[1:]
    return None

# Get YouTube video title using yt-dlp (reused, but no status updates now)
def get_youtube_title(video_url):
    try:
        video_id = get_video_id(video_url)
        if not video_id:
            return "Unknown Title"

        ydl_opts = {'quiet': True}
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=False)
            title = info.get('title', 'Unknown Title')
            return title
    except Exception as e:
        return "Unknown Title"

# Tool: Get YouTube Transcript (reused, no status updates, returns directly)
def get_youtube_transcript(video_url):
    video_id = get_video_id(video_url)
    if not video_id:
        return "Invalid YouTube URL"
    try:
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        if not transcript or len(transcript) == 0:
            return "Transcript is empty"

        full_text = ""
        for entry in transcript:
            timestamp = entry["start"]
            minutes = int(timestamp // 60)
            seconds = int(timestamp % 60)
            text = entry["text"]
            full_text += f"[{minutes:02d}:{seconds:02d}] {text} "
        return full_text
    except Exception as e:
        return f"Failed to get transcript: {str(e)}"

# Tool: Download YouTube Audio (reused, no status updates, returns directly)
def download_audio(youtube_url):
    try:
        video_id = get_video_id(youtube_url)
        if not video_id:
            return "Invalid YouTube URL", None
        audio_dir = "audio"
        os.makedirs(audio_dir, exist_ok=True)
        ydl_opts = {
            "format": "bestaudio/best",
            "outtmpl": f"{audio_dir}/{video_id}.%(ext)s",
        }
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(youtube_url, download=True)
            return f"{audio_dir}/{video_id}.{info['ext']}", info.get("title", "Unknown Title")
    except Exception as e:
        return f"Audio download failed: {str(e)}", None

# Tool: Transcribe Audio with AssemblyAI (reused, no status updates, returns directly)
def get_transcription(youtube_url):
    if not aai.api_key:
        return "AssemblyAI API key is required for transcription", None

    video_id = get_video_id(youtube_url)
    if not video_id:
        return "Invalid YouTube URL", None

    transcripts_dir = os.path.join(os.getcwd(), "transcripts")
    os.makedirs(transcripts_dir, exist_ok=True)
    transcript_path = os.path.join(transcripts_dir, f"{video_id}.txt")

    if os.path.exists(transcript_path):
        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript_text = f.read()
        video_title = get_youtube_title(youtube_url) # Fetch title even if transcript is cached
        return transcript_text, video_title

    audio_file, video_title = download_audio(youtube_url)
    if isinstance(audio_file, str) and audio_file.startswith("Audio download failed"):
        return audio_file, None

    transcriber = aai.Transcriber()
    config = aai.TranscriptionConfig(
        speaker_labels=True,
        punctuate=True,
        format_text=True
    )
    transcript_obj = transcriber.transcribe(audio_file, config)

    if transcript_obj.text:
        with open(transcript_path, "w", encoding="utf-8") as f:
            f.write(transcript_obj.text)
        return transcript_obj.text, video_title

    return "Failed to generate transcript", None

# Tool: Create FAISS Vector Store (reused and adapted, no status updates)
def create_vectorstore(text, video_id):
    if embeddings is None:
        raise HTTPException(status_code=500, detail="Embeddings service not initialized.")

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1500,
        chunk_overlap=200,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    chunks = text_splitter.split_text(text)

    metadatas = [{"source": "transcript", "chunk": i, "total_chunks": len(chunks)}
                for i in range(len(chunks))]

    vectorstore = FAISS.from_texts(
        texts=chunks,
        embedding=embeddings,
        metadatas=metadatas
    )
    video_data_store[video_id]['vectorstore'] = vectorstore
    print(f"Vector store CREATED for video_id: {video_id}")
    return "VectorDB created successfully"

# Tool: Chat with Video (reused and adapted, no status updates)
def chat_with_video(query, video_id):
    print(f"Chat request received for video_id: {video_id}")
    if llm is None:
        raise HTTPException(status_code=500, detail="LLM service not initialized.")
    if video_id not in video_data_store or 'vectorstore' not in video_data_store[video_id] or video_data_store[video_id]['vectorstore'] is None:
        print(f"No vector store FOUND for video_id: {video_id}") 
        raise HTTPException(status_code=400, detail="No vector database available for this video. Process video first.")

    vectorstore = video_data_store[video_id]['vectorstore']
    video_title = video_data_store[video_id].get('video_title', 'Unknown Title')

    try:
        docs = vectorstore.similarity_search(query, k=7)
        context_parts = []
        for i, doc in enumerate(docs):
            context = doc.page_content
            metadata = doc.metadata
            context_parts.append(f"Context {i+1}: {context}")

        context = "\n\n".join(context_parts)

        print(query)

        prompt = f"""
You are an AI assistant specialized in answering questions about YouTube videos based on their transcripts. You can also respond in the user's preferred language.

### 🎬 Video Details:
- **📌 Title:** {video_title}
- **📜 Context from the video based on the user Query:** {context}
- **❓ User's Question:** {query}

### 📌 Instructions:
1. **🔍 Answer strictly based on the provided context.** No assumptions or extra details.
2. **⏳ Use timestamps (e.g., 🕒 06:52 - 07:55) if present** to reference specific moments.
3. **⚠️ If the context lacks enough information, clearly state what is missing.** No guessing.
4. **✍️ Keep the response clear, engaging, and structured.** Use bullet points and formatting to improve readability.
5. **🌍 Detect the user's input language from {query} and respond in the same language.**
6. **💬 Make it feel natural and conversational.** Avoid robotic tone—keep it user-friendly!
7. **🎭 Add emojis based on the context.**

### ✅ Your Answer:
"""
        response = llm.invoke(prompt)
        return response.content
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating answer: {str(e)}")

# Tool: Summarize YouTube Video (reused and adapted, no status updates)
def summarize_video(video_id):
    if llm is None:
        raise HTTPException(status_code=500, detail="LLM service not initialized.")
    if video_id not in video_data_store or 'transcript' not in video_data_store[video_id] or not video_data_store[video_id]['transcript']:
        raise HTTPException(status_code=400, detail="No transcript available. Process video first.")

    transcript = video_data_store[video_id]['transcript']
    video_title = video_data_store[video_id].get('video_title', 'Unknown Title')

    prompt = f"""
You are an expert at summarizing YouTube videos.

Video Title: {video_title}

Transcript: {transcript[:50000]}
Instructions:
1. Provide a concise, well-structured summary of the video (100 words).
2. Begin with a one-sentence overview of what the video is about.
3. Identify and summarize 3-5 key points or topics discussed in the video.
4. Include any important conclusions or takeaways.
5. Organize the summary with clear paragraph breaks and bullet points where appropriate.
6. If timestamps are available in the transcript ([MM:SS]), include the most important ones.

Your summary:
"""
    response = llm.invoke(prompt)
    return response.content

# Tool: Generate Quiz from YouTube Video (reused and adapted, no status updates)
def generate_quiz(video_id):
    if llm is None:
        raise HTTPException(status_code=500, detail="LLM service not initialized.")
    if video_id not in video_data_store or 'transcript' not in video_data_store[video_id] or not video_data_store[video_id]['transcript']:
        raise HTTPException(status_code=400, detail="No transcript available. Process video first.")

    transcript = video_data_store[video_id]['transcript']
    video_title = video_data_store[video_id].get('video_title', 'Unknown Title')

    prompt = f"""
You are an expert educator. Based on the following YouTube video transcript and title, please generate a five-question multiple choice quiz.

Video Title: {video_title}
Transcript: {transcript[:50000]}  # Use first 50K characters if transcript is too long

Instructions:
1. Create 5 meaningful multiple-choice questions that test understanding of key concepts from the video.
2. For each question, provide 4 options (A, B, C, D) with only one correct answer.
3. Ensure questions vary in difficulty from basic recall to critical thinking.
4. Make sure to follow this EXACT format for each question and answer:
   - Each question should have options labeled exactly as "A. [option text]", "B. [option text]", etc.
   - The correct answer should be just the letter (A, B, C, or D).
5. Format the output as a valid JSON object with EXACTLY this structure - this is critical:

{{
    "quiz": [
        {{"question": "Question text here", "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"], "answer": "A"}},
        {{"question": "Question text here", "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"], "answer": "C"}},
        ...and so on for all 5 questions
    ]
}}

IMPORTANT: Your response must be ONLY the JSON object with no additional text or explanations before or after it.
"""
    response = llm.invoke(prompt)
    quiz_text = response.content # Get the raw text content from the LLM response

    # Process the response to extract just the JSON part (from Streamlit code)
    json_match = re.search(r'```json\s*(.*?)\s*```', quiz_text, re.DOTALL)
    if json_match:
        quiz_text = json_match.group(1)
    else:
        # Look for any JSON-like structure if no code block
        json_match = re.search(r'({.*})', quiz_text, re.DOTALL)
        if json_match:
            quiz_text = json_match.group(1)

    # Validate the JSON and parse it
    try:
        quiz_json_data = json.loads(quiz_text)  # This will raise an exception if invalid
        return quiz_json_data # Return the parsed JSON data
    except json.JSONDecodeError as e:
        print(f"Warning: Quiz content was not valid JSON after extraction. Error: {e}")
        return {"quiz_text": quiz_text, "error": "JSONDecodeError"} # Return raw text and error info


# Intelligent Transcript Acquisition Logic (reused and adapted, no status updates)
def smart_get_transcript(url):
    transcript = get_youtube_transcript(url)
    if transcript and not transcript.startswith("Failed") and not transcript.startswith("Invalid") and not transcript.startswith("Transcript is empty"):
        return transcript, get_youtube_title(url)

    transcript, title = get_transcription(url)
    if transcript and not transcript.startswith("Failed") and not transcript.startswith("Audio download failed"):
        return transcript, title

    return None, None

# Direct video processing function (reused and adapted, no status updates, manages state)
def process_video(url):
    video_id = get_video_id(url)
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube URL.")

    # If video is already processed with vectorstore, return success immediately
    if (video_id in video_data_store and 
        'vectorstore' in video_data_store[video_id] and 
        video_data_store[video_id]['vectorstore'] is not None):
        return {
            "message": "Video already processed", 
            "video_title": video_data_store[video_id].get('video_title', 'Unknown Title'),
            "video_id": video_id
        }

    if video_id not in video_data_store:
        video_data_store[video_id] = {}

    video_title = get_youtube_title(url)
    video_data_store[video_id]['video_title'] = video_title

    transcript, title = smart_get_transcript(url)
    if title: # In case AssemblyAI was used and title was fetched there
        video_data_store[video_id]['video_title'] = title

    if transcript:
        video_data_store[video_id]['transcript'] = transcript
        create_vectorstore(transcript, video_id)
        return {"message": "Video processing complete", "video_title": video_title, "video_id": video_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to process video - could not obtain transcript.")

# --- FastAPI Routes ---

@app.post("/process_video/")
async def process_video_route(request: Request):
    """Processes a YouTube video by fetching the transcript and creating a vector store."""
    try:
        form_data = await request.form() # Expects form data for video_url
        video_url = form_data.get("video_url")

        if not video_url:
            raise HTTPException(status_code=400, detail="Video URL is required.")

        result = process_video(video_url)
        return JSONResponse(content=result)
    except HTTPException as e:
        return JSONResponse(content={"detail": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

@app.post("/chat_with_video/")
async def chat_with_video_route(request: Request):
    """Chats with a processed YouTube video using a query."""
    try:
        form_data = await request.form() # Expects form data for video_id and query
        video_id = form_data.get("video_id")
        query = form_data.get("query")

        if not video_id:
            raise HTTPException(status_code=400, detail="Video ID is required.")
        if not query:
            raise HTTPException(status_code=400, detail="Query is required.")

        answer = chat_with_video(query, video_id)
        return JSONResponse(content={"answer": answer})
    except HTTPException as e:
        # Explicitly return detail from HTTPException in JSON response for 4xx errors
        return JSONResponse(content={"detail": e.detail}, status_code=e.status_code)
    except Exception as e:
        # For 500 errors, still return a generic error but include exception string for server-side logs
        print(f"Server error in chat_with_video_route: {e}") # Log server-side error
        return JSONResponse(content={"detail": "Internal server error"}, status_code=500)

@app.post("/summarize_video/")
async def summarize_video_route(request: Request):
    """Summarizes a processed YouTube video."""
    try:
        form_data = await request.form() # Expects form data for video_id
        video_id = form_data.get("video_id")

        if not video_id:
            raise HTTPException(status_code=400, detail="Video ID is required.")

        summary = summarize_video(video_id)
        return JSONResponse(content={"summary": summary})
    except HTTPException as e:
        return JSONResponse(content={"detail": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)

@app.post("/generate_quiz/")
async def generate_quiz_route(request: Request):
    """Generates a quiz for a processed YouTube video."""
    try:
        form_data = await request.form() # Expects form data for video_id
        video_id = form_data.get("video_id")

        if not video_id:
            raise HTTPException(status_code=400, detail="Video ID is required.")

        quiz = generate_quiz(video_id)
        return JSONResponse(content={"quiz": quiz})
    except HTTPException as e:
        return JSONResponse(content={"detail": e.detail}, status_code=e.status_code)
    except Exception as e:
        return JSONResponse(content={"detail": str(e)}, status_code=500)


@app.get("/health/")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True) # reload=True for development