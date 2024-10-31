import os
import streamlit as st
from langchain.vectorstores import FAISS
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings, GoogleGenerativeAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate
from dotenv import load_dotenv
import yt_dlp
import assemblyai as aai
import re
from typing import Tuple, Optional, List, Dict

# Load environment variables
load_dotenv()
aai.settings.api_key = os.getenv('ASSEMBLYAI_API_KEY')

# Constants - Updated to match your project structure
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MEDIA_DIR = os.path.join(BASE_DIR, "media")
TRANSCRIPT_DIR = os.path.join(BASE_DIR, "transcripts")
FAISS_INDEX_DIR = os.path.join(BASE_DIR, "faiss_index")

# Ensure directories exist
for directory in [MEDIA_DIR, TRANSCRIPT_DIR, FAISS_INDEX_DIR]:
    os.makedirs(directory, exist_ok=True)

class TranscriptProcessor:
    def __init__(self):
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model="models/embedding-001", 
            dimensions=1536
        )
        self.llm = GoogleGenerativeAI(model='gemini-pro', temperature=0.1)
        
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Remove invalid characters from filename."""
        # Replace spaces with underscores and remove invalid characters
        sanitized = re.sub(r'[<>:"/\\|?*]', '', filename)
        return sanitized.replace(' ', '_')

    def save_transcript(self, transcript: str, video_title: str) -> str:
        """Save transcript to the transcripts directory."""
        safe_title = self.sanitize_filename(video_title)
        transcript_path = os.path.join(TRANSCRIPT_DIR, f"{safe_title}.txt")
        try:
            with open(transcript_path, 'w', encoding='utf-8') as f:
                f.write(transcript)
            return transcript_path
        except Exception as e:
            st.error(f"Error saving transcript: {str(e)}")
            return ""

    def download_audio(self, youtube_url: str) -> Tuple[Optional[str], Optional[str]]:
        """Download audio from YouTube URL."""
        try:
            ydl_opts = {
                'format': 'bestaudio/best',
                'outtmpl': os.path.join(MEDIA_DIR, '%(id)s.%(ext)s'),
                'postprocessors': []
            }
            
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(youtube_url, download=True)
                return (
                    os.path.join(MEDIA_DIR, f"{info['id']}.{info['ext']}"),
                    info['title']
                )
        except Exception as e:
            st.error(f"Error downloading audio: {str(e)}")
            return None, None

    def get_transcription(self, youtube_url: str) -> Tuple[Optional[str], Optional[str]]:
        """Get transcription from YouTube video and save it."""
        audio_file, video_title = self.download_audio(youtube_url)
        if not audio_file:
            return None, None

        try:
            transcriber = aai.Transcriber()
            transcript = transcriber.transcribe(audio_file)
            
            # Save transcript to file
            if transcript.text:
                transcript_path = self.save_transcript(transcript.text, video_title)
                if transcript_path:
                    st.success(f"Transcript saved to: {transcript_path}")
                
            return transcript.text, video_title
        except Exception as e:
            st.error(f"Error transcribing audio: {str(e)}")
            return None, None

    def create_vectorstore(self, text: str) -> FAISS:
        """Create vector store from text."""
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=10,
            length_function=len
        )
        chunks = text_splitter.split_text(text)
        vectorstore = FAISS.from_texts(texts=chunks, embedding=self.embeddings)
        vectorstore.save_local(FAISS_INDEX_DIR)
        return vectorstore

    def generate_answer(self, vectorstore: FAISS, question: str, k: int = 5) -> str:
        """Generate answer using retrieval QA chain."""
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
        """Generate quiz questions from transcript."""
        try:
            # Generate quiz questions
            quiz = self._generate_quiz_questions(transcript)
            
            # Save quiz to transcripts directory
            if quiz:
                quiz_path = os.path.join(TRANSCRIPT_DIR, "summary_and_quiz.txt")
                with open(quiz_path, 'w', encoding='utf-8') as f:
                    f.write(str(quiz))  # Convert quiz to string format
                st.success(f"Quiz saved to: {quiz_path}")
            
            return quiz
        except Exception as e:
            st.error(f"Error generating quiz: {str(e)}")
            return []

    def _generate_quiz_questions(self, transcript: str) -> List[Dict]:
        """Internal method to generate quiz questions."""
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
        return eval(response)  # Convert string response to Python object

def main():
    st.set_page_config(page_title='YouTube Video Analyzer', page_icon='🎥')
    
    # Initialize processor and session state
    processor = TranscriptProcessor()
    for key in ['transcript', 'vectorstore', 'quiz']:
        if key not in st.session_state:
            st.session_state[key] = None

    # Sidebar
    with st.sidebar:
        youtube_url = st.text_input('Enter YouTube URL:')
        if st.button('Process Video'):
            if youtube_url:
                with st.spinner('Processing video...'):
                    transcript, title = processor.get_transcription(youtube_url)
                    if transcript and title:
                        st.session_state.transcript = transcript
                        st.session_state.vectorstore = processor.create_vectorstore(transcript)
                        st.session_state.quiz = processor.generate_quiz(transcript)
                        st.success('Video processed successfully!')
                    else:
                        st.error('Failed to process video.')
            else:
                st.warning('Please enter a YouTube URL.')

    # Main content
    st.title("YouTube Video Analyzer")
    
    if st.session_state.transcript:
        # Q&A Section
        st.header("Ask Questions")
        question = st.text_input('Enter your question:')
        if question and st.session_state.vectorstore:
            answer = processor.generate_answer(st.session_state.vectorstore, question)
            st.write(answer)

        # Quiz Section
        if st.session_state.quiz:
            st.header("Quiz")
            for i, q in enumerate(st.session_state.quiz):
                st.subheader(f"Question {i+1}")
                st.write(q['question'])
                answer = st.radio(
                    "Select your answer:",
                    q['options'],
                    key=f"q_{i}"
                )
                if st.button('Check Answer', key=f"check_{i}"):
                    if answer == q['answer']:
                        st.success("Correct!")
                    else:
                        st.error(f"Incorrect. The correct answer is: {q['answer']}")

if __name__ == '__main__':
    main()