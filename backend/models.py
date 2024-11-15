import os
import re
from typing import Tuple, Optional, List, Dict
from dataclasses import dataclass

import yt_dlp
import assemblyai as aai
from dotenv import load_dotenv
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv, find_dotenv


load_dotenv(override=True)


@dataclass
class Config:
    """Configuration class for file paths and API settings."""

    BASE_DIR: str = os.path.dirname(os.path.abspath(__file__))
    MEDIA_DIR: str = os.path.join(BASE_DIR, "media")
    TRANSCRIPT_DIR: str = os.path.join(BASE_DIR, "transcripts")
    FAISS_INDEX_DIR: str = os.path.join(BASE_DIR, "faiss_index")

    def __post_init__(self):
        """Create necessary directories after initialization."""
        for directory in [self.MEDIA_DIR, self.TRANSCRIPT_DIR, self.FAISS_INDEX_DIR]:
            os.makedirs(directory, exist_ok=True)


class YouTube:
    """A class for analyzing YouTube videos through transcription and AI-powered analysis."""

    def __init__(self):
        """Initialize the YouTubeAnalyzer with necessary configurations and models."""
        load_dotenv()
        self.config = Config()
        self.title = None
        self.vectordb = None
        self.transcript = None
        self._setup_ai_models()
        self._setup_assemblyai()

    def _setup_ai_models(self):
        """Initialize AI models for embeddings and text generation."""
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", dimensions=1536
        )
        self.llm = GoogleGenerativeAI(model="gemini-pro", temperature=0.1)

    def _setup_assemblyai(self):
        """Set up AssemblyAI configuration."""
        aai.settings.api_key = os.getenv("ASSEMBLYAI_API_KEY")

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Remove invalid characters from filename.

        Args:
            filename: Original filename

        Returns:
            Sanitized filename
        """
        sanitized = re.sub(r'[<>:"/\\|?*]', "", filename)
        return sanitized.replace(" ", "_")

    def save_transcript(self, transcript: str, video_title: str) -> str:
        """
        Save transcript to file.

        Args:
            transcript: Video transcript text
            video_title: Title of the video

        Returns:
            Path to saved transcript file
        """
        safe_title = self.sanitize_filename(video_title)
        transcript_path = os.path.join(self.config.TRANSCRIPT_DIR, f"{safe_title}.txt")
        try:
            with open(transcript_path, "w", encoding="utf-8") as f:
                f.write(transcript)
            return transcript_path
        except Exception as e:
            print(f"Error saving transcript: {str(e)}")
            return ""

    def download_audio(self, youtube_url: str) -> Tuple[Optional[str], Optional[str]]:
        """
        Download audio from YouTube URL.

        Args:
            youtube_url: URL of the YouTube video

        Returns:
            Tuple of (audio_file_path, video_title)
        """
        try:
            ydl_opts = {
                "format": "bestaudio/best",
                "outtmpl": os.path.join(self.config.MEDIA_DIR, "%(id)s.%(ext)s"),
                "postprocessors": [],
            }

            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                return (
                    os.path.join(self.config.MEDIA_DIR, f"{info['id']}.{info['ext']}"),
                    info["title"],
                )
        except Exception as e:
            print(f"Error downloading audio: {str(e)}")
            return None, None

    def get_transcription(self, youtube_url: str):
        """
        Get transcription from YouTube video.

        Args:
            youtube_url: URL of the YouTube video

        Returns:
            Tuple of (transcript_text, video_title)
        """
        audio_file, video_title = self.download_audio(youtube_url)
        if not audio_file:
            return None, None

        try:
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(audio_file)

            if transcript.text:
                transcript_path = self.save_transcript(transcript.text, video_title)
                if transcript_path:
                    print(f"Transcript saved to: {transcript_path}")

                # Store the values in class variables
                self.transcript = transcript.text
                self.title = video_title

            return transcript.text, video_title
        except Exception as e:
            print(f"Error transcribing audio: {str(e)}")
            return None, None

    def create_vectorstore(self, text: str) -> FAISS:
        """
        Create vector store from text.

        Args:
            text: Text to vectorize

        Returns:
            FAISS vector store
        """
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000, chunk_overlap=10, length_function=len
        )
        chunks = text_splitter.split_text(text)
        vectorstore = FAISS.from_texts(texts=chunks, embedding=self.embeddings)
        vectorstore.save_local(self.config.FAISS_INDEX_DIR)
        self.vectordb = vectorstore
        return vectorstore

    def generate_answer(self, vectorstore: FAISS, question: str, k: int = 5) -> str:
        """
        Generate answer using retrieval QA chain.

        Args:
            vectorstore: FAISS vector store
            question: User question
            k: Number of relevant chunks to retrieve

        Returns:
            Generated answer
        """
        prompt_template = PromptTemplate(
            template="""Context: {context}
            Question: {question}
            
            If the transcript doesn't contain relevant information, respond with:
            "I apologize, but the transcript doesn't contain information about that."
            """,
            input_variables=["context", "question"],
        )

        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(
                search_type="similarity", search_kwargs={"k": k}
            ),
            chain_type_kwargs={"prompt": prompt_template},
        )

        try:
            response = qa_chain(question)
            return response["result"]
        except Exception as e:
            print(f"Error generating answer: {str(e)}")
            return "Error generating the answer."

    def get_summary(self):
        """
        Generate a summary using stored transcript and title.

        Returns:
            Generated summary string or None if transcript/title not available
        """
        if not self.transcript or not self.title:
            print("No transcript or title available. Please transcribe a video first.")
            return None

        prompt = f"""
        "I have a YouTube video transcript:
        transcript: {self.transcript}
        Title: {self.title}
        Please summarize the content in a clear and concise manner, highlighting the main points and key takeaways.
        Ensure the summary captures the essence of the video without missing any critical details.
        Aim for a summary that is no more than 100 words.
        Start with the title and then the summary part"
        """
        try:
            response = self.llm.invoke(prompt)
            print(response)
            return response
        except Exception as e:
            print(f"Error generating summary: {str(e)}")
            return None
