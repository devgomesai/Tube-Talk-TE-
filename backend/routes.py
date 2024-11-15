from flask import Flask, request, jsonify
from flask_cors import CORS
from models import *

app = Flask(__name__)

CORS(app)

# creating instance
youtube = YouTube()

@app.route("/transcript", methods=["POST"])
def handle_url():
    data = request.get_json()  # Get the JSON data sent from the front-end
    youtube_url = data.get("url")

    transcript_of_video, video_title = youtube.get_transcription(youtube_url=youtube_url)

    # Vectorize and getting vectorstore
    vectorstore = youtube.create_vectorstore(transcript_of_video)
    
    # Respond back to the front-end
    return jsonify({"status": "success", "title": video_title, "transcript":transcript_of_video})

@app.route("/summary", methods=["GET"])
def handle_summary():
    summary = youtube.get_summary()
    if summary:
        return jsonify({"status": "success", "summary": summary})
    return jsonify({"status": "error", "message": "Summary generation failed."}), 400



# @app.route("/init-chat")
@app.route("/init-chat", methods=["POST"])
def init_chat():
    question = request.get_json().get("question")
    if youtube.vectordb:
        return jsonify({"status": "success", "message": "Chat initialized"})
    return jsonify({"status": "error", "message": "Vector store not initialized."}), 400

# @app.route("/chat")
@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    question = data.get("question")
    if youtube.vectordb:
        answer = youtube.generate_answer(youtube.vectordb, question)
        return jsonify({"status": "success", "answer": answer})
    return jsonify({"status": "error", "message": "Vector store not initialized."}), 400

# @app.route("/init-quiz")
@app.route("/init-quiz", methods=["POST"])
def init_quiz():
    if youtube.transcript:
        quiz = youtube.generate_quiz(youtube.transcript)
        return jsonify({"status": "success", "quiz": quiz})
    return jsonify({"status": "error", "message": "Transcript not available."}), 400

# @app.route("/ans")
@app.route("/ans", methods=["POST"])
def evaluate_answers():
    data = request.get_json()
    user_answers = data.get("answers")
    quiz = youtube.generate_quiz(youtube.transcript)

    correct_answers = [q["answer"] for q in quiz]
    score = sum(1 for ua, ca in zip(user_answers, correct_answers) if ua == ca)
    
    return jsonify({"status": "success", "score": score, "total": len(quiz)})


if __name__ == "__main__":  
    app.run(debug=True)
