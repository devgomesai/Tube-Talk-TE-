from flask import Flask, request, jsonify
from flask_cors import CORS
from models import *  # Assuming the 'models' file contains the YouTube class and related functions

app = Flask(__name__)

CORS(app)

global vectorstore
# Create instance of YouTube
youtube = YouTube()

@app.route("/transcript", methods=["POST"])
def handle_url():
    data = request.get_json()  # Get the JSON data sent from the front-end
    youtube_url = data.get("url")

    if not youtube_url:
        return jsonify({"status": "error", "message": "You must provide a valid YouTube URL."}), 400

    transcript_of_video, video_title = youtube.get_transcription(youtube_url=youtube_url)

    if not transcript_of_video:
        return jsonify({"status": "error", "message": "Failed to generate transcript."}), 400

    # Store vector store as global
    global vectorstore
    vectorstore = youtube.create_vectorstore(transcript_of_video)
    
    return jsonify({"status": "success", "title": video_title, "transcript": transcript_of_video})

@app.route("/summary", methods=["GET"])
def handle_summary():
    summary = youtube.get_summary()
    if summary:
        return jsonify({"status": "success", "summary": summary})
    return jsonify({"status": "error", "message": "Summary generation failed."}), 400

@app.route("/init-chat", methods=["POST"])
def init_chat():
    data = request.get_json()
    question = data.get("question")
    if vectorstore and question:  # Check if global vectorstore is initialized
        return jsonify({"status": "success", "message": "Chat initialized"})
    return jsonify({"status": "error", "message": "Vector store not initialized or no question provided."}), 400

@app.route("/chat", methods=["GET"])
def chat():
    global youtube  # Ensure the youtube instance is accessed globally

    # Get the question directly from query parameters
    question = request.args.get("question")

    # Error handling for missing question parameter
    if not question:
        return jsonify({"status": "error", "message": "No question provided."}), 400

    # Check if the vectorstore is initialized
    if not youtube.vectordb:
        return jsonify({"status": "error", "message": "Vectorstore not initialized."}), 400

    try:
        # Call the qna_on_yt_video method and pass the quaestion and the youtube.vectordb
        answer = youtube.qna_on_yt_video(question)
        return jsonify({"status": "success", "answer": answer})
    except Exception as e:
        return jsonify({"status": "error", "message": f"Error during Q&A: {str(e)}"}), 500

    

@app.route("/init-quiz", methods=["GET"])
def init_quiz():
    if youtube.transcript:
        quiz = youtube.generate_quiz() 
        if quiz:
            return jsonify({"status": "success", "message": quiz})  
        return jsonify({"status": "error", "message": "Failed to generate quiz."}), 400
    return jsonify({"status": "error", "message": "Transcript not available."}), 400

@app.route("/ans", methods=["POST"])
def evaluate_answers():
    data = request.get_json()
    user_answers = data.get("answers")
    if not user_answers:
        return jsonify({"status": "error", "message": "No answers provided."}), 400
    # Logic for evaluating the answers can be added here
    return jsonify({"status": "success", "message": "Answers received."})

if __name__ == "__main__":
    app.run(debug=True)
