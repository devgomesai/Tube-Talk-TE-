import os
import re
from typing import Tuple, Optional, List, Dict
from dataclasses import dataclass

import streamlit as st
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
        self._setup_ai_models()
        self._setup_assemblyai()
        
    def _setup_ai_models(self):
        """Initialize AI models for embeddings and text generation."""
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001",
            dimensions=1536
        )
        self.llm = GoogleGenerativeAI(model='gemini-pro', temperature=0.1)
        
    def _setup_assemblyai(self):
        """Set up AssemblyAI configuration."""
        aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')
        
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """
        Remove invalid characters from filename.
        
        Args:
            filename: Original filename
            
        Returns:
            Sanitized filename
        """
        sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
        return sanitized.replace(' ', '_')
        
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
            with open(transcript_path, 'w', encoding='utf-8') as f:
                f.write(transcript)
            return transcript_path
        except Exception as e:
            st.error(f"Error saving transcript: {str(e)}")
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
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(self.config.MEDIA_DIR, '%(id)s.%(ext)s'),
                'postprocessors': []
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                return (
                    os.path.join(self.config.MEDIA_DIR, f"{info['id']}.{info['ext']}"),
                    info['title']
                )
        except Exception as e:
            st.error(f"Error downloading audio: {str(e)}")
            return None, None
            
    def get_transcription(self, youtube_url: str) -> Tuple[Optional[str], Optional[str]]:
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
                    st.success(f"Transcript saved to: {transcript_path}")
                    
            return transcript.text, video_title
        except Exception as e:
            st.error(f"Error transcribing audio: {str(e)}")
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
            chunk_size=1000,
            chunk_overlap=10,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        vectorstore = FAISS.from_texts(texts=chunks, embedding=self.embeddings)
        vectorstore.save_local(self.config.FAISS_INDEX_DIR)
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
            template='''
            You are an insightful assistant analyzing a YouTube video transcript.
            Provide a focused, accurate answer to the question using only the provided context.
            Keep your response between 7-15 sentences.

            Context: {context}
            Question: {question}
            
            If the transcript doesn't contain relevant information, respond with:
            "I apologize, but the transcript doesn't contain information about that."
            ''',
            input_variables=["context", "question"]
        )
        
        qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            chain_type="stuff",
            retriever=vectorstore.as_retriever(
                search_type='similarity',
                search_kwargs={'k': k}
            ),
            chain_type_kwargs={"prompt": prompt_template}
        )
        
        try:
            response = qa_chain(question)
            return response['result']
        except Exception as e:
            st.error(f"Error generating answer: {str(e)}")
            return "I encountered an error while generating the answer."
            
    def generate_quiz(self, transcript: str) -> List[Dict]:
        """
        Generate quiz questions from transcript.
        
        Args:
            transcript: Video transcript text
            
        Returns:
            List of quiz questions with options and answers
        """
        try:
            quiz = self._generate_quiz_questions(transcript)
            
            if quiz:
                quiz_path = os.path.join(self.config.TRANSCRIPT_DIR, "summary_and_quiz.txt")
                with open(quiz_path, 'w', encoding='utf-8') as f:
                    f.write(str(quiz))
                st.success(f"Quiz saved to: {quiz_path}")
            
            return quiz
        except Exception as e:
            st.error(f"Error generating quiz: {str(e)}")
            return []
            
    def _generate_quiz_questions(self, transcript: str) -> List[Dict]:
        """
        Internal method to generate quiz questions.
        
        Args:
            transcript: Video transcript text
            
        Returns:
            List of quiz questions with options and answers
        """
        prompt = f"""
        Create 5 multiple-choice questions based on this transcript.
        Return them in this exact format:
        [
            {{"question": "Question text here?",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "answer": "Correct option here"}}
        ]
        Make sure the correct answer exactly matches one of the options.
        """
        
        response = self.llm.invoke(prompt + transcript)
        return eval(response)